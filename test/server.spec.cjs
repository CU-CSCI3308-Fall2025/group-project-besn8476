const request = require("supertest");
const appModule = require("../index.js");
const app = appModule.default || appModule;
const chai = require("chai");
const { expect } = chai;

/*
This was super annoying and I had to do differently because our project is in ES6 modules
*/

//  BASE ROUTE TESTS
describe("Server!", () => {
  it("should return the home page (200)", async () => {
    const res = await request(app).get("/");
    expect(res.status).to.equal(200);
  });
});

//  REGISTER TESTS

describe("Register API", () => {
  it("should register a new CU Boulder user successfully", async () => {
    const username = `testuser_${Date.now()}`;

    const res = await request(app)
      .post("/api/users/register")
      .send({
        username,
        password: "strongpassword123",
        email: `${username}@colorado.edu`,
        phone_number: "3035551234",
      });

    expect(res.status).to.equal(302);
    expect(res.header.location).to.equal("/");
  });

  it("should fail when username or password are missing", async () => {
    const res = await request(app).post("/api/users/register").send({
      username: "",
      password: "",
      email: "fake@colorado.edu",
    });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal("Username and password are required.");
  });

  it("should reject non-CU Boulder emails", async () => {
    const username = `bademail_${Date.now()}`;

    const res = await request(app)
      .post("/api/users/register")
      .send({
        username,
        password: "strongpassword123",
        email: `${username}@gmail.com`,
      });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal(
      "Email must be a valid @colorado.edu address."
    );
  });

  it("should fail when username or email already exists", async () => {
    const username = `dupe_${Date.now()}`;
    const email = `${username}@colorado.edu`;

    await request(app).post("/api/users/register").send({
      username,
      password: "pass123",
      email,
    });

    const res = await request(app).post("/api/users/register").send({
      username,
      password: "pass123",
      email,
    });

    expect(res.status).to.equal(409);
    expect(res.body.error).to.equal("Username or email already taken.");
  });
});

//  LOGIN TESTS
describe("Login API", () => {
  it("should log in successfully with correct credentials", async () => {
    const username = `loginuser_${Date.now()}`;
    const password = "securepass123";

    await request(app)
      .post("/api/users/register")
      .send({
        username,
        password,
        email: `${username}@colorado.edu`,
      });

    const res = await request(app)
      .post("/api/users/login")
      .type("form")
      .send({ username, password });

    expect(res.status).to.equal(302);
    expect(res.header.location).to.equal("/");
  });

  it("should fail login with incorrect password", async () => {
    const username = `wrongpass_${Date.now()}`;

    await request(app)
      .post("/api/users/register")
      .send({
        username,
        password: "correctpassword",
        email: `${username}@colorado.edu`,
      });

    const res = await request(app)
      .post("/api/users/login")
      .type("form")
      .send({ username, password: "incorrect" });

    expect(res.status).to.equal(200);
    expect(res.text).to.include("<!DOCTYPE html>");
    expect(res.text).to.include("Incorrect password.");
  });

  it("should fail when user does not exist", async () => {
    const res = await request(app).post("/api/users/login").type("form").send({
      username: "nonexistent_user",
      password: "anything",
    });

    expect(res.status).to.equal(200);
    expect(res.text).to.include("User not found.");
  });
});

//  EXTRA CREDIT TESTS

describe("Logout API", () => {
  it("should render the logout page successfully", async () => {
    const res = await request(app).get("/logout");

    expect(res.status).to.equal(200);
    expect(res.text).to.include("<!DOCTYPE html>");
    expect(res.text).to.include("<html");
    expect(res.text.toLowerCase()).to.include("logout");
  });
});

describe("Get Users API", () => {
  it("should return an array of users", async () => {
    const res = await request(app).get("/api/users");

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("should return 404 or 500 for invalid route", async () => {
    const res = await request(app).get("/api/users_invalid");

    expect(res.status).to.be.oneOf([404, 500]);
  });
});
