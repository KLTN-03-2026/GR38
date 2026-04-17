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
      status: 'ready'
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
      teacherId: req.user._id,
      documentId: document._id,
      title: `${document.title} - Flashcards`,
      description: `Bộ flashcard được tạo tự động từ tài liệu ${document.title}`,
      cards: cards.map(card => ({
        front: card.question,
        back: card.answer,
        difficulty: card.difficulty,
      })),
      isPublished: false,
      tags: []
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
      status: 'ready'
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
   questions.forEach(q => {
        // Xóa khoảng trắng thừa ở đầu và cuối của đáp án đúng
        q.correctAnswer = q.correctAnswer.trim();
        // Xóa khoảng trắng thừa ở tất cả các lựa chọn
        q.options = q.options.map(opt => opt.trim());
        // Nếu AI lỡ trả về "A", "B", "C", "D"
        if (["A", "B", "C", "D"].includes(q.correctAnswer) && q.options.length === 4) {
             const indexMap = { "A": 0, "B": 1, "C": 2, "D": 3 };
             q.correctAnswer = q.options[indexMap[q.correctAnswer]];
        }

        // Bảo hiểm không crash Server nếu đáp án đúng không nằm trong lựa chọn (dù đã cố gắng sửa ở trên)
        if (!q.options.includes(q.correctAnswer)) {
            const fallbackOption = q.options.find(opt => opt.includes(q.correctAnswer) || q.correctAnswer.includes(opt));
            q.correctAnswer = fallbackOption || q.options[0]; 
        }
    });
    //Lưu quiz vào database
    const quizSet = await Quiz.create({
      teacherId: req.user._id,
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
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp documentId',
        statusCode: 400
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      status: 'ready'
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tài liệu hoặc chưa được xử lý',
        statusCode: 404
      });
    }

    //Tạo tóm tắt bằng Gemini
    const summary = await geminiService.generateSummary(document.extractedText);

    res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        summary
      },
      message: 'Tóm tắt đã được tạo thành công',
    });
  } catch (error) {
    next(error);
  }
};

//@desc Chat
//@router POST/api/ai/chat
//@access Private
export const chat = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp documentId và question',
        statusCode: 400
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      status: 'ready'
    });

    if(!document) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tài liệu hoặc chưa được xử lý',
        statusCode: 404
      });
    }

    //Tìm các đoạn văn liên quan
    const relevantChunks = findRelevantChunks(document.chunks, question, 3);//3 là số đoạn văn liên quan tối đa
    const chunkIndices = relevantChunks.map(c => c.chunkIndex);

    //Lấy hoặc tạo lịch sử chat
    let chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: document._id
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user._id,
        documentId: document._id,
        messages: []
      });
    }

    //Tạo câu trả lời bằng Gemini
    const answer = await geminiService.chatWithContext(question, relevantChunks);

    //Lưu tin nhắn vào lịch sử chat
    chatHistory.messages.push(
      {
        role: 'user',
        content: question,
        timestamp: new Date(),
        relevantChunks: []
      },
      {
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
        relevantChunks: chunkIndices
      }
    );

    await chatHistory.save();

    res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        relevantChunks: chunkIndices,
        chatHistoryId: chatHistory._id
      },
      message: 'Câu trả lời đã được tạo thành công',
    });
  } catch (error) {
    next(error);
  }
};

//@desc Giải thích khái niệm từ tài liệu
//@router POST/api/ai/explain-concept
//@access Private
export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;

    if (!documentId || !concept) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp documentId và concept',
        statusCode: 400
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      status: 'ready'
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tài liệu hoặc chưa được xử lý',
        statusCode: 404
      });
    }

    //Tìm các đoạn văn liên quan
    const relevantChunks = findRelevantChunks(document.chunks, concept, 3);//3 là số đoạn văn liên quan tối đa
    const context = relevantChunks.map(c => c.content).join('\n\n');

    //Tạo giải thích bằng Gemini
    const explanation = await geminiService.explainConcept(concept, context);

    res.status(200).json({
      success: true,
      data: {
        concept,
        explanation,
        relevantChunks: relevantChunks.map(c => c.chunkIndex)
      },
      message: 'Giải thích đã được tạo thành công',
    });
  } catch (error) {
    next(error);
  }
};

//@desc Lịch sử chat
//@router POST/api/ai/chat-history/:documentId
//@access Private
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if(!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp documentId',
        statusCode: 400
      });
    }

    const chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: documentId
    }).select('messages'); // Chỉ trả về tin nhắn

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        data: [], //Trả về mảng rỗng nếu không có lịch sử chat
        message: 'Không tìm thấy lịch sử chat cho tài liệu này'
      });
    }

    res.status(200).json({
      success: true,
      data: chatHistory.messages,
      message: 'Lịch sử chat đã được lấy thành công'
    });
  } catch (error) {
    next(error);
  }
};
