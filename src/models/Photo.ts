import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoto extends Document {
  id: string;
  title: string;
  description: string;
  year: number;
  image_url: string;
  thumbnail_url: string;
  category: string;
  location: string;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema = new Schema<IPhoto>(
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
    image_url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    thumbnail_url: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
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

export default mongoose.models.Photo || mongoose.model<IPhoto>('Photo', PhotoSchema);
