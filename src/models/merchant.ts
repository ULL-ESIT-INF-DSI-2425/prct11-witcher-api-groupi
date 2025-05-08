import { Document, Schema, model } from 'mongoose';
import validator from 'validator';

/**
 * Interfaz del mercader
 */
export interface MerchantDocumentInterface extends Document {
  name: string,
  location: string,
  type?: 'Herrero' | 'Alquimista' | 'Mercader general'
}

/**
 * Esquema del mercader
 */
const MerchantSchema = new Schema<MerchantDocumentInterface>({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate: (value: string) => {
    if (!validator.default.isAlphanumeric(value)) {
        throw new Error('El nombre del mercader sólo puede contener caracteres alfanuméricos');
      }
    },
  },
  location: {
    type: String,
    trim: true,
    required: true,
  },
  type: {
    type: String,
    trim: true,
    default: 'Herrero',
    enum:['Herrero','Alquimista','Mercader general'],
  }
});

/**
 * Modelo del mercader
 */
export const Merchant = model<MerchantDocumentInterface>('Merchant', MerchantSchema);