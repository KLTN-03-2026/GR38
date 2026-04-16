import mongoose from "mongoose";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import flashcard from "../models/Flashcard.js";
import { count, error } from "console";

//@desc Upload PDF document
// @route POST /api/documents/upload
// @access Private
export const uploadsDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng tải file PDF",
        statusCode: 400,
      });
    }

    const { title } = req.body;
    if (!title) {
      //Xóa file đã tải lên nếu không có tiêu đề
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Vui lòng cung cấp tiêu đề cho tài liệu",
        statusCode: 400,
      });
    }
    //Xây dựng đường dẫn file đã tải lên
    const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    //Tạo document mới trong MongoDB
    const document = new Document({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl, //Lưu trữ URL thay vì đường dẫn vật lý
      fileSize: req.file.size,
      status: "processing",
    });

    await document.save();

    //Quá trình xử lý PDF có thể mất thời gian, nên chúng ta sẽ trả về phản hồi ngay và xử lý PDF trong nền
    processPDF(document.id, req.file.path).catch((err) => {
      console.error("Lỗi xử lý PDF:", err);
      //Cập nhật trạng thái lỗi cho document
    });

    res.status(201).json({
      success: true,
      data: document,
      messeage: "Tài liệu đang được xử lý. Vui lòng kiểm tra lại sau vài phút.",
      statusCode: 201,
    });
  } catch (error) {
    // Xóa file đã tải lên nếu có lỗi
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

//Giúp xử lý PDF trong nền sau khi trả về phản hồi cho người dùng
const processPDF = async (documentId, filePath) => {
  try {
    //Trích xuất văn bản từ PDF
    const { text } = await extractTextFromPDF(filePath);

    //Tạo chunck văn bản
    const chunks = chunkText(text, 500, 50);

    //Cập nhật document với các chunk đã tạo
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });
    console.log(`Tài liệu ${documentId} đã được xử lý thành công.`);
  } catch (error) {
    console.error(`Lỗi xử lý tài liệu ${documentId}:`, error);
    await Document.findByIdAndUpdate(documentId, {
      status: "false",
    });
  }
};

//@desc Get all user documents
// @route GET /api/documents
// @access Private
export const getDocuments = async (req, res, next) => {
  try {

    let matchQuery = {};
    if (req.user.role === 'Teacher') {
        // Giáo viên: Chỉ thấy tài liệu do mình tải lên
        matchQuery = { userId: new mongoose.Types.ObjectId(req.user._id) };
    } else if (req.user.role === 'Learner') {
        // Học sinh: Thấy tất cả tài liệu đã được AI xử lý xong
        matchQuery = { status: "ready" }; 
    }

    const documents = await Document.aggregate([
      {
        $match: matchQuery,
      },
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
      {
        $sort: { createdAt: -1 },
      },
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

//@desc Get single document with chunks
// @route GET /api/documents/:id
// @access Private
export const getDocument = async (req, res, next) => {
  try {

    let query = { _id: req.params.id };
    
    // Nếu là giáo viên thì mới cần check userId, Học sinh thì được xem tự do
    if (req.user.role === 'Teacher') {
        query.userId = req.user._id;
    }

    const document = await Document.findOne({
      _id: req.params.id,
      
    });

    if(!document) {
      return res.status(404).json({
        success: false,
        error:'Không tìm thấy tài liệu',
        statusCode: 404
      });
    }

    //Tính số lượng flashcard và quizzes liên quan
    const flashcardCount = await Flashcard.countDocuments({ documentId: document._id });
    const quizCount = await Quiz.countDocuments({ documentId: document._id });
    
    //Cập nhật truy cập lần cuối
    document.lastAccessed = Date.now();
    await document.save();

    //Kết hợp dữ liệu tài liệu với số liệu thống kê
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

//@desc Delete document
// @route DELETE /api/documents/:id
// @access Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if(!document) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tài liệu',
        statusCode: 404 
      });
    }

    //Xóa file khỏi hệ thống tập tin
    await fs.unlink(document.filePath).catch(()=>{});

    //Xóa Document
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Xóa tài liệu thành công'
    });

  } catch (error) {
    next(error);
  }
};