import { describe, test, beforeEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/api.js"
import { Good } from "../src/models/good.js"

const firstGood = {
  name: "Espada de Estela",
  description: "Es una espadita de plata",
  material: "Acero de Mahakam",
  weight: 34,
  value_in_crowns: 140,
  stock: 3
};

beforeEach(async () => {
  await Good.deleteMany();
  await new Good(firstGood).save();
});

describe("POST /goods", () => {
  test("Should successfully create a new good", async () => {
    const response = await request(app)
      .post("/goods")
      .send({
        name: "Espada de Ines",
        description: "Es una espadita de plata",
        material: "Cuero endurecido",
        weight: 12,
        value_in_crowns: 60,
        stock: 7
      })
      .expect(201);

    expect(response.body).to.include({
      name: "Espada de Ines",
      description: "Es una espadita de plata",
      material: "Cuero endurecido",
      weight: 12,
      value_in_crowns: 60,
      stock: 7
    });

    const bien = await Good.findById(response.body._id);
    expect(bien).not.toBe(null);
    expect(bien?.material).toBe("Cuero endurecido");
    expect(bien?.weight).toBe(12);
    expect(bien?.value_in_crowns).toBe(60);
  });

  test("Should fail to create a good", async () => {
    await request(app)
      .post("/goods")
      .send({})
      .expect(500);
  });
});

describe("GET /goods", () => {
  test("Should get a good by name", async () => {
    const res = await request(app)
      .get(`/goods?name=${firstGood.name}`)
      .expect(200);
    expect(res.body.name).toBe(firstGood.name);
  });

  test("Should not find a good if name not found", async () => {
    await request(app)
      .get("/goods?name=prueba")
      .expect(404);
  });

  test("Should not find a good if name param is missing", async () => {
    await request(app).get("/goods").expect(404);
  });
});

describe("GET /goods/:id", () => {
  test("Should get good by ID", async () => {
    const bien = await Good.findOne({ name: firstGood.name });
    if (bien) {
      const res = await request(app).get(`/goods/${bien._id}`).expect(200);
      expect(res.body.name).toBe(firstGood.name);
    }
  });

  test("Should not find a good if ID not found", async () => {
    await request(app)
      .get("/goods/507f191e810c19729de860ea")
      .expect(404);
  });

  test("Should not find a good if ID is invalid", async () => {
    await request(app).get("/goods/holamundo").expect(500);
  });
});

describe("PATCH /goods/:id", () => {
  test("Should update good by ID", async () => {
    const bien = await Good.findOne({ name: firstGood.name });
    if (bien) {
      const res = await request(app)
        .patch(`/goods/${bien._id}`)
        .send({ location: "Hawai" })
        .expect(200);

      expect(res.body.material).toBe("Acero de Mahakam");
    }
  });
}); // eliminar luego
/*
  test("Should not allow invalid update fields", async () => {
    const bien = await Good.findOne({ name: firstGood.name });
    if (BiquadFilterNode) {
      await request(app)
        .patch(`/goods/${bien._id}`)
        .send({ magic: "yes" })
        .expect(400);
    }
  });
*/

/*
  test("Should not update a merchant if merchant not found by ID", async () => {
    await request(app)
      .patch("/merchants/507f191e810c19729de860ea")
      .send({ name: "Test" })
      .expect(404);
  });
});

describe("PATCH /merchants?name=", () => {
  test("Should update merchant by name", async () => {
    const res = await request(app)
      .patch(`/merchants?name=${firstMerchant.name}`)
      .send({ type: "Herrero" })
      .expect(200);

    expect(res.body.type).toBe("Herrero");
  });

  test("Should not update a merchant if name query is missing", async () => {
    await request(app)
      .patch("/merchants")
      .send({ type: "Herrero" })
      .expect(400);
  });

  test("Should not update a merchant if name not found", async () => {
    await request(app)
      .patch(`/merchants?name=Desconocido`)
      .send({ type: "Herrero" })
      .expect(404);
  });

  test("Should reject invalid fields in update", async () => {
    await request(app)
      .patch(`/merchants?name=${firstMerchant.name}`)
      .send({ power: 999 })
      .expect(400);
  });
});

describe("DELETE /merchants/:id", () => {
  test("Should delete merchant by ID", async () => {
    const merchant = await Merchant.findOne({ name: firstMerchant.name });
    if (merchant) {
      await request(app).delete(`/merchants/${merchant._id}`).expect(200);
      const deleted = await Merchant.findById(merchant._id);
      expect(deleted).toBe(null);
    }
  });

  test("Should not delete a merchant if ID not found", async () => {
    await request(app)
      .delete("/merchants/507f191e810c19729de860ea")
      .expect(404);
  });
});

describe("DELETE /merchants?name=", () => {
  test("Should delete merchant by name", async () => {
    await request(app)
      .delete(`/merchants?name=${firstMerchant.name}`)
      .expect(200);
    const exists = await Merchant.findOne({ name: firstMerchant.name });
    expect(exists).toBe(null);
  });

  test("Should not delete a merchant if name not found", async () => {
    await request(app)
      .delete("/merchants?name=Desconocido")
      .expect(404);
  });

  test("Should not delete a merchant if query missing", async () => {
    await request(app).delete("/merchants").expect(400);
  });
});

*/