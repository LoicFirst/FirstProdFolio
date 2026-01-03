import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  id: string;
  title: string;
  description: string;
  year: number;
  video_url: string;
  thumbnail_url: string;
  duration: string;
  category: string;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    video_url: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    thumbnail_url: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);
