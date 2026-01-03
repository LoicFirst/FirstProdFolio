import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface IContact extends Document {
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  social: ISocialLink[];
  availability: {
    status: string;
    message: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      location: { type: String, required: true },
    },
    social: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        icon: { type: String, required: true },
      },
    ],
    availability: {
      status: { type: String, required: true, default: 'available' },
      message: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
