import { Document, Schema, model } from 'mongoose';
import { HunterDocumentInterface } from "./hunter.js"
import { MerchantDocumentInterface } from './merchant.js';

interface TransactionDocumentInterface extends Document {
  date: Date;
  type: 'buy' | 'sell' | 'return';
  amount: number;
  hunter?: HunterDocumentInterface | Schema.Types.ObjectId; // Referencia al cazador
  merchant?: MerchantDocumentInterface | Schema.Types.ObjectId; // Referencia al comerciante
  totalImport: number; // Total del importe de la transacción
}

const TransactionSchema = new Schema<TransactionDocumentInterface>({
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1, //Necesitas comprar al menos 1 bien
  },
  type: {
    type: String,
    enum: ['buy', 'sell', 'return'],
    required: true,
  },
  hunter: {
    type: Schema.Types.ObjectId,
    ref: 'Hunter', 
    required: false,
    default: null,
    validate: {
    }
  },
  merchant: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant', 
    required: false,
    default: null,
    validate: {
    }
  },
  totalImport: {
    type: Number,
    required: true,
    min: 0, // El importe total no puede ser negativo
  }
});

export const Transaction = model<TransactionDocumentInterface>('Transaction', TransactionSchema);