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
  });
  
});