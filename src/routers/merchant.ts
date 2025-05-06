import express from 'express';
import { Merchant } from '../models/merchant.js';
export const merchantRouter = express.Router();
/**
 * Método para crear un mercader
 */
merchantRouter.post("/merchants", async (req, res) => {
  try {
    const merchant = new Merchant(req.body);
    await merchant.save();
    res.status(201).send(merchant);
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Método para obtener mercaderes
 * @param name - Nombre del mercader utilizando una query string
 */
merchantRouter.get("/merchants", async (req, res) => {
  try {
    const name = req.query.name?{name: req.query.name.toString()}:{};
    if (name) {
      const merchant = await Merchant.find(name);
      if (merchant.length !== 0) {
        res.send(merchant);
      } else {
        res.status(404).send({
          error: "No se encontró al mercader por nombre",
        });
      }
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Método para obtener mercaderes
 * @param id - Id del mercader 
 */
merchantRouter.get("/merchants/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (merchant) {
      res.send(merchant);
    } else {
      res.status(404).send({
        error: "No se encontró al mercader por id",
      });
    } 
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Método para obtener mercaderes
 * @param location - Localización del mercader 
 */
merchantRouter.get("/merchants/:location", async (req, res) => {
  try {
    const merchant = await Merchant.findOne({
      location: req.params.location,
    });
    if (merchant) {
      res.send(merchant);
    } else {
      res.status(404).send({
        error: "No se encontró al mercader por localización",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Método para obtener mercaderes
 * @param type - Tipo del mercader 
 */
merchantRouter.get("/merchants/:type", async (req, res) => {
  try {
    const merchant = await Merchant.findOne({
      type: req.params.type,
    });
    if (merchant) {
      res.send(merchant);
    } else {
      res.status(404).send({
        error: "No se encontró al mercader por tipo",
      });
    }   
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Método para actualizar un mercader
 * @param id - Id del mercader 
 */
merchantRouter.patch("/merchants/:id", async (req, res) => {
  try {
    const allowedUpdates = ["name", "location", "type"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida",
      });
    } else {
      const merchant = await Merchant.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );
      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send({
          error: "No se encontró al mercader para actualizar",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Método para actualizar un mercader
 * @param name - Nombre del mercader utilizando una query string
 */
merchantRouter.patch("/merchants", async (req, res) => {
  try {
    const name = req.query.name?{name: req.query.name.toString()}:{};
    if (!name) {
      res.status(400).send({
        error: "Falta el parámetro de búsqueda 'name' en query string",
      });
    }

    const allowedUpdates = ["name", "location", "type"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "La actualización no está permitida",
      });
    } else {
      const merchant = await Merchant.findOneAndUpdate(
        {
          name: name,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send({
          error: "No se encontró al mercader para actualizar",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Método para borrar un mercader
 * @param id - Id del mercader 
 */
merchantRouter.delete("/merchants/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findByIdAndDelete(req.params.id);
    if (merchant) {
      res.send(merchant);
    } else {
      res.status(404).send({
        error: "No se encontró al mercader para eliminar",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Método para borrar un mercader
 * @param name - Nombre del mercader utilizando una query string
 */
merchantRouter.delete("/merchants", async (req, res) => {
  try {
    const name = req.query.name?{name: req.query.name.toString()}:{};
    if (!name) {
      res.status(400).send({
        error: "Falta el parámetro de búsqueda 'name' en query string",
      });
    }
    const merchant = await Merchant.findOneAndDelete({
      name: name,
    });

    if (merchant) {
      res.send(merchant);
    } else {
      res.status(404).send({
        error: "No se encontró al mercader para eliminar",
      });
    }  
  } catch (error) {
    res.status(500).send(error);
  }
});
