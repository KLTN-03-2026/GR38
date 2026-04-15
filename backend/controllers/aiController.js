import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";

//@desc Tạo flashcard từ tài liệu
//@router POST/api/ai/generate-flashcards
//@access Private
export const generateFlashcard = async (req, res, next) => {
  try {
    
  } catch (error) {
    next(error);
  }
};

//@desc Tạo Quiz từ tài liệu
//@router POST/api/ai/generate-quiz
//@access Private
export const generateQuiz = async (req, res, next) => {
  try {
    
  } catch (error) {
    next(error);
  }
};

//@desc Tóm tắt tài liệu
//@router POST/api/ai/generate-summaryy
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
