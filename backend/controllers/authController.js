import jwt from "jsonwebtoken"
import User from "../models/User.js"

//JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE || "7d"
    });
};

//@desc Register new user
//@route POST /api/auth/register
//@access Public
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        //Kiểm tra xem người dùng đã tồn tại chưa
        const userExists = await User.findOne ({ $or: [{email}] });

        if(userExists) {
            return res.status(400).json({
                success: false,
                error:
                    userExists.email === email
                    ?"Email đã được sử dụng"
                    :"Tên người dùng đã được sử dụng",
                statusCode: 400,
            })
        }

        //Tạo người dùng mới
        const user = await User.create({
            username,
            email,
            password,
        });

        //Tạo token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user:{
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createAt: user.createdAt,
                },
                token,
            },
            message: "Đăng ký thành công",
        });
    } catch (error) {
        next(error);
    }
};

//@desc Login user
//@route POST /api/auth/login
//@access Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        //Xác nhận nhập liệu
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng nhập email và mật khẩu",
                statusCode: 400,
            });
        }

        //Kiểm tra người dùng tồn tại(bao gồm password cho việc so sánh)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Email hoặc mật khẩu không đúng",
                statusCode: 401,
            });
        }

        //Kiểm tra mật khẩu
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Email hoặc mật khẩu không đúng",
                statusCode: 401,
            });
        }

        //Tạo token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt,
                },
                token,
            },
            message: "Đăng nhập thành công",
        });
    } catch (error) {
        next(error);
    }       
};

//@desc Get user profile
//@route GET /api/auth/profile
//@access Private
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updateAt: user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

//@desc Update user profile
//@route PUT /api/auth/profile
//@access Private
export const updateProfile = async (req, res, next) => {
    try {
        const { username, email, profileImage } = req.body;

        const user = await User.findById(req.user._id);
        //Cập nhật thông tin người dùng
        if (username) user.username = username;
        if (email) user.email = email;
        if (profileImage) user.profileImage = profileImage;

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            message: "Cập nhật thông tin thành công",
        });
    } catch (error) {
        next(error);
    }
};

//@desc Change password
//@router POST /api/auth/change-password
//@access Private
export const changePassword = async (req, res, next) => {
    try {
       const { currentPassword, newPassword } = req.body;

       if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            error: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới",
            statusCode: 400,
        });
       }
       
        const user = await User.findById(req.user._id).select('+password');
        //Kiểm tra mật khẩu hiện tại
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Mật khẩu hiện tại không đúng",
                statusCode: 401,
            });
        }

        //Cập nhật mật khẩu mới
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Đổi mật khẩu thành công",
        });

    } catch (error) {
        next(error);
    }
};

