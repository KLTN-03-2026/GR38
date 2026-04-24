import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Vui lòng nhập tiêu đề tài liệu"],
      trim: true,
    },
    // BỔ SUNG: Trường lưu ảnh bìa từ Cloudinary
    thumbnail: {
      type: String,
      default: null, 
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String, // Trả về URL để Frontend tải/xem file (VD: http://localhost:8000/uploads/...)
      required: true,
    },
    // BỔ SUNG: Trường lưu đường dẫn vật lý trên ổ cứng để backend gọi lệnh fs.unlink xóa file
    localPath: {
      type: String, 
    },
    fileSize: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
      default: "",
    },
    chunks: [
      {
        content: {
          type: String,
          required: true,
        },
        pageNumber: {
          type: Number,
          default: 0,
        },
        chunkIndex: {
          type: Number,
          required: true,
        },
      },
    ],
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],  
      default: "processing",
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ userId: 1, createdAt: -1 });
const Document = mongoose.model("Document", documentSchema);
export default Document;