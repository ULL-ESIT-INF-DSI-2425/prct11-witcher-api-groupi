import express from 'express';
import { Transaction } from '../models/transactions.js';
import { Good } from '../models/good.js';


export const transactionRouter = express.Router();

/**
 * Funcion que permite actualizar el stock segun compres, vendas o devuelvas bienes
 * @param goods - todos los bienes
 * @param type - tipo de la transaccion puede ser buy, sell o return
 */
const updateStock = async (goods: { good: string; quantity: number }[], type : string) => {
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

/**
 * Get de todas las transacciones de nuestra base de datos
 */
transactionRouter.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find(req.query).populate('goods.good');
    if (transactions.length !== 0) {
      res.status(200).send(transactions);
    } else {
      res.status(404).send('No Transactions found');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Get de la transaccion por id
 */
transactionRouter.get('/transactions/:id', async (req,res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (transaction) {
      res.send(transaction);
    } else {
      res.status(404).send({
        error: "No se encontró la transacción por id",
      })
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Get de las transacciones realizadas en un dia concreto. Hacemos manualmente
 * que el rango sea durante todo ese dia por tanto esperamos una entrada parecida a:
 * http://localhost:3000/transactions/date/2025-05-07
 */
transactionRouter.get('/transactions/date/:date', async (req, res) => {
  try {
    const dateParam = req.params.date;
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      res.status(400).send({error: 'Fecha invalida. Usar el formato YYYY-MM-DD'});
    }
    // cogemos todo ese día
    const startDay = new Date(date.setHours(0,0,0,0));
    const endDay = new Date(date.setHours(23,59,59,999));
    const transactions = await Transaction.find({date:{$gte: startDay, $lte: endDay},}).populate('goods.good');
    if (transactions.length === 0){
      res.status(400).send({message : 'No se encontraron transacciones en esa fecha'});
    }
    res.status(200).send(transactions);
  } catch (error) {
    res.status(500).send(error);
  }
});

// ERROR EN ASYNC
transactionRouter.get('transactions/type/:type', async(req, res) => {
  try {
    const tipo = req.params.type;
    if (!['buy', 'sell', 'return'].includes(tipo)) {
      res.status(400).send({ 
        error: 'Tipo inválido. Usa "buy", "sell" o "return"' 
      });
    }
    const transactions = await Transaction.find({ tipo }).populate('goods.good');
    if (transactions.length === 0) {
      res.status(404).send({ 
        message: `No se encontraron transacciones del tipo "${tipo}"` 
      });
    }
    res.status(200).send(transactions);
  } catch (error) {
    res.status(500).send(error);
  }
});


/**
 * Elimina una transaccion buscandola por su id
 */
transactionRouter.delete('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
     res.status(404).send({ error: 'Transaction not found' });
    } else {
      // Revert stock changes
      await updateStock(
        transaction.goods.map(item => ({ good: item.good.toString(), quantity: item.quantity })),
        transaction.type
      );
      await transaction.deleteOne();

      res.status(200).send(transaction);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// ERROR EN EL ASYNC
transactionRouter.delete('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    if (transactions.length === 0) {
      res.status(404).send({ 
        message: 'No hay transacciones para eliminar' 
      });
    }
    for (const transaction of transactions) {
      // Revertir el stock para cada transacción según su tipo
      await updateStock(
        transaction.goods.map(item => ({
          good: item.good.toString(),
          quantity: item.quantity
        })),
        transaction.type
      );
      await transaction.deleteOne();
    }
    res.status(200).send({ 
      message: `Se eliminaron ${transactions.length} transacciones` 
    });
  } catch (error) {
    res.status(500).send(error);
  }
});






