import request from 'supertest';
import { describe, test, beforeEach, expect } from 'vitest';
import { app } from '../../src/api.js';
import { Good } from '../../src/models/good.js';
import { Hunter } from '../../src/models/hunter.js';

const firstHunter = {
  name: "Manolo",
  location: "Suecia",
  race: "Humano"
};

const firstGood = {
  name: "Espaditaa",
  description: "Es una espadita de plata",
  material: "Acero de Mahakam",
  weight: 34,
  value_in_crowns: 200,
  stock: 3
};

describe("POST /transactions", () => {
  beforeEach(async () => {
    console.log("🔁 Ejecutando beforeEach...");


    await Hunter.deleteMany();
    await Good.deleteMany();

    const hunter = new Hunter(firstHunter);
    await hunter.save();
    console.log("✅ Hunter creado:", hunter.name);

    const good = new Good(firstGood);
    await good.save();
    console.log("✅ Good creado:", good.name);
  });
/*
  test("🧪 Verifica que Hunter y Good existen antes del POST", async () => {
    const hunter = await Hunter.findOne({ name: "Manolo" });
    const good = await Good.findOne({ name: "Espaditaa" });

    console.log("🧩 Hunter en DB:", hunter);
    console.log("🧩 Good en DB:", good);

    expect(hunter).not.toBeNull();
    expect(good).not.toBeNull();
  });

  test("✅ POST /transactions - should create a valid transaction", async () => {
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

    console.log("📥 Respuesta POST:", res.status, res.body);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.type).toBe("buy");
    expect(res.body.personName).toBe("Manolo");
    expect(res.body.totalImport).toBe(200);
    expect(res.body.goods[0].quantity).toBe(1);
  });*/
  
describe("POST /transactions", () => {
  test("should create a valid transaction", async () => {
    const res = await request(app).post("/transactions").send({
      typeTrans: "buy",
      personName: "Geralt",
      goods: [{ name: "Espada de plata", quantity: 1 }]
    });

    expect(res.status).toBe(201);
    expect(res.body.personName).toBe("Geralt");
    expect(res.body.amount).toBe(1);
    expect(res.body.totalImport).toBe(100);
  });

  test("should fail with invalid good", async () => {
    const res = await request(app).post("/transactions").send({
      typeTrans: "buy",
      personName: "Geralt",
      goods: [{ name: "Inexistente", quantity: 1 }]
    });

    expect(res.status).toBe(404);
  });

  test("should fail with invalid hunter", async () => {
    const res = await request(app).post("/transactions").send({
      typeTrans: "buy",
      personName: "Yennefer",
      goods: [{ name: "Espada de plata", quantity: 1 }]
    });

    expect(res.status).toBe(404);
  });
});

describe("GET /transactions", () => {
  test("should retrieve all transactions", async () => {
    const res = await request(app).get("/transactions").expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("should return 404 with unmatched query", async () => {
    const res = await request(app).get("/transactions?personName=Triss");
    expect(res.status).toBe(404);
  });
});

describe("GET /transactions/:id", () => {
  test("should retrieve transaction by ID", async () => {
    const res = await request(app).get(`/transactions/${transactionId}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(transactionId);
  });

  test("should return 404 if transaction not found", async () => {
    const res = await request(app).get("/transactions/507f1f77bcf86cd799439011");
    expect(res.status).toBe(404);
  });

  test("should return 500 with invalid ID format", async () => {
    const res = await request(app).get("/transactions/invalid-id");
    expect(res.status).toBe(500);
  });
});

describe("GET /transactions/date/:date", () => {
  test("should return transactions for a valid date", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await request(app).get(`/transactions/date/${today}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("should return 400 for invalid date", async () => {
    const res = await request(app).get("/transactions/date/not-a-date");
    expect(res.status).toBe(400);
  });

  test("should return 400 if no transactions that day", async () => {
    const res = await request(app).get("/transactions/date/1900-01-01");
    expect(res.status).toBe(400);
  });
});

describe("PATCH /transactions/:id", () => {
  test("should update the transaction", async () => {
    const res = await request(app).patch(`/transactions/${transactionId}`).send({
      goods: [{ name: "Espada de plata", quantity: 1 }]
    });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(1);
    expect(res.body.data.totalImport).toBe(100);
  });

  test("should fail with invalid good", async () => {
    const res = await request(app).patch(`/transactions/${transactionId}`).send({
      goods: [{ name: "Ficticio", quantity: 1 }]
    });

    expect(res.status).toBe(400);
  });

  test("should return 404 if transaction not found", async () => {
    const res = await request(app).patch("/transactions/507f1f77bcf86cd799439011").send({
      goods: [{ name: "Espada de plata", quantity: 1 }]
    });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /transactions/:id", () => {
  test("should delete the transaction", async () => {
    const res = await request(app).delete(`/transactions/${transactionId}`);
    expect(res.status).toBe(200);

    const check = await Transaction.findById(transactionId);
    expect(check).toBeNull();
  });

  test("should return 404 if not found", async () => {
    const res = await request(app).delete("/transactions/507f1f77bcf86cd799439011");
    expect(res.status).toBe(404);
  });
});

describe("DELETE /transactions?personName=Geralt", () => {
  test("should delete transactions by query", async () => {
    const res = await request(app).delete("/transactions?personName=Geralt");
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Se eliminaron");
  });

  test("should return 404 if no transactions match", async () => {
    const res = await request(app).delete("/transactions?personName=NoExiste");
    expect(res.status).toBe(404);
  });
});
});