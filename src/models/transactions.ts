import { Document, Schema, model } from 'mongoose';
import { HunterDocumentInterface } from "./hunter.js"
interface TransactionDocumentInterface extends Document {
  hunter: HunterDocumentInterface,
  description: string;
  totalAmount: number;
  createdDate: Date;
}

const TransactionSchema = new Schema<TransactionDocumentInterface>({
  hunter: {
    type: Schema.Types.ObjectId,
    ref: 'Hunter', 
    required: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  }
});
export const Transaction = model<TransactionDocumentInterface>('Transaction', TransactionSchema);