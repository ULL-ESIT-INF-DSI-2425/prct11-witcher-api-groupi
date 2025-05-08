import express from 'express';
import { Hunter } from '../models/hunter.js';
import { Transaction } from '../models/transactions.js';
import { updateStock } from '../controllers/transactions.js'
export const hunterRouter = express.Router();
/**
 * Método para crear un cazador
 */
hunterRouter.post("/hunters", async (req, res) => {
  try {
    const hunter = new Hunter(req.body);
    await hunter.save();
    res.status(201).send(hunter);
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Método para obtener cazadores
 */
hunterRouter.get("/hunters", async (req, res) => {
  try {
    const filter = req.query?  req.query  : {};
    //const filter = req.query.name?{name: req.query.name.toString()}:{};
    const hunter = await Hunter.find(filter);
    if (hunter.length > 0) {
      res.send(hunter);
    } else {
      res.status(404).send({
        error: "No se encontró al cazador",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Método para obtener cazadores
 * @param id - Id del cazador 
 */
hunterRouter.get("/hunters/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findById(req.params.id);
    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Método para actualizar un cazador
 * @param id - Id del cazador
 */
hunterRouter.patch("/hunters/:id", async (req, res) => {
  try {
    const allowedUpdates = ["name", "location", "race"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida",
      });
    } else {
      const hunter = await Hunter.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

      if (hunter) {
        res.send(hunter);
      } else {
        res.status(404).send();
      }
    } 
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Método para actualizar un cazador
 */
hunterRouter.patch("/hunters", async (req, res) => {
  try {
    let filter = {};
    if (Object.keys(req.query).length === 0) {
      res.status(404).send({
        error: "No se ha especificado algún atributo del mercader",
      });
    } else {
      filter = req.query;
    }
    /*
    let filter = {};
    if (req.query.name) {
      filter =  { name: req.query.name.toString() };
    } else {
      res.status(400).send({
        error: "No se ha especificado el nombre del mercader",
      });
    } 
    */
    const allowedUpdates = ["name", "location", "race"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida",
      });
    } else {
      const hunter = await Hunter.findOneAndUpdate(
        filter,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

      if (hunter) {
        res.send(hunter);
      } else {
        res.status(404).send({
          error: "No se encontró el cazador para actualizar",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Método para borrar un cazador
 * @param id - Id del cazador
 */
hunterRouter.delete("/hunters/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findByIdAndDelete(req.params.id);
    if (hunter) {
      const transactions = await Transaction.find({ personName: hunter.name, personType: "Merchant" });
      for (const transaction of transactions) {
        const reverseType = transaction.type === "buy" ? "sell" : transaction.type === "sell" ? "buy" : "sell"; 
        await updateStock(
          transaction.goods.map(item => ({
            good: item.good.toString(),
            quantity: item.quantity,
          })),
          reverseType
        );

        await transaction.deleteOne(); 
      }
      res.send({
        message: "Cazador y sus transacciones eliminados.",
        hunter,
        deletedTransactionsCount: transactions.length,
      });
    } else {
      res.status(404).send();
    } 
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Método para borrar un cazador a través de cualquier atributo de la query string
 */
hunterRouter.delete("/hunters", async (req, res) => {
  try {
    let filter = {};
    if (Object.keys(req.query).length === 0) {
      res.status(404).send({
        error: "No se ha especificado algún atributo del mercader",
      });
    } else {
      filter = req.query;
    }
    /*
    let filter = {};
    if (req.query.name) {
      filter =  { name: req.query.name.toString() };
    } else {
      res.status(400).send({
        error: "No se ha especificado el nombre del cazador",
      });
    } 
    */
    const hunter = await Hunter.findOneAndDelete(filter);
    if (hunter) {
      const transactions = await Transaction.find({ personName: hunter.name, personType: "Merchant" });
      for (const transaction of transactions) {
        const reverseType = transaction.type === "buy" ? "sell" : transaction.type === "sell" ? "buy" : "sell"; 
        await updateStock(
          transaction.goods.map(item => ({
            good: item.good.toString(),
            quantity: item.quantity,
          })),
          reverseType
        );

        await transaction.deleteOne(); 
      }
      res.send({
        message: "Cazador y sus transacciones eliminados.",
        hunter,
        deletedTransactionsCount: transactions.length,
      });
    } else {
      res.status(404).send({
        error: "No se encontró el cazador para eliminar",
      });
    } 
  } catch (error) {
    res.status(500).send(error);
  }
});
