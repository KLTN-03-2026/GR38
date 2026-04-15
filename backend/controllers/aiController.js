import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";

//@desc Tạo flashcard từ tài liệu
//@router POST/api/ai/generate-flashcards
//@access Private
export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp documentId',
        statusCode: 400
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'Đã xử lý'
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tài liệu hoặc chưa được xử lý',
        statusCode: 404
      });
    }

    //Tạo flashcard bằng Gemini
    const cards = await geminiService.generateFlashcards(
      document.extractedText, 
      parseInt(count)
    );

    //Lưu flashcard vào database
    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: cards.map(card => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false,
      }))
    });

    res.status(200).json({
      success: true,
      data: flashcardSet,
      message: 'Flashcards đã được tạo thành công',
    });

  } catch (error) {
    next(error);
  }
};

//@desc Tạo Quiz từ tài liệu
//@router POST/api/ai/generate-quiz
//@access Private
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numQuestions = 5, title } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp documentId',
        statusCode: 400
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'Đã xử lý'
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tài liệu hoặc chưa được xử lý',
        statusCode: 404
      });
    }

    //Tạo quiz bằng Gemini
    const questions = await geminiService.generateQuiz(
      document.extractedText, 
      parseInt(numQuestions)
    );

    //Lưu quiz vào database
    const quizSet = await Quiz.create({
      userId: req.user._id,
      documentId: document._id,
      title: title ||`${document.title} - Quiz`,
      questions: questions,
      totalQuestions : questions.length,
      userAnswers: [],
      score: 0
    });

    res.status(200).json({
      success: true,
      data: quizSet,  
      message: 'Quiz đã được tạo thành công',
    });

  } catch (error) {
    next(error);
  }
};

//@desc Tóm tắt tài liệu
//@router POST/api/ai/generate-summary
//@access Private
export const generateSummary = async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
};

//@desc Chat
//@router POST/api/ai/chat
//@access Private
export const chat = async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
};

//@desc Giải thích khái niệm từ tài liệu
//@router POST/api/ai/explain-concept
//@access Private
export const explainConcept = async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
};

//@desc Lịch sử chat
//@router POST/api/ai/chat-history/:documentId
//@access Private
export const getChatHistory = async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
};
