import api from "../lib/api";

export const quizService = {
  getAll: async (documentId) => {
    const res = await api.get(`/quizzes/document/${documentId}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/quizzes/quiz/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/quizzes", {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      time_limit: data.timeLimit,
      questions: data.questions,
    });
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/quizzes/${id}`, {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      time_limit: data.timeLimit,
      questions: data.questions,
    });
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/quizzes/${id}`);
    return res.data;
  },

  submit: async (quizId, answers) => {
    const res = await api.post(`/quizzes/${quizId}/submit`, { answers });
    return res.data;
  },

  getResults: async (quizId) => {
    const res = await api.get(`/quizzes/${quizId}/results`);
    return res.data;
  },
};