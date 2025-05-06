import { describe, test, beforeEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/api.js"
import { Merchant } from "../src/models/merchant.js"

const firstMerchant = {
  name: "Francisco",
  location: "Narnia",
  type: "Herrero"
};

beforeEach(async () => {
  await Merchant.deleteMany();
  await new Merchant(firstMerchant).save();
});

describe("POST /merchants", () => {
  test("Should successfully create a new merchant", async () => {
    const response = await request(app)
      .post("/merchants")
      .send({
        name: "Nicky",
        location: "Holanda",
        type: "Alquimista"
      })
      .expect(201);

    expect(response.body).to.include({
      name: "Nicky",
      location: "Holanda",
      type: "Alquimista"
    });

    const merchant = await Merchant.findById(response.body._id);
    expect(merchant).not.toBe(null);
    expect(merchant?.location).toBe("Holanda");
  });

  test("Should fail to create merchant", async () => {
    await request(app)
      .post("/merchants")
      .send({})
      .expect(500);
  });
});

describe("GET /merchants", () => {
  test("Should get a merchant by name", async () => {
    const res = await request(app)
      .get(`/merchants?name=${firstMerchant.name}`)
      .expect(200);
    expect(res.body.name).toBe(firstMerchant.name);
  });

  test("Should not find a merchant if name not found", async () => {
    await request(app)
      .get("/merchants?name=prueba")
      .expect(404);
  });

  test("Should not find a merchant if name param is missing", async () => {
    await request(app).get("/merchants").expect(404);
  });
});

describe("GET /merchants/:id", () => {
  test("Should get merchant by ID", async () => {
    const merchant = await Merchant.findOne({ name: firstMerchant.name });
    if (merchant) {
      const res = await request(app).get(`/merchants/${merchant._id}`).expect(200);
      expect(res.body.name).toBe(firstMerchant.name);
    }
  });

  test("Should not find a merchant if ID not found", async () => {
    await request(app)
      .get("/merchants/507f191e810c19729de860ea")
      .expect(404);
  });

  test("Should not find a merchant if ID is invalid", async () => {
    await request(app).get("/merchants/holamundo").expect(500);
  });
});

describe("GET /merchants/location/:location", () => {
  test("Should get merchant by location", async () => {
    const res = await request(app)
      .get(`/merchants/location/${firstMerchant.location}`)
      .expect(200);

    expect(res.body.name).toBe(firstMerchant.name);
  });

  test("Should not find a merchant if location not found", async () => {
    await request(app).get("/merchants/location/nose").expect(404);
  });
});

describe("GET /merchants/type/:type", () => {
  test("Should get merchant by type", async () => {
    const res = await request(app)
      .get(`/merchants/type/${firstMerchant.type}`)
      .expect(200);

    expect(res.body.name).toBe(firstMerchant.name);
  });

  test("Should return 404 if type not found", async () => {
    await request(app).get("/merchants/type/Desconocido").expect(404);
  });
});

describe("PATCH /merchants/:id", () => {
  test("Should update merchant by ID", async () => {
    const merchant = await Merchant.findOne({ name: firstMerchant.name });
    if (merchant) {
      const res = await request(app)
        .patch(`/merchants/${merchant._id}`)
        .send({ location: "Hawai" })
        .expect(200);

      expect(res.body.location).toBe("Hawai");
    }
  });

  test("Should not allow invalid update fields", async () => {
    const merchant = await Merchant.findOne({ name: firstMerchant.name });
    if (merchant) {
      await request(app)
        .patch(`/merchants/${merchant._id}`)
        .send({ magic: "yes" })
        .expect(400);
    }
  });

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
