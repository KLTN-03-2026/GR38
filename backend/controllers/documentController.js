import mongoose from "mongoose";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";


// @desc Tải lên tài liệu PDF mới
// @route POST /api/documents/upload-pdf
// @access Private (Teacher)
export const uploadsDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng tải file PDF",
      });
    }

    const { title, thumbnail } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng cung cấp tiêu đề cho tài liệu",
      });
    }

    // Fix encoding tên file tiếng Việt
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    const document = new Document({
      userId: req.user._id,
      title,
      thumbnail: thumbnail || null, 
      fileName: originalName,
      filePath: req.file.path, 
      localPath: null, 
      fileSize: req.file.size,
      status: "processing",
    });

    await document.save();

    // Xử lý PDF chạy ngầm 
    processPDF(document.id, req.file.path).catch((err) => {
      console.error("Lỗi xử lý PDF ngầm:", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Tài liệu đang được xử lý. Vui lòng kiểm tra lại sau vài phút.",
    });
  } catch (error) {
    next(error);
  }
};

const processPDF = async (documentId, pdfUrl) => {
  try {
    // Đọc text trực tiếp từ link Cloudinary
    const { text } = await extractTextFromPDF(pdfUrl);
    const chunks = chunkText(text, 500, 50);

    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });

    console.log(`Tài liệu ${documentId} đã được xử lý và chia nhỏ thành công.`);
  } catch (error) {
    console.error(` Lỗi xử lý tài liệu ${documentId}:`, error);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

// @desc Chỉnh sửa thông tin tài liệu
export const updateDocument = async (req, res, next) => {
  try {
    const { title } = req.body;

    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy tài liệu hoặc bạn không có quyền chỉnh sửa",
      });
    }

    if (title) document.title = title;
    if (req.file) document.thumbnail = req.file.path;

    await document.save();

    res.status(200).json({
      success: true,
      message: "Đã cập nhật thông tin tài liệu thành công",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Lấy danh sách tài liệu
export const getDocuments = async (req, res, next) => {
  try {
    let matchQuery = {};

    if (req.user.role === 'TEACHER') {
      matchQuery = { userId: new mongoose.Types.ObjectId(req.user._id) };
    } else if (req.user.role === 'LEARNER') {
      matchQuery = { status: "ready" };
    }

    const documents = await Document.aggregate([
      { $match: matchQuery },
      { $lookup: { from: "flashcards", localField: "_id", foreignField: "documentId", as: "flashcardSets" } },
      { $lookup: { from: "quizzes", localField: "_id", foreignField: "documentId", as: "quizzes" } },
      { $addFields: { flashcardCount: { $size: "$flashcardSets" }, quizCount: { $size: "$quizzes" } } },
      { $project: { extractedText: 0, chunks: 0, flashcardSets: 0, quizzes: 0 } },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    next(error);
  }
};

// @desc Lấy chi tiết một tài liệu
export const getDocument = async (req, res, next) => {
  try {
    let query = { _id: req.params.id };

    if (req.user.role === 'TEACHER') query.userId = req.user._id;
    if (req.user.role === 'LEARNER') query.status = "ready";

    const document = await Document.findOne(query);

    if (!document) return res.status(404).json({ success: false, error: 'Không tìm thấy tài liệu' });

    const flashcardCount = await Flashcard.countDocuments({ documentId: document._id });
    const quizCount = await Quiz.countDocuments({ documentId: document._id });

    await Document.updateOne({ _id: document._id }, { $set: { lastAccessed: Date.now() } });

    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({ success: true, data: documentData });
  } catch (error) {
    next(error);
  }
};

// @desc Xóa tài liệu
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tài liệu hoặc không có quyền xóa' });
    }

    // Xóa record trong database
    await document.deleteOne();
    await Flashcard.deleteMany({ documentId: document._id });
    await Quiz.deleteMany({ documentId: document._id });

    res.status(200).json({
      success: true,
      message: 'Xóa tài liệu và các bài tập liên quan thành công'
    });
  } catch (error) {
    next(error);
  }
};