import api from "../lib/api";

export const getDocs = () => api.get("/documents");

export const documentService = {
  uploadDocument: async (formData) => {
    const response = await api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getAllDocuments: async () => {
    const response = await api.get("/documents");
    return response.data;
  },

  getDocumentById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get("/documents");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  upload: async (file, { title }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    const response = await api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};