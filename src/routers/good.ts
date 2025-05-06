import express from 'express';
import { Good } from '../models/good.js';
import { User } from "../models/user.js";

export const goodRouter = express.Router();

/**
 * Método para crear un nuevo bien
 * @param username - Nombre de usuario que crea el bien
 */
goodRouter.post("/goods/:username", async (req, res) => {
  try {
    // Buscamos al usuario por su nombre de usuario
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const good = new Good({
        ...req.body,
        owner: user._id,
      });

    await good.save();
    await good.populate({
      path: "owner",
      select: ["username"],
    });
    res.status(201).send(good);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Método para obtener todos los bienes de un usuario
 * @param username - Nombre de usuario
 */
goodRouter.get("/goods/:username", async (req, res) => {
  try {
    // Buscamos al usuario por su nombre de usuario
    const user = await User.findOne({
      username: req.params.username,
    });
    if (!user) {
      res.status(404).send({ 
        error: "No se encontró al usuario",
      });
    } else {
      const goods = await Good.find({ // Buscamos los bienes del usuario
        owner: user._id,
      }).populate({
        path: "owner",
        select: ["username"],
      });
    // Si el usuario no tiene bienes, se devuelve un 404
      if (goods.length !== 0) {
        res.send(goods);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Método para obtener un bien dado su id
 * @param username - Nombre de usuario
 * @param id - Id del bien
 */
goodRouter.get("/goods/:username/:id", async (req, res) => {
  try {
    // Buscamos al usuario por su nombre de usuario
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const good = await Good.findOne({
        _id: req.params.id,
        owner: user._id,
      }).populate({
        path: "owner", // Rellenamos el campo owner con el nombre de usuario
        select: ["username"], // Añadimos el campo username de User
      });
      if (good) { // Si se encuentra el bien, se devuelve
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
 * Metodo para obtener un bien dado su nombre
 * @param username - Nombre de usuario
 * @param name - Nombre del bien
 */
goodRouter.get("/goods/:username/:name", async (req, res) => {
  try {
    // Buscamos al usuario por su nombre de usuario
    const user = await User.findOne({
      username: req.params.username,
    });
    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else { 
      const good = await Good.findOne({
        name: req.params.name,
        owner: user._id,
      }).populate({
        path: "owner",
        select: ["username"],
      });
      if (good) { // Si se encuentra el bien, se devuelve
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
 * Método para obtener un bien dada su descripción
 * @param username - Nombre de usuario
 * @param description - Descripción del bien
 */
goodRouter.get("/goods/:username/:description", async (req, res) => {
  try {
    // Buscamos al usuario por su nombre de usuario
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const good = await Good.findOne({
        description: req.params.description,
        owner: user._id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (good) { // Si se encuentra el bien, se devuelve
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
 * Metodo para actualizar las caracteristicas de un bien
 * @param username - Nombre de usuario
 * @param name - Nombre del bien
 */
//IMPORTANTE! Es necesario que cuando se actualice un bien que ya está se deberá cambiar el stock y hacer comprobaciones como si el stock
// esta vacío y no permitir < 0
goodRouter.patch("/goods/:username/:name", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
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
            name: req.params.name,
            owner: user._id,
          },
          req.body,
          {
            new: true, // Devuelve el bien actualizado
            runValidators: true, // Valida los datos antes de guardarlos
          },
        ).populate({
          path: "owner",
          select: ["username"],
        });

        if (good) { // Si se encuentra el bien, se devuelve
          res.send(good);
        }
        else {
          res.status(404).send({
            error: "No se encontró el bien",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Método para eliminar un bien de un usuario
 * @param username - Nombre de usuario
 * @param id - Id del bien
 */
goodRouter.delete("/goods/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const good = await Good.findOneAndDelete({
        _id: req.params.id,
        owner: user._id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (good) { // Si se encuentra el bien, se devuelve
        res.send(good);
      } else {
        res.status(404).send({
          error: "No se encontró el bien",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});