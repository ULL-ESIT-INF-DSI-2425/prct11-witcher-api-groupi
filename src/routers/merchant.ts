import express from 'express';
import { Merchant } from '../models/merchant.js';
import { User } from "../models/user.js";
export const merchantRouter = express.Router();

merchantRouter.post("/merchants/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const merchant = new Merchant({
        ...req.body,
        owner: user._id,
      });

      await merchant.save();
      await merchant.populate({
        path: "owner",
        select: ["username"],
      });
      res.status(201).send(merchant);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

merchantRouter.get("/merchants/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const name = typeof req.query.name === "string" ? req.query.name : null;
      if (name) {
        const merchant = await Merchant.find({
          owner: user._id,
          name: name,
        }).populate({
          path: "owner",
          select: ["username"],
        });

        if (merchant.length !== 0) {
          res.send(merchant);
        } else {
          res.status(404).send({
            error: "No se encontró al mercader por nombre",
          });
        }
      } else {
        const merchants = await Merchant.find({
          owner: user._id,
        }).populate({
          path: "owner",
          select: ["username"],
        });
        if (merchants.length !== 0) {
          res.send(merchants);
        } else {
          res.status(404).send();
        }
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

merchantRouter.get("/merchants/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const merchant = await Merchant.findOne({
        owner: user._id,
        _id: req.params.id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send({
          error: "No se encontró al mercader por id",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

merchantRouter.get("/merchants/:username/:location", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const merchant = await Merchant.findOne({
        owner: user._id,
        location: req.params.location,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send({
          error: "No se encontró al mercader por localización",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

merchantRouter.get("/merchants/:username/:type", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const merchant = await Merchant.findOne({
        owner: user._id,
        type: req.params.type,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send({
          error: "No se encontró al mercader por tipo",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

merchantRouter.patch("/merchants/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
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

        if (merchant) {
          res.send(merchant);
        } else {
          res.status(404).send({
            error: "No se encontró al mercader para actualizar",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});


merchantRouter.patch("/merchants/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const name = typeof req.query.name === "string" ? req.query.name : null;
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
            owner: user._id,
            name: name,
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

        if (merchant) {
          res.send(merchant);
        } else {
          res.status(404).send({
            error: "No se encontró al mercader para actualizar",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

merchantRouter.delete("/merchants/:username/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const merchant = await Merchant.findOneAndDelete({
        owner: user._id,
        _id: req.params.id,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send({
          error: "No se encontró al mercader para eliminar",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});


merchantRouter.delete("/merchants/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      res.status(404).send({
        error: "No se encontró al usuario",
      });
    } else {
      const name = typeof req.query.name === "string" ? req.query.name : null;
      if (!name) {
        res.status(400).send({
          error: "Falta el parámetro de búsqueda 'name' en query string",
        });
      }
      const merchant = await Merchant.findOneAndDelete({
        owner: user._id,
        name: name,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send({
          error: "No se encontró al mercader para eliminar",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
