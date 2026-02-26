import request from "supertest";
import app from "../src/app.js";

//integration tests
describe("Auth Routes", () => {
  it("should signup a new user", async () => {
    const res = await request(app).post("/signup").send({
      name: "Test User",
      email: "testuser@mail.com",
      password: "password1234",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.email).toBe("testuser@mail.com");
  });

  it("should login an existing user", async () => {
    await request(app).post("/signup").send({
      name: "Login User",
      email: "login@mail.com",
      password: "password123",
    });

    const res = await request(app).post("/login").send({
      email: "login@mail.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should not signup with duplicate email", async () => {
    await request(app).post("/signup").send({
      name: "Duplicate One",
      email: "duplicate@mail.com",
      password: "password123",
    });

    const res = await request(app).post("/signup").send({
      name: "Duplicate Two",
      email: "duplicate@mail.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(409);
  });

  it("should reject invalid credentials on login", async () => {
    await request(app).post("/signup").send({
      name: "Invalid Login",
      email: "invalid@mail.com",
      password: "password123",
    });

    const res = await request(app).post("/login").send({
      email: "invalid@mail.com",
      password: "wrong-password",
    });

    expect(res.statusCode).toBe(401);
  });

  it("should treat email as case-insensitive on login", async () => {
    await request(app).post("/signup").send({
      name: "Case User",
      email: "CaseTest@Mail.com",
      password: "password123",
    });

    const res = await request(app).post("/login").send({
      email: "casetest@mail.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
