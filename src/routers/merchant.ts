import express from 'express';
import { Merchant } from '../models/merchant.js';
import { User } from "../models/user.js";
export const merchantRouter = express.Router();

/*
merchantRouter.post('/merchants', (req, res) => {
  const merchant = new Merchant(req.body);

  merchant.save().then((merchant) => {
    res.status(201).send(merchant);
  }).catch((error) => {
    res.status(400).send(error);
  });
});

merchantRouter.get('/merchants', (req, res) => {
  const filter = req.query.name?{name: req.query.name.toString()}:{};
  Merchant.find(filter).then((merchants) => {
    if (merchants.length !== 0) {
      res.send(merchants);
    } else {
      res.status(404).send();
    }
  }).catch(() => {
    res.status(500).send();
  });
});

merchantRouter.get('/merchants/:id', (req, res) => {
  Merchant.findById(req.params.id).then((merchant) => {
    if (!merchant) {
      res.status(404).send();
    } else {
      res.send(merchant);
    }
  }).catch(() => {
    res.status(500).send();
  });
});

merchantRouter.patch('/merchants', (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: 'Es necesario proveer un nombre en la query string',
    });
  } else if (!req.body) {
    res.status(400).send({
      error: 'Los campos que se quieren modificar deben estar en el request body',
    });
  } else {
    const allowedUpdates = ['name', 'location', 'type'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      res.status(400).send({
        error: 'No se ha podido actualizar',
      });
    } else {
      Merchant.findOneAndUpdate({name: req.query.name.toString()}, req.body, {
        new: true,
        runValidators: true,
      }).then((merchant) => {
        if (!merchant) {
          res.status(404).send();
        } else {
          res.send(merchant);
        }
      }).catch((error) => {
        res.status(400).send(error);
      });
    }
  }
});


merchantRouter.patch('/merchants/:id', (req, res) => {
  if (!req.body) {
    res.status(400).send({
      error: 'Los campos que se quieren modificar deben estar en el request body',
    });
  } else {
    const allowedUpdates = ['name', 'location', 'type'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
        actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      res.status(400).send({
        error: 'No se ha podido actualizar',
      });
    } else {
      Merchant.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).then((merchant) => {
        if (!merchant) {
          res.status(404).send();
        } else {
          res.send(merchant);
        }
      }).catch((error) => {
        res.status(400).send(error);
      });
    }
  }
});
merchantRouter.delete('/merchants', (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: 'Es necesario proveer un nombre',
    });
  } else {
    Merchant.findOneAndDelete({name: req.query.name.toString()}).then((merchant) => {
      if (!merchant) {
        res.status(404).send();
      } else {
        res.send(merchant);
      }
    }).catch(() => {
      res.status(400).send();
    });
  }
});

merchantRouter.delete('/merchants/:id', (req, res) => {
  Merchant.findByIdAndDelete(req.params.id).then((merchant) => {
    if (!merchant) {
      res.status(404).send();
    } else {
      res.send(merchant);
    }
  }).catch(() => {
    res.status(400).send();
  });
});*/


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
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});


merchantRouter.get("/merchants/:username/:name", async (req, res) => {
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
        _id: req.params.name,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send();
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
        _id: req.params.location,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send();
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
        _id: req.params.type,
      }).populate({
        path: "owner",
        select: ["username"],
      });

      if (merchant) {
        res.send(merchant);
      } else {
        res.status(404).send();
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
          res.status(404).send();
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
        error: "User not found",
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
        res.status(404).send();
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});