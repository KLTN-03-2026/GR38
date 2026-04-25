import mongoose from "mongoose";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import path from "path"; 
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
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Vui lòng cung cấp tiêu đề cho tài liệu",
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`; 

    // Fix encoding tên file tiếng Việt
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    const document = new Document({
      userId: req.user._id,
      title,
      thumbnail: thumbnail || null, 
      fileName: originalName,
      filePath: fileUrl,
      localPath: req.file.path, 
      fileSize: req.file.size,
      status: "processing",
    });

    await document.save();

    // Xử lý PDF chạy ngầm (Không dùng await để block request)
    processPDF(document.id, req.file.path).catch((err) => {
      console.error("Lỗi xử lý PDF:", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Tài liệu đang được xử lý. Vui lòng kiểm tra lại sau vài phút.",
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);
    const chunks = chunkText(text, 500, 50);

    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });

    console.log(`Tài liệu ${documentId} đã được xử lý thành công.`);
  } catch (error) {
    console.error(`Lỗi xử lý tài liệu ${documentId}:`, error);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

//@desc Chỉnh sửa thông tin tài liệu (Tiêu đề, ảnh bìa)
// @route PUT /api/documents/:id
// @access Private (Teacher)
export const updateDocument = async (req, res, next) => {
  try {
    const { title } = req.body;

    // 1. Tìm tài liệu và kiểm tra quyền sở hữu (chỉ người tải lên mới được sửa)
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy tài liệu hoặc bạn không có quyền chỉnh sửa",
        statusCode: 404,
      });
    }

    // 2. Cập nhật tiêu đề nếu có gửi lên
    if (title) {
      document.title = title;
    }

    // 3. Nếu có file ảnh bìa mới được upload qua Multer/Cloudinary
    if (req.file) {
      document.thumbnail = req.file.path;
    }

    // 4. Lưu thay đổi vào Database
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

//@desc Lấy danh sách tài liệu của người dùng (Teacher: tất cả, Learner: chỉ ready)
// @route GET /api/documents
// @access Private
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
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcardSets" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};
// @desc Lấy chi tiết một tài liệu (kèm số lượng flashcard/quiz)
// @route GET /api/documents/:id
// @access Private (Teacher: chỉ tài liệu của mình, Learner: chỉ tài liệu ready)
export const getDocument = async (req, res, next) => {
  try {
    let query = { _id: req.params.id };

    if (req.user.role === 'TEACHER') {
      query.userId = req.user._id;
    }
    if (req.user.role === 'LEARNER') {
      query.status = "ready";
    }

    const document = await Document.findOne(query);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tài liệu',
      });
    }

    const flashcardCount = await Flashcard.countDocuments({ documentId: document._id });
    const quizCount = await Quiz.countDocuments({ documentId: document._id });

    await Document.updateOne(
      { _id: document._id },
      { $set: { lastAccessed: Date.now() } }
    );

    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData
    });
  } catch (error) {
    next(error);
  }
};
// @desc Xóa tài liệu (và các flashcard/quiz liên quan)
// @route DELETE /api/documents/:id
// @access Private (Teacher: chỉ tài liệu của mình, Admin: tất cả)
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id 
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tài liệu hoặc không có quyền xóa',
      });
    }

    // Cập nhật lại logic xóa file PDF cục bộ
    if (document.localPath) {
      // Nếu có lưu localPath, dùng luôn
      await fs.unlink(document.localPath).catch((err) => console.log("File PDF không tồn tại trên ổ cứng:", err.message));
    } else if (document.filePath) {

      const fileName = document.filePath.split('/').pop(); 
      const localFilePath = path.resolve('upload/documents', fileName);
      await fs.unlink(localFilePath).catch(() => {});
    }

    // Xóa tài liệu khỏi database
    await document.deleteOne();

    // Xóa các flashcard và quiz liên quan
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