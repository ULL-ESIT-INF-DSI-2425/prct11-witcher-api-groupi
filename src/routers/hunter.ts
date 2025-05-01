import express from 'express';
import { Hunter } from '../models/hunter.js';
import { User } from "../models/user.js";
export const hunterRouter = express.Router();

hunterRouter.post("/hunters/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const hunter = new Hunter({
        ...req.body,
        owner: user._id,
      });

      await hunter.save();
      await hunter.populate({
        path: "owner",
        select: ["username"],
      });
      res.status(201).send(hunter);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

hunterRouter.get("/hunters/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const hunters = await Hunter.find({
        owner: user._id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (hunters.length !== 0) {
        res.send(hunters);
      } else {
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

hunterRouter.get("/hunters/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const hunter = await Hunter.findOne({
        owner: user._id,
        _id: req.params.id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

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


hunterRouter.get("/hunters/:username/:name", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const hunter = await Hunter.findOne({
        owner: user._id,
        _id: req.params.name,
      }).populate({
        path: "owner",
        select: ["username"],
      });

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

hunterRouter.get("/hunters/:username/:location", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const hunter = await Hunter.findOne({
        owner: user._id,
        _id: req.params.location,
      }).populate({
        path: "owner",
        select: ["username"],
      });

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

hunterRouter.get("/hunters/:username/:breed", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const hunter = await Hunter.findOne({
        owner: user._id,
        _id: req.params.breed,
      }).populate({
        path: "owner",
        select: ["username"],
      });

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

hunterRouter.patch("/hunters/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const allowedUpdates = ["name", "location", "breed"];
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
            owner: user._id,
            _id: req.params.id,
          },
          req.body,
          {
            new: true,
            runValidators: true,
          },
        ).populate({
          path: "owner",
          select: ["username"],
        });

        if (hunter) {
          res.send(hunter);
        } else {
          res.status(404).send();
        }
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

hunterRouter.delete("/hunters/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "User not found",
      });
    } else {
      const hunter = await Hunter.findOneAndDelete({
        owner: user._id,
        _id: req.params.id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

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