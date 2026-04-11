import mongoose from "mongoose";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import flashcard from "../models/Flashcard.js";

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
        status: "Xử lý",
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
        messeage:
          "Tài liệu đang được xử lý. Vui lòng kiểm tra lại sau vài phút.",
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
      chunks,
      status: "Đã xử lý",
    });
    console.log(`Document ${documentId} đã được xử lý thành công.`);
  } catch (error) {
    console.error("Lỗi xử lý PDF:", error);
    await Document.findByIdAndUpdate(documentId, {
      status: "Lỗi xử lý",
    });
  }
};

//@desc Get all user documents
// @route GET /api/documents
// @access Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
        {
            $match: {userId: new mongoose.Types.ObjectId(req.user._id)}   
        },
        {
            $lookup : {
                from: 'flashcards',
                localField: '_id',
                foreignField: 'documentId',
                as: 'flashcardSets' 
            }
        },
        {
            $lookup : {
                from: 'quizzes',
                localField: '_id',
                foreignField: 'documentId',
                as: 'quizzes' 
            }
        },
        {
            $addFields: {
                flashcardCount: { $size: 'flashcardSets' },
                quizCount: { $size: 'quizzes' }
            }
        },
        {
            $project: {
                extractedText: 0,
                chunks: 0,
                flashcardSets: 0,
                quizzes: 0
            }
        },
        {
            $sort: { upLoadDate: -1}
        }
    ]);

    res.status(200).json({
        success: true,
        count: documents.length,
        data: documents
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
  } catch (error) {}
};

//@desc Delete document
// @route DELETE /api/documents/:id
// @access Private
export const deleteDocument = async (req, res, next) => {
  try {
  } catch (error) {}
};

//@desc Update document title
// @route Put /api/documents/:id
// @access Private
export const updateDocument = async (req, res, next) => {
  try {
  } catch (error) {}
};
