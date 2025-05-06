import { Document, Schema, model } from 'mongoose';
// import validator from 'validator';

interface GoodDocumentInterface extends Document {
  name: string,
  description: string,
  material?: 'Acero de Mahakam' | 'Cuero endurecido' | 'Esencia mágica' | 'Mutágenos de bestias antiguas',
  weight?: number,
  value_in_crowns: number
  stock: number
}

const GoodSchema = new Schema<GoodDocumentInterface>({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
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