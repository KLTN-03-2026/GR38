import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        // 1. Lấy thông báo
        const notificationsCollection = mongoose.connection.collection('notifications');
        const dbNotifications = await notificationsCollection.find({}).toArray();
        const notificationTitles = dbNotifications.map(n => n.title);

        // 2. Lấy tài liệu gợi ý (Phúc thêm đoạn này cho chuyên nghiệp)
        const docsCollection = mongoose.connection.collection('documents');
        const dbDocs = await docsCollection.find({}).toArray();
        const docTitles = dbDocs.map(d => d.title);

        res.status(200).json({
            success: true,
            data: {
                notifications: notificationTitles,
                learningProgress: 80, // Để 80% cho giống thiết kế của Phúc
                suggestedDocs: docTitles.length > 0 ? docTitles : ["Đang tải tài liệu..."]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;