import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', notificationSchema);