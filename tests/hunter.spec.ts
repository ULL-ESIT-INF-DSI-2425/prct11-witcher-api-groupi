import { describe, test, beforeEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/api.js"
import { Hunter } from "../src/models/hunter.js"

const firstHunter = {
  name: "Adolfo",
  location: "Islandia",
  race: "Humano"
};

beforeEach(async () => {
  await Hunter.deleteMany();
  await new Hunter(firstHunter).save();
});

describe("POST /hunters", () => {
  test("Should successfully create a new hunter", async () => {
    const response = await request(app)
      .post("/hunters")
      .send({
        name: "Katherine",
        location: "New York",
        race: "Humano"
      })
      .expect(201);

    expect(response.body).to.include({
      name: "Katherine",
      location: "New York",
      race: "Humano"
    });

    const hunter = await Hunter.findById(response.body._id);
    expect(hunter).not.toBe(null);
    expect(hunter?.location).toBe("New York");
  });

  test("Should fail to create hunter", async () => {
    await request(app)
      .post("/hunters")
      .send({}) 
      .expect(500);
  });
});

describe("GET /hunters", () => {
  test("Should get a hunter by name", async () => {
    const res = await request(app)
      .get(`/hunters?name=${firstHunter.name}`)
      .expect(200);
    expect(res.body.some((atribute) => atribute.name === firstHunter.name)).toBe(true);
  });

  test("Should not find a hunter if name not found", async () => {
    await request(app)
      .get("/hunters?name=prueba")
      .expect(404);
  });

});

describe("GET /hunters/:id", () => {
  test("Should get hunter by ID", async () => {
    const hunter = await Hunter.findOne({ name: firstHunter.name });
    if(hunter) {
      const res = await request(app).get(`/hunters/${hunter._id}`).expect(200);
      expect(res.body.name).toBe(firstHunter.name);
    }
  });

  test("Should not find a hunter if ID not found", async () => {
    await request(app)
      .get("/hunters/507f191e810c19729de860ea") 
      .expect(404);
  });

  test("Should not find a hunter if ID is invalid", async () => {
    await request(app).get("/hunters/holamundo").expect(500);
  });
});

describe("PATCH /hunters/:id", () => {
  test("Should update hunter by ID", async () => {
    const hunter = await Hunter.findOne({ name: firstHunter.name });
    if (hunter) {
      const res = await request(app)
        .patch(`/hunters/${hunter._id}`)
        .send({ location: "Toledo" })
        .expect(200);

      expect(res.body.location).toBe("Toledo");
    }
  });

  test("Should not allow invalid update fields", async () => {
    const hunter = await Hunter.findOne({ name: firstHunter.name });
    if (hunter) {
      await request(app)
        .patch(`/hunters/${hunter._id}`)
        .send({ magic: 999 })
        .expect(400);
    }
  });

  test("Should not update a hunter if ID not found", async () => {
    await request(app)
      .patch("/hunters/507f191e810c19729de860ea")
      .send({ name: "Hunter" })
      .expect(404);
  });
});


describe("PATCH /hunters?name=", () => {
  test("Should update hunter by name", async () => {
    const res = await request(app)
      .patch(`/hunters?name=${firstHunter.name}`)
      .send({ race: "Elfo" })
      .expect(200);

    expect(res.body.race).toBe("Elfo");
  });

  test("Should not update the hunter without name query", async () => {
    await request(app).patch("/hunters").send({ race: "Other" }).expect(400);
  });

  test("Should not update the hunter if name not found", async () => {
    await request(app)
      .patch("/hunters?name=Nadie")
      .send({ race: "Elfo" })
      .expect(404);
  });

  test("Should reject invalid update fields", async () => {
    await request(app)
      .patch(`/hunters/${firstHunter.name}`)
      .send({ test: "Test" })
      .expect(400);
  });
});

describe("DELETE /hunters/:id", () => {
  test("Should delete hunter by ID", async () => {
    const hunter = await Hunter.findOne({ name: firstHunter.name });
    if (hunter) {
      await request(app).delete(`/hunters/${hunter._id}`).expect(200);
      const deleted = await Hunter.findById(hunter._id);
      expect(deleted).toBe(null);
    }
  });

  test("Should not delete a hunter if ID not found", async () => {
    await request(app)
      .delete("/hunters/507f191e810c19729de860ea")
      .expect(404);
  });
});

describe("DELETE /hunters?name=", () => {
  test("Should delete hunter by name", async () => {
    await request(app)
      .delete(`/hunters?name=${firstHunter.name}`)
      .expect(200);

    const exists = await Hunter.findOne({ name: firstHunter.name });
    expect(exists).toBe(null);
  });

  test("Should not delete a hunter if name not found", async () => {
    await request(app)
      .delete("/hunters?name=NoOne")
      .expect(404);
  });

  test("Should not delete a hunter if query missing", async () => {
    await request(app).delete("/hunters").expect(400);
  });
});


