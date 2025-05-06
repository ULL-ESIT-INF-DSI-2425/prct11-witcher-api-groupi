import { describe, test, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/api.js";
import { User } from "../src/models/user.js";

beforeEach(async () => {
  await User.deleteMany();
});
describe("POST /users", () => {
  test("Should successfully create a new user", async () => {
    await request(app)
      .post("/users")
      .send({
        name: "Estelita",
        username: "6",
        age: 18
      })
      .expect(201);
  });
});