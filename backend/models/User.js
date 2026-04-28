import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const USER_ROLES = Object.freeze({
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  LEARNER: "LEARNER",
});

export const TEACHER_APPROVAL_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
});

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Vui lòng nhập họ tên"],
      trim: true,
      minlength: [3, "Họ tên phải có ít nhất 3 ký tự"],
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Vui lòng nhập địa chỉ email hợp lệ"],
    },
    password: {
      type: String,
      required: function () {
        return this.authType === "local";
      },
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.LEARNER,
    },
    teacherApprovalStatus: {
      type: String,
      enum: Object.values(TEACHER_APPROVAL_STATUS),
      default: function () {
        return this.role === USER_ROLES.TEACHER
          ? TEACHER_APPROVAL_STATUS.PENDING
          : TEACHER_APPROVAL_STATUS.APPROVED;
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      default:
        "https://res.cloudinary.com/dynbuqe3g/image/upload/v1777091786/user-a-solid-svgrepo-com_qsu3s6.png",
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    lastStudyDate: {
      type: Date,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    authType: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  // Nếu pass không đổi hoặc là Google login (không có pass), bỏ qua và đi tiếp
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Đánh index để tăng tốc truy vấn
userSchema.index({ role: 1, teacherApprovalStatus: 1, isActive: 1 });

const User = mongoose.model("User", userSchema);

export default User;
