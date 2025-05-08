import {Transaction, TransactionGood } from '../models/transactions.js';
import { Good } from '../models/good.js';
import { Hunter } from '../models/hunter.js';
import { Merchant } from '../models/merchant.js';

/**
 * Interfaz para el cuerpo de la transaccion 
 */
interface BodyTransaction {
  type: "buy" | "sell" | "return";
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
    if (!good) throw new Error(`Good with ID ${item.good} not found`);
    if (type === "buy") {
      good.stock = good.stock - item.quantity;
    } else if (type === "sell") {
      good.stock = good.stock + item.quantity;
    } else if (type === "return") {
      good.stock = good.stock + item.quantity;
    } else {
      throw new Error(`A transaction can only be buy, sell or return`);
    }
    if (good.stock < 0) throw new Error(`Insufficient stock for good ${good.name}`);
    await good.save();
  }
};

export const createTransaction = async (req,res) => {
  try {
    const {type, personName, goods } = req.body as BodyTransaction;
    if (!type || !personName || !goods || !Array.isArray(goods) || goods.length === 0) {
      res.status(400).send('Alguno de los campos no ha sido especificado');
    }
    let consumer;
    if (type === 'Hunter') {
      consumer = new Hunter.findOne({name: personName});
    } else {
      consumer = new Merchant.findOne({name: personName});
    }
    if (!consumer){
      res.status(404).send('No se ha encontrado ningun personaje con ese nombre');
    }
    const tipo = consumer instanceof Hunter ? 'Hunter' : 'Merchant'; //para interfaz
    const transactionGoods : TransactionGood[] = [];
    let total = 0;
  } catch (error) {
    res.status(500).send(error);
  }
};
