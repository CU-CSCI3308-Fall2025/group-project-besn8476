// ********************** Initialize server **********************************
const server = require("../index.js");

// ********************** Import Libraries ***********************************
const chai = require("chai");
const chaiHttp = require("chai-http");


chai.use(chaiHttp);
chai.should();
const { expect, assert } = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************
describe("Server!", () => {
  it("Returns the default welcome message", (done) => {
    chai
      .request(server)
      .get("/welcome")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equal("success");
        assert.strictEqual(res.body.message, "Welcome!");
        done();
      });
  });
});

// *********************** HOME PAGE TEST ************************************
describe("GET / (Home Page)", () => {
  it("should return status 200 and contain CU Marketplace in HTML", (done) => {
    chai
      .request(server)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.include("CU Marketplace");
        done();
      });
  });
});

// *********************** LOGIN PAGE TEST ***********************************
describe("GET /login (Login Page)", () => {
  it("should return status 200 and contain Login - CU Marketplace in HTML", (done) => {
    chai
      .request(server)
      .get("/login")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.include("Login - CU Marketplace");
        done();
      });
  });
});
