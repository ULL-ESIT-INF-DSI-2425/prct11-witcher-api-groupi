import { describe, test, beforeEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/api.js";
import { Transaction } from "../src/models/transactions.js";
import { Good } from "../src/models/good.js";
import { Hunter } from "../src/models/hunter.js";

const testGoods = [
  { name: "Espada de plata", description: "Corta monstruos", weight: 3, value_in_crowns: 100, stock: 10 },
  { name: "Poción de golondrina", description: "Regenera vida", weight: 0.5, value_in_crowns: 50, stock: 20 }
];

const testHunter = { name: "Geralt", guild: "Lobo" };

const transactionBody = {
  typeTrans: "buy",
  personName: testHunter.name,
  goods: [
    { name: "Espada de plata", quantity: 2 },
    { name: "Poción de golondrina", quantity: 1 }
  ]
};

let transactionId;

beforeEach(async () => {
  await Transaction.deleteMany();
  await Good.deleteMany();
  await Hunter.deleteMany();

  await Good.insertMany(testGoods);
  await new Hunter(testHunter).save();

  const res = await request(app)
    .post("/transactions")
    .send(transactionBody)
    .expect(201);

  transactionId = res.body._id;
});

describe("POST /transactions", () => {
  test("Should create a new transaction", async () => {
    const res = await request(app)
      .post("/transactions")
      .send(transactionBody)
      .expect(201);

    expect(res.body.personName).toBe("Geralt");
    expect(res.body.goods.length).toBe(2);
  });

  test("Should fail with missing fields", async () => {
    await request(app)
      .post("/transactions")
      .send({})
      .expect(400);
  });
});

describe("GET /transactions", () => {
  test("Should return all transactions", async () => {
    const res = await request(app).get("/transactions").expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("Should return 404 if no matching query", async () => {
    await request(app).get("/transactions?personName=Inexistente").expect(404);
  });
});

describe("GET /transactions/:id", () => {
  test("Should return a transaction by ID", async () => {
    const res = await request(app).get(`/transactions/${transactionId}`).expect(200);
    expect(res.body._id).toBe(transactionId);
  });

  test("Should return 404 if not found", async () => {
    await request(app).get("/transactions/507f1f77bcf86cd799439011").expect(404);
  });

  test("Should return 500 for invalid ID", async () => {
    await request(app).get("/transactions/invalid-id").expect(500);
  });
});

describe("PATCH /transactions/:id", () => {
  test("Should update a transaction", async () => {
    const res = await request(app)
      .patch(`/transactions/${transactionId}`)
      .send({
        goods: [
          { name: "Espada de plata", quantity: 1 }
        ]
      })
      .expect(200);

    expect(res.body.data.amount).toBe(1);
  });

  test("Should fail with invalid good name", async () => {
    await request(app)
      .patch(`/transactions/${transactionId}`)
      .send({
        goods: [{ name: "NoExiste", quantity: 1 }]
      })
      .expect(400);
  });
});

describe("DELETE /transactions/:id", () => {
  test("Should delete a transaction", async () => {
    await request(app).delete(`/transactions/${transactionId}`).expect(200);
    const found = await Transaction.findById(transactionId);
    expect(found).toBe(null);
  });

  test("Should return 404 if ID not found", async () => {
    await request(app)
      .delete("/transactions/507f1f77bcf86cd799439011")
      .expect(404);
  });
});

describe("DELETE /transactions?personName=", () => {
  test("Should delete transactions by query", async () => {
    await request(app)
      .delete("/transactions?personName=Geralt")
      .expect(200);

    const remaining = await Transaction.find({ personName: "Geralt" });
    expect(remaining.length).toBe(0);
  });

  test("Should return 404 if no transaction matches query", async () => {
    await request(app)
      .delete("/transactions?personName=NoExiste")
      .expect(404);
  });
});
