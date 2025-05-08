import express from 'express';
import { Good } from '../models/good.js';

export const goodRouter = express.Router();
/**
 * Método para crear un nuevo bien
 */
goodRouter.post("/goods", async (req, res) => {
  try {
    const good = new Good(req.body);
    await good.save();
    res.status(201).send(good);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Método para obtener un bien dado su id
 * @param id - Id del bien
 */
goodRouter.get("/goods/:id", async (req, res) => {
  try {
    const good = await Good.findById(req.params.id);
    if (good) { 
      res.send(good);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Metodo para obtener un bien dado su nombre, descripción o los distintos parámetros
 */
goodRouter.get("/goods", async (req, res) => {
  try {
    const filter = req.query?  req.query  : {};
    const good = await Good.find(filter);
    if (good.length > 0) { 
      res.send(good);
    } else {
      res.status(404).send({
        error: "No se encontró el bien por nombre",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});


/**
 * Metodo para actualizar las caracteristicas de un bien dado alguno de los parámetros como el nombre
 */
goodRouter.patch("/goods", async (req, res) => {
  try {
    const filter = req.query?  req.query  : {};
    const allowedUpdates = ["name", "description", "material", "weight","value_in_crowns","stock"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      res.status(400).send({ 
        error: "La actualización no está permitida" 
      });
    } else {
      const updatedGood = await Good.findOneAndUpdate(
        filter,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

      if (updatedGood) {
        res.send(updatedGood);
      } else {
        res.status(404).send({ 
          error: "No se pudo actualizar el bien" 
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Método para actualizar un bien dado su id
 * @param id - Id del bien
 */
goodRouter.patch("/goods/:id", async (req, res) => {
  try {
    const allowedUpdates = ["name", "description", "material","weight","value_in_crowns","stock"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida",
      });
    }  else {
      const good = await Good.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

      if (good) {
        res.send(good);
      } else {
        res.status(404).send();
      }
    } 
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Método para eliminar un bien de un usuario
 * @param id - Id del bien
 */
goodRouter.delete("/goods/:id", async (req, res) => {
  try {
    const good = await Good.findByIdAndDelete(req.params.id);

    if (good) { 
      res.send(good);
    } else {
      res.status(404).send({
        error: "No se encontró el bien",
      });
    }  
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Elimina un bien dado alguno o todos los parámetros
 */
goodRouter.delete("/goods", async (req, res) => {
  try {
    const filter = req.query?  req.query  : {};
    const deletedGood = await Good.findOneAndDelete(filter);
    if (deletedGood) {
      res.send(deletedGood);
    } else {
      res.status(404).send({ 
        error: "No se encontró ningún bien a eliminar" 
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
