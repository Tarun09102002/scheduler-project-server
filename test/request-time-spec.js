let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../index.js");
chai.should();
chai.use(chaiHttp);
const token =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNTgyNzQzZWI1NWM4MGEyMWNiM2MyZCIsImlhdCI6MTY2OTgxNTM0Mn0.TR7DnGkAKqZjiZnCC7QXKWiytqYd6mcOlSXujFhWAs4";
describe("User API", () => {
	describe("Register Test", () => {
		//valid user
		it("should return success", (done) => {
			chai
				.request(server)
				.post("/register")
				.set("content-type", "application/x-www-form-urlencoded")
				.send({
					Name: "Atman",
					Username: "test",
					Email: "test@test.com",
					Password: "test",
				})
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});
		it("should return error", (done) => {
			chai
				.request(server)
				.post("/register")
				.set("content-type", "application/x-www-form-urlencoded")
				.send({
					Name: "Atman",
					Username: "test",
					Email: "test@test.com",
					Password: "test",
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});
	});
	describe("Login Test", () => {
		//valid user
		it("should return success", (done) => {
			chai
				.request(server)
				.post("/login")
				.set("content-type", "application/x-www-form-urlencoded")
				.send({
					Username: "test",
					Password: "test",
				})
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});
	});
	describe("User data", () => {
		describe("Fetch user events", () => {
			it("should return events", (done) => {
				chai
					.request(server)
					.get("/tasks/" + token)
					.end((err, res) => {
						res.should.have.status(200);
						done();
					});
			});
		});
		describe("Add Event", () => {
			it("should return success", (done) => {
				chai
					.request(server)
					.post("/add/tasks/" + token)
					.set("content-type", "application/x-www-form-urlencoded")
					.send({
						title: "test",
						description: "test",
						color: "rgb(203, 233, 195)",
						start: "10",
						end: "12",
						date: "2022-12-12",
					})
					.end((err, res) => {
						res.should.have.status(200);
						done();
					});
			});
		});
		describe("Add Meet", () => {
			it("should return success", (done) => {
				chai
					.request(server)
					.post("/add/meet/" + token)
					.set("content-type", "application/x-www-form-urlencoded")
					.send({
						title: "test",
						description: "test",
						color: "rgb(203, 233, 195)",
						start: "10",
						end: "12",
						date: "2022-12-12",
						link: "dafada",
						participants: ["123tarun02@gmail.com"],
					})
					.end((err, res) => {
						res.should.have.status(200);
						done();
					});
			});
		});
	});
});
