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
// I hate these stupid fucking test cases
/*
describe("Register API", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({
        username: `testuser_${Date.now()}`,
        password: "strongpassword123",
        email: `user_${Date.now()}@example.com`,
        phone_number: "3035551234",
      });
    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal("User registered successfully");
  });

  it("should fail when username or password missing", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ username: "", password: "" });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal("Username and password are required.");
  });
});
*/

//  LOGIN TESTS


describe("Login API", () => {
  it("should log in successfully with correct credentials", async () => {
    const username = `loginuser_${Date.now()}`;
    const password = "securepass123";

    
    await request(app)
      .post("/api/users/register")
      .send({ username, password, email: `${username}@example.com` });

    
    const res = await request(app)
      .post("/api/users/login")
      .type("form")
      .send({ username, password });
    expect(res.status).to.equal(302); // redirect to "/"
  });

  it("should fail to log in with incorrect password", async () => {
    const username = `failuser_${Date.now()}`;
    const password = "correctpassword";
  
    await request(app)
      .post("/api/users/register")
      .send({ username, password, email: `${username}@example.com` });
  
    const res = await request(app)
      .post("/api/users/login")
      .type("form")
      .send({ username, password: "wrongpassword" });
  
    expect(res.status).to.equal(200);
  
    expect(res.header.location).to.be.undefined;
  
    expect(res.text).to.include("<!DOCTYPE html>");
  });
});


//  EXTRA CREDIT TESTS

describe("Logout API", () => {
  it("should log out successfully", async () => {
    const res = await request(app).post("/api/users/logout");
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Logged out successfully");
  });
});

describe("Get Users API", () => {
  it("should fetch all users (positive test)", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("should handle database error gracefully (negative test)", async () => {
    const res = await request(app).get("/api/users_invalid");
    expect(res.status).to.be.oneOf([404, 500]); 
  });
});
