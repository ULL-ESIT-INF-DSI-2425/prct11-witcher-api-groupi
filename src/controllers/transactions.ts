import {Transaction, TransactionGood} from '../models/transactions.js';
import { Good, GoodDocumentInterface} from '../models/good.js';
import { Hunter } from '../models/hunter.js';
import { Merchant } from '../models/merchant.js';
import { Types } from 'mongoose'

/**
 * Interfaz para el cuerpo de la transaccion 
 */
interface BodyTransaction {
  typeTrans: "buy" | "sell";
  personName: string;
  goods: {
    name: string,
    quantity: number,
  }[];
}

/**
 * Funcion que permite actualizar el stock segun compres, vendas o devuelvas bienes
 * @param goods - todos los bienes
 * @param type - tipo de la transaccion puede ser buy, sell o return
 */
export const updateStock = async (goods: { good: string; quantity: number }[], type : string) => {
  for (const item of goods) {
    const good = await Good.findById(item.good);
    if (!good) throw new Error(`Bien con ID ${item.good} no se encontró`);
    if (type === "buy") {
      good.stock = good.stock - item.quantity;
    } else if (type === "sell") {
      good.stock = good.stock + item.quantity;
    } else {
      throw new Error(`Una transacción sólo puede ser comprar, vender o devolver`);
    }
    if (good.stock < 0) throw new Error(`Stock insuficiente para el bien ${good.name}`);
    await good.save();
  }
};

/**
 * 
 */
export const createTransaction = async (req, res) => {
  try {
    const { typeTrans, personName, goods } = req.body as BodyTransaction;
    if (!typeTrans || !personName || !Array.isArray(goods) || goods.length === 0) {
      res.status(400).send('Alguno de los campos no ha sido especificado');
    } else {
      const consumer = typeTrans === 'buy' ? await Hunter.findOne({ name: personName }): await Merchant.findOne({ name: personName });
      if (!consumer) {
        res.status(404).send('No se ha encontrado ningún personaje con ese nombre');
      } else {
        const personType = typeTrans === 'buy' ? 'Hunter' : 'Merchant';
        const transactionGoods: TransactionGood[] = [];
        let totalImport = 0;
        let totalQuantity = 0;
        for (const item of goods) {
          if (!item.name || typeof item.quantity !== 'number' || item.quantity <= 0) {
            res.status(400).send('Nombre o cantidad de bien inválido');
          }
          const good = await Good.findOne({ name: item.name }) as GoodDocumentInterface | null;
          if (!good) {
            res.status(404).send(`El bien "${item.name}" no existe`);
          } else {
            transactionGoods.push({
              good: good._id as Types.ObjectId,
              quantity: item.quantity,
            });
            totalImport += good.value_in_crowns * item.quantity;
            totalQuantity += item.quantity;
          }
        }
        await updateStock(
          transactionGoods.map(item => ({
            good: item.good.toString(),
            quantity: item.quantity,
          })),
          typeTrans
        );
        const newTransaction = new Transaction({
          type: typeTrans,
          personType,
          personName,
          goods: transactionGoods,
          amount: totalQuantity,
          totalImport,
        });
        await newTransaction.save();
        res.status(201).json(newTransaction);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error al crear la transacción: ${error instanceof Error ? error.message : error}`);
  }
};
