import { Document, Schema, model } from 'mongoose';
import validator from 'validator';

interface HunterDocumentInterface extends Document {
  name: string,
  location: string,
  race?: 'Humano' | 'Elfo' | 'Enano' | 'Hechicero'
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
  race: {
    type: String,
    trim: true,
    default: 'Humano',
    enum:['Humano','Elfo','Enano','Hechicero'],
  }
});
export const Hunter = model<HunterDocumentInterface>('Hunter', HunterSchema);