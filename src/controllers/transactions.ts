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
export const updateStock = async (goods: { good?: string; name?: string; quantity: number }[],type: string) => {
  for (const item of goods) {
    let good;
    if (item.good) {
      good = await Good.findById(item.good);
    } else if (item.name) {
      good = await Good.findOne({ name: item.name });
    }
    if (!good) {
      throw new Error(`Bien no encontrado: ${item.good || item.name}`);
    }
    if (type === "buy") {
      good.stock -= item.quantity;
    } else if (type === "sell") {
      good.stock += item.quantity;
    } else {
      throw new Error(`Una transacción sólo puede ser comprar o vender`);
    }
    if (good.stock < 0) {
      throw new Error(`Stock insuficiente para el bien ${good.name}`);
    }
    await good.save();
  }
};

/**
 * Funcion que permite crear una transaccion que usaremos en la ruta .post de
 * las rutas de transacción
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
/**
 * Funcion que permite actualizar una transaccion que usaremos en la ruta .patch de
 * las rutas de transacción
 */
export const updateTransactionByID = async (req, res) => {
  try {
    const originalTransaction = await Transaction.findById(req.params.id);
    if (!originalTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }
    const revertType = originalTransaction.type === 'buy' ? 'sell' : originalTransaction.type === 'sell' ? 'buy' :'sell';
    await updateStock(
      originalTransaction.goods.map(item => ({
        good: item.good.toString(),
        quantity: item.quantity
      })),
      revertType
    );
    const newGoods: TransactionGood[] = [];
    let newTotalImport = 0;
    let newAmount = 0;
    for (const item of req.body.goods) {
      const goodDoc = await Good.findOne({ name: item.name }) as GoodDocumentInterface | null;
      if (!goodDoc) {
        return res.status(400).json({
          success: false,
          message: `Bien con nombre "${item.name}" no encontrado`
        });
      }
      newGoods.push({
        good: goodDoc._id as Types.ObjectId,
        quantity: item.quantity
      });

      newTotalImport += goodDoc.value_in_crowns * item.quantity;
      newAmount += item.quantity;
    }
    await updateStock(req.body.goods, originalTransaction.type);
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        goods: newGoods,
        amount: newAmount,
        totalImport: newTotalImport,
        date: req.body.date ?? new Date(),
        type: originalTransaction.type,
        personType: originalTransaction.personType,
        personName: originalTransaction.personName
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar transacción',
      error: error instanceof Error ? error.message : error
    });
  }
};
