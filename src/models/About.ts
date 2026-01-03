import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement {
  year: number;
  title: string;
  event: string;
}

export interface ISoftware {
  name: string;
  level: number;
  icon: string;
}

export interface ISkill {
  category: string;
  items: string[];
}

export interface IAbout extends Document {
  profile: {
    name: string;
    title: string;
    bio: string;
    photo_url: string;
    experience_years: number;
    location: string;
  };
  skills: ISkill[];
  software: ISoftware[];
  achievements: IAchievement[];
  createdAt: Date;
  updatedAt: Date;
}

const AboutSchema = new Schema<IAbout>(
  {
    profile: {
      name: { type: String, required: true },
      title: { type: String, required: true },
      bio: { type: String, required: true },
      photo_url: { type: String, default: '' },
      experience_years: { type: Number, required: true },
      location: { type: String, required: true },
    },
    skills: [
      {
        category: { type: String, required: true },
        items: [{ type: String }],
      },
    ],
    software: [
      {
        name: { type: String, required: true },
        level: { type: Number, required: true, min: 0, max: 100 },
        icon: { type: String, required: true },
      },
    ],
    achievements: [
      {
        year: { type: Number, required: true },
        title: { type: String, required: true },
        event: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.About || mongoose.model<IAbout>('About', AboutSchema);
