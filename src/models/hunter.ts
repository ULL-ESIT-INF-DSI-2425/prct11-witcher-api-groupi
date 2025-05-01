import { Document, Schema, model } from 'mongoose';
import { UserDocumentInterface } from './user.js';
import validator from 'validator';

interface HunterDocumentInterface extends Document {
  name: string,
  location: string,
  breed?: 'Humano' | 'Elfo' | 'Enano' | 'Hechicero',
  owner: UserDocumentInterface,
}

const HunterSchema = new Schema<HunterDocumentInterface>({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate: (value: string) => {
    if (!validator.default.isAlphanumeric(value)) {
        throw new Error('El nombre del cliente sólo puede contener caracteres alfanuméricos');
      }
    },
  },
  location: {
    type: String,
    trim: true,
    required: true,
  },
  breed: {
    type: String,
    trim: true,
    default: 'Humano',
    enum:['Humano','Elfo','Enano','Hechicero'],
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
});
export const Hunter = model<HunterDocumentInterface>('Hunter', HunterSchema);