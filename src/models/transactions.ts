import { Document, Schema, model } from 'mongoose';
import { GoodDocumentInterface } from './good.js';
import { Types } from 'mongoose'

export interface TransactionGood {
  good: Types.ObjectId | GoodDocumentInterface;
  quantity: number;
} 

interface TransactionDocumentInterface extends Document {
  date: Date;
  type: 'buy' | 'sell';
  amount: number;
  personType: 'Hunter' | 'Merchant';
  personName: string;
  goods: TransactionGood[];
  totalImport : number;
  //calculateTotalImport() : Promise<number>; 
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
    min: 1, 
  },
  type: {
    type: String,
    enum: ['buy', 'sell', 'return'],
    required: true,
  },
  personType: {
    type: String,
    required: true,
    enum: ['Hunter', 'Merchant'],
  },
  personName: {
    type: String,
    required: true,
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
    default: 0, 
  }
});

/*
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
*/

export const Transaction = model<TransactionDocumentInterface>('Transaction', TransactionSchema);