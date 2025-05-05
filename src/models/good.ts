import { Document, Schema, model } from 'mongoose';
import { UserDocumentInterface } from './user.js';
import validator from 'validator';

interface GoodDocumentInterface extends Document {
  name: string,
  description: string,
  material?: 'Acero de Mahakam' | 'Cuero endurecido' | 'Esencia mágica' | 'Mutágenos de bestias antiguas',
  weight?: number,
  value_in_crowns: number
  owner: UserDocumentInterface,
  stock: number
}

const GoodSchema = new Schema<GoodDocumentInterface>({
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
  description: {
    type: String,
    trim: true,
    required: true,
  },
  material: {
    type: String,
    trim: true,
    default: 'Acero de Mahakam',
    enum:['Acero de Mahakam','Cuero endurecido','Esencia mágica','Mutágenos de bestias antiguas'],
  },
  weight: {
    type: Number,
    trim: true,
    required: true
  },
  value_in_crowns: {
    type: Number,
    trim: true,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  stock: {
    type: Number,
    default: 0,
    min: 0, // Para evitar valores negativos
    max: 1000, // Limitar el stock a un máximo
    validate: {
      validator: Number.isInteger,
      message: 'El stock debe ser un número entero'
    }
  }
});
export const Good = model<GoodDocumentInterface>('Good', GoodSchema);