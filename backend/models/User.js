import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'vui lòng nhập tên người dùng'],
        unique: true,
        trim: true,
        minlength: [3, 'Tên người dùng phải có ít nhất 3 ký tự']
    },
    email: {
        type: String,
        required: [true, 'vui lòng nhập email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Vui lòng nhập địa chỉ email hợp lệ']
    },
    password: {
        type: String,
        required: [true, 'vui lòng nhập mật khẩu'],
        minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    },
    isApproved: {
        type: Boolean,
        default: function() {
            if (this.role === 'student') return true;
            if (this.role === 'teacher') return false;
            return false;
        }
    },
    profileImage: {
        type: String,
        default: null
    }, 
}, {
    timestamps: true
});

// Hash password trước khi lưu
userSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        return;
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Phương thức kiểm tra mật khẩu
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);  
};

const User = mongoose.model('User', userSchema);

export default User;