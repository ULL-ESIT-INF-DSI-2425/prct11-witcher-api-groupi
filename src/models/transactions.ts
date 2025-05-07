import { Document, Schema, model } from 'mongoose';
import { HunterDocumentInterface } from "./hunter.js"
import { MerchantDocumentInterface } from './merchant.js';
import { Good, GoodDocumentInterface } from './good.js';

interface TransactionGood {
  good: Schema.Types.ObjectId | GoodDocumentInterface;
  quantity: number;
} 

interface TransactionDocumentInterface extends Document {
  date: Date;
  type: 'buy' | 'sell' | 'return';
  amount: number;
  hunter?: HunterDocumentInterface | Schema.Types.ObjectId; // Referencia al cazador
  merchant?: MerchantDocumentInterface | Schema.Types.ObjectId; // Referencia al comerciante
  goods: TransactionGood[];
  totalImport : number;
  calculateTotalImport() : Promise<number>; // Total del importe de la transacción
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
      validator: function(v) {
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
      validator : function(v) {
        return !(v !== null && this.hunter != null);
      }
    }
  },
  goods: [
    {
      good: {
        type: Schema.Types.ObjectId,
        ref: 'Good',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  totalImport: {
    type: Number,
    default: 0, // El importe total no puede ser negativo
  }
});

TransactionSchema.methods.calculateTotalImport = async function (): Promise<number> {
  let total = 0;
  for (const item of this.goods) {
    const good = await Good.findById(item.good);
    if (!good) {
      throw new Error(`Bien no encontrado: ${item.good}`);
    }
    total += good.value_in_crowns * item.quantity;
  }
  this.totalImport = total;
  return total;
};

export const Transaction = model<TransactionDocumentInterface>('Transaction', TransactionSchema);