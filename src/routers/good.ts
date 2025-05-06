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
    const good = await Good.findOne({
      _id: req.params.id
    })
    if (good) { // Si se encuentra el bien, se devuelve
      res.send(good);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Metodo para obtener un bien dado su nombre
 * @param name - Nombre del bien
 */
goodRouter.get("/goods/:name", async (req, res) => {
  try {
    const good = await Good.findOne({
      name: req.params.name
    });
    if (good) { // Si se encuentra el bien, se devuelve
      res.send(good);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Método para obtener un bien dada su descripción
 * @param description - Descripción del bien
 */
goodRouter.get("/goods/:description", async (req, res) => {
  try {
    const good = await Good.findOne({
      description: req.params.description
    });
    if (good) { // Si se encuentra el bien, se devuelve
      res.send(good);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Metodo para actualizar las caracteristicas de un bien
 * @param name - Nombre del bien
 */
//IMPORTANTE! Es necesario que cuando se actualice un bien que ya está se deberá cambiar el stock y hacer comprobaciones como si el stock
// esta vacío y no permitir < 0
goodRouter.patch("/goods/:name", async (req, res) => {
  try {
    const allowedUpdates = [ "name", "description", "material", "stock"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if(!isValidUpdate) {
      res.status(400).send({
        error: "No se puede actualizar el bien con los campos dados",
      });
    } else {
      const good = await Good.findOneAndUpdate(
        {
          name: req.params.name
        },
        req.body,
        {
          new: true, // Devuelve el bien actualizado
          runValidators: true, // Valida los datos antes de guardarlos
        },
      );
      if (good) { // Si se encuentra el bien, se devuelve
        res.send(good);
      }
      else {
        res.status(404).send({
          error: "No se encontró el bien",
        });
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
    const good = await Good.findOneAndDelete({
      _id: req.params.id
    });

    if (good) { // Si se encuentra el bien, se devuelve
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