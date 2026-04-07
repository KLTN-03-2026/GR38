import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Kết nối MongoDB: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Lỗi kết nối với MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;