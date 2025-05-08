import request from 'supertest';
import { describe, test, beforeEach, expect } from 'vitest';
import { app } from '../../src/api.js';
import { Good } from '../../src/models/good.js';
import { Hunter } from '../../src/models/hunter.js';
import { Merchant } from '../../src/models/merchant.js';

const firstHunter = {
  name: "Manolo",
  location: "Suecia",
  race: "Humano"
};
const firstMerchant = {
  name: "Juan",
  location: "Novigrado",
  type: "Herrero"
};
const firstGood = {
  name: "Espaditaa",
  description: "Es una espadita de plata",
  material: "Acero de Mahakam",
  weight: 34,
  value_in_crowns: 200,
  stock: 30
};

describe("transactions tests", () => {
  beforeEach(async () => {
    await Hunter.deleteMany();
    await Good.deleteMany();
    await Merchant.deleteMany();
    const hunter = new Hunter(firstHunter);
    await hunter.save();
    const good = new Good(firstGood);
    await good.save();
    const merchant = new Merchant(firstMerchant);
    await merchant.save();

  });

  test("POST /transactions - Should create a transaction", async () => {
    const res = await request(app)
      .post("/transactions")
      .send({
        typeTrans: "buy",
        personName: "Manolo",
        goods: [
          {
            name: "Espaditaa",
            quantity: 1
          }
        ]
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.type).toBe("buy");
    expect(res.body.personName).toBe("Manolo");
    expect(res.body.totalImport).toBe(200);
    expect(res.body.goods[0].quantity).toBe(1);
  });
  test("POST /transactions - Stock is not big enough, test should failed", async () => {
    const res = await request(app).post("/transactions").send({
      typeTrans: "buy",
      personName: "Manolo",
      goods: [{ name: "Espaditaa", quantity: 1000 }]
    });

    expect(res.status).toBe(500);
    expect(res.text).toContain("Stock insuficiente");
  });
  test("POST /transactions - Merchant can sell a good", async () => {
    const res = await request(app).post("/transactions").send({
      typeTrans: "sell",
      personName: "Juan",
      goods: [{ name: "Espaditaa", quantity: 1 }]
    });

    expect(res.status).toBe(201);
    expect(res.body.type).toBe("sell");
    expect(res.body.personName).toBe("Juan");
    expect(res.body.totalImport).toBe(200);
  });
  test("POST /transactions - Should fail if merchant does not exist", async () => {
    const res = await request(app).post("/transactions").send({
      typeTrans: "sell",
      personName: "NonExistingMerchant",
      goods: [{ name: "Espaditaa", quantity: 1 }]
    });

    expect(res.status).toBe(404);
    expect(res.text).toContain("No se ha encontrado ningún personaje con ese nombre");
  });
  test("POST /transactions - Should fail if good name is missing", async () => {
    const res = await request(app).post("/transactions").send({
      typeTrans: "sell",
      personName: "Juan",
      goods: [{ quantity: 1 }]
    });

    expect(res.status).toBe(400);
    expect(res.text).toContain("Nombre o cantidad de bien inválido");
  });
  test("POST /transactions - Should create new good if it doesn't exist and is being sold", async () => {
    const res = await request(app).post("/transactions").send({
      typeTrans: "sell",
      personName: "Juan",
      goods: [{ name: "NewGood", quantity: 2 }]
    });

    expect(res.status).toBe(201);
    expect(res.body.goods[0].quantity).toBe(2);

    const newGood = await Good.findOne({ name: "NewGood" });
    expect(newGood).not.toBeNull();
  });
  
  test("POST /transactions - Should failed if person doesnt exists", async () => {
    const res = await request(app).post("/transactions").send({
      typeTrans: "buy",
      personName: "NoExiste",
      goods: [{ name: "Espaditaa", quantity: 1 }]
    });

    expect(res.status).toBe(404);
    expect(res.text).toContain("No se ha encontrado ningún personaje con ese nombre");
  });

  test("GET /transactions - should return a list of transactions", async () => {
    await request(app).post("/transactions").send({
      typeTrans: "buy",
      personName: "Manolo",
      goods: [{ name: "Espaditaa", quantity: 1 }]
    });

    const res = await request(app).get("/transactions");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  test("GET /transactions/date/:date -returns all transactions made that day", async () => {
    await request(app).post("/transactions").send({
      typeTrans: "buy",
      personName: "Manolo",
      goods: [{ name: "Espaditaa", quantity: 1 }]
    });

    const today = new Date().toISOString().split("T")[0]; 
    const res = await request(app).get(`/transactions/date/${today}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("DELETE /transactions/:id - deletes an existing transaction", async () => {
    const postRes = await request(app).post("/transactions").send({
      typeTrans: "buy",
      personName: "Manolo",
      goods: [{ name: "Espaditaa", quantity: 1 }]
    });

    const deleteRes = await request(app).delete(`/transactions/${postRes.body._id}`);
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get(`/transactions/${postRes.body._id}`);
    expect(getRes.status).toBe(404);
  });
  test("DELETE /transactions/:id - Should delete a transaction by ID and revert stock", async () => {
    const postRes = await request(app).post("/transactions").send({
      typeTrans: "buy",
      personName: "Manolo",
      goods: [{ name: "Espaditaa", quantity: 1 }]
    });

    const deleteRes = await request(app).delete(`/transactions/${postRes.body._id}`);
    expect(deleteRes.status).toBe(200);
    const good = await Good.findOne({ name: "Espaditaa" });
    if (good) {
      expect(good.stock).toBe(30); 
    }
  });

  test("PATCH /transactions/:id - updates a good of a transaction", async () => {
    const postRes = await request(app).post("/transactions").send({
      typeTrans: "buy",
      personName: "Manolo",
      goods: [{ name: "Espaditaa", quantity: 1 }]
    });

    const patchRes = await request(app).patch(`/transactions/${postRes.body._id}`).send({
      goods: [{ name: "Espaditaa", quantity: 2 }]
    });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.amount).toBe(2);
  });
  test("PATCH /transactions/:id - Should update a transaction's goods", async () => {
    const postRes = await request(app).post("/transactions").send({
      typeTrans: "buy",
      personName: "Manolo",
      goods: [{ name: "Espaditaa", quantity: 1 }]
    });

    const patchRes = await request(app).patch(`/transactions/${postRes.body._id}`).send({
      goods: [{ name: "Espaditaa", quantity: 2 }]
    });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.amount).toBe(2);
  });
  test("PATCH /transactions/:id - Should fail if good in update does not exist", async () => {
    const postRes = await request(app).post("/transactions").send({
      typeTrans: "buy",
      personName: "Manolo",
      goods: [{ name: "Espaditaa", quantity: 1 }]
    });

    const patchRes = await request(app).patch(`/transactions/${postRes.body._id}`).send({
      goods: [{ name: "NonExistentGood", quantity: 1 }]
    });

    expect(patchRes.status).toBe(400);
    expect(patchRes.body.message).toContain(`Bien con nombre "NonExistentGood" no encontrado`);
  });
  test("PATCH /transactions - should fail if reverting the original transaction exceeds available stock", async () => {
    await Good.updateOne({ name: "Espaditaa" }, { $set: { stock: 0 } });

    const postRes = await request(app).post("/transactions").send({
      typeTrans: "sell", // Tipo SELL, revertirá como BUY (quita stock)
      personName: "Juan",
      goods: [{ name: "Espaditaa", quantity: 1 }]
    });

    expect(postRes.status).toBe(201);

    const patchRes = await request(app)
      .patch("/transactions")
      .query({ personName: "Juan" })
      .send({
        goods: [{ name: "Espaditaa", quantity: 1 }]
      });

    expect(patchRes.status).toBe(400);
    expect(patchRes.body.message).toContain("No se pudo revertir el stock anterior");
  });
});

