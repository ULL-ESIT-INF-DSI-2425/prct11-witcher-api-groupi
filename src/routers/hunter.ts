import express from 'express';
import { Hunter } from '../models/hunter.js';
export const hunterRouter = express.Router();

hunterRouter.post("/hunters", async (req, res) => {
  try {
    const hunter = new Hunter(req.body);
    await hunter.save();
    res.status(201).send(hunter);
  } catch (error) {
    res.status(500).send(error);
  }
});

hunterRouter.get("/hunters", async (req, res) => {
  try {
    const name = req.query.name?{name: req.query.name.toString()}:{};
    if (name) {
      const hunter = await Hunter.findOne({
        name: name,
      });
      if (hunter) {
        res.send(hunter);
      } else {
        res.status(404).send({
          error: "No se encontró al cazador por nombre",
        });
      }
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

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

hunterRouter.get("/hunters/:location", async (req, res) => {
  try {
    const hunter = await Hunter.findOne({
      location: req.params.location
    });
    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send();
    }   
  } catch (error) {
    res.status(500).send(error);
  }
});

hunterRouter.get("/hunters/:race", async (req, res) => {
  try {
    const hunter = await Hunter.findOne({
      race: req.params.race
    });

    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send();
    }  
  } catch (error) {
    res.status(500).send(error);
  }
});

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

hunterRouter.patch("/hunters", async (req, res) => {
  try {
    const name = req.query.name?{name: req.query.name.toString()}:{};
    if (!name) {
      res.status(400).send({
        error: "Falta el parámetro de búsqueda 'name' en query string",
      });
    }

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
        {
          name: name,
        },
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

hunterRouter.delete("/hunters/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findByIdAndDelete(req.params.id);
    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send();
    } 
  } catch (error) {
    res.status(500).send(error);
  }
});

hunterRouter.delete("/hunters", async (req, res) => {
  try {
    const name = req.query.name?{name: req.query.name.toString()}:{};
    if (!name) {
      res.status(400).send({
        error: "Falta el parámetro de búsqueda 'name' en query string",
      });
    }
    const hunter = await Hunter.findOneAndDelete({
      name: name,
    });
    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send({
        error: "No se encontró el cazador para eliminar",
      });
    } 
  } catch (error) {
    res.status(500).send(error);
  }
});
