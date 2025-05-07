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
        .send({ material: "Acero de Mahakam" })
        .expect(200);

      expect(res.body.material).toBe("Acero de Mahakam");
    }
  });

  test("Should not allow invalid update fields", async () => {
    const bien = await Good.findOne({ name: firstGood.name });
    if (bien) {
      await request(app)
        .patch(`/goods/${bien._id}`)
        .send({ magic: "yes" })
        .expect(400);
    }
  });

  test("Should not update a good if good not found by ID", async () => {
    await request(app)
      .patch("/goods/507f191e810c19729de860ea")
      .send({ name: "Test" })
      .expect(404);
  });
});

describe("DELETE /goods/:id", () => {
  test("Should delete good by ID", async () => {
    const bien = await Good.findOne({ name: firstGood.name });
    if (bien) {
      await request(app).delete(`/goods/${bien._id}`).expect(200);
      const deleted = await Good.findById(bien._id);
      expect(deleted).toBe(null);
    }
  });

  test("Should not delete a good if ID not found", async () => {
    await request(app)
      .delete("/goods/507f191e810c19729de860ea")
      .expect(404);
  });
});