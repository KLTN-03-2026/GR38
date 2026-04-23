import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const getAuthHeader = () => {
  const raw = localStorage.getItem("token");
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    const token = parsed.access_token ?? parsed;
    return { Authorization: `Bearer ${token}` };
  } catch {
    return { Authorization: `Bearer ${raw}` };
  }
};

export const documentService = {
  // POST /api/v1/documents/upload
  // response: { success, data: document, message }
  uploadDocument: async (formData) => {
    const response = await axios.post(`${API_URL}/documents/upload`, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // GET /api/v1/documents
  // response: { success, count, data: [...] }
  getAllDocuments: async () => {
    const response = await axios.get(`${API_URL}/documents`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // GET /api/v1/documents/{id}
  // response: { success, data: {...} }
  getDocumentById: async (id) => {
    const response = await axios.get(`${API_URL}/documents/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // DELETE /api/v1/documents/{id}
  // response: { success, message }
  deleteDocument: async (id) => {
    const response = await axios.delete(`${API_URL}/documents/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // ── Alias dùng trong DocumentsPage.jsx & DocumentsDetailPage.jsx ────

  // DocumentsPage:       const res = await documentService.getAll()
  //                      setDocs(res.data ?? [])
  // Backend trả về:      { success, count, data: [...] }
  getAll: async () => {
    const response = await axios.get(`${API_URL}/documents`, {
      headers: getAuthHeader(),
    });
    return response.data; // { success, count, data: [...] }
  },

  // DocumentsDetailPage: const res = await documentService.getById(id)
  //                      setDoc(res.data)
  // Backend trả về:      { success, data: {...} }
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/documents/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data; // { success, data: {...} }
  },

  // DocumentsPage:       await documentService.delete(deleteTarget.id)
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/documents/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // DocumentsPage:       await documentService.upload(file, { title })
  upload: async (file, { title }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    const response = await axios.post(`${API_URL}/documents/upload`, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};