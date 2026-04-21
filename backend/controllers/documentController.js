import mongoose from "mongoose";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";

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
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Vui lòng cung cấp tiêu đề cho tài liệu",
        statusCode: 400,
      });
    }

    const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // ✅ Fix encoding tên file tiếng Việt
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    const document = new Document({
      userId: req.user._id,
      title,
      fileName: originalName,
      filePath: fileUrl,
      fileSize: req.file.size,
      status: "processing",
    });

    await document.save();

    processPDF(document.id, req.file.path).catch((err) => {
      console.error("Lỗi xử lý PDF:", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Tài liệu đang được xử lý. Vui lòng kiểm tra lại sau vài phút.",
      statusCode: 201,
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
        statusCode: 404
      });
    }

    const flashcardCount = await Flashcard.countDocuments({ documentId: document._id });
    const quizCount = await Quiz.countDocuments({ documentId: document._id });

    // ✅ Dùng updateOne thay vì save() để tránh lỗi validation
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

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tài liệu',
        statusCode: 404
      });
    }

    await fs.unlink(document.filePath).catch(() => {});
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Xóa tài liệu thành công'
    });
  } catch (error) {
    next(error);
  }
};