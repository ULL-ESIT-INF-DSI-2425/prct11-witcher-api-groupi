import { Document, Schema, model } from 'mongoose';
import { HunterDocumentInterface } from "./hunter.js"
import { MerchantDocumentInterface } from './merchant.js';
//import { validator } from 'validator';

interface TransactionDocumentInterface extends Document {
  date: Date;
  type: 'buy' | 'sell' | 'return';
  amount: number;
  hunter?: HunterDocumentInterface | Schema.Types.ObjectId; // Referencia al cazador
  merchant?: MerchantDocumentInterface | Schema.Types.ObjectId; // Referencia al comerciante
  totalImport : number;
  calculateTotalImport() : number; // Total del importe de la transacción
  updateStock() : Promise<void>;
  // GOODS
  goods : string;
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
      validator: function(v : any) {
        return !(v !== null && this.merchant != null);
      },
      message: "Una transaccion debe tener un hunter o un merchant, no ambos"
    }
  },
  merchant: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant', 
    required: false,
    default: null,
    validate: {
      validator : function(v: any) {
        return !(v !== null && this.hunter != null);
      }
    }
  },
  totalImport: {
    type: Number,
    default: 0, // El importe total no puede ser negativo
  }
});

TransactionSchema.methods.calculateTotalImport = function() : number {
  return this.goods.reduce((total, item) => {
    return total + (item.quantity * item.price);
  }, 0);
};

export const Transaction = model<TransactionDocumentInterface>('Transaction', TransactionSchema);