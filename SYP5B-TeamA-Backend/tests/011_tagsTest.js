const chai = require("chai");
const chaiHttp = require("chai-http");

const config = require('config');
const {
  server,
  checkErrorResponse,
  ensureServerIsRunning,
} = require("./000_helpersTest");

chai.use(chaiHttp);
chai.should();

const url = config.get('backend.apiPrefix') + "/tags";

before((done) => {
  ensureServerIsRunning(server, done);
});

describe("CRUD Entity /tags " + url, () => {
  let generatedTagIds = [];
  let tagDeletedId = null;
  let numberOfExistingTags = 0;
    
  let token;
  let generatedUserId;

  before(async function () {});

  let validCredentials = {
    username: "newmann-r@user.com",
    password: "1234",
  };

  it("AB_01 POST - Create new user - 201", (done) => {
    let user = {
      lastname: "Newman",
      firstname: "Randy",
      username: "newmann-r@user.com",
      password: "1234",
      state: "active",
    };

    chai
      .request(server)
      .post(config.backend.apiPrefix + "/users")
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.not.have.property("password");
        generatedUserId = res.body._id;

        done();
      });
  });

  it("AB_02 POST - Login user - 200", (done) => {
    chai
      .request(server)
      .post(config.backend.apiPrefix + "/login")
      .send(validCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("token");
        token = res.body.token;
        done();
      });
  });

  it("TG_00 GET all tags (before creation, expect empty array) - 200", (done) => {
    chai
      .request(server)
      .get(url)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        numberOfExistingUsers = res.body.length;
        done();
      });
  });

  it("TG_01 POST Create tag - 201", (done) => {
    let tag = {
      name: "english",
    };

    chai
      .request(server)
      .post(url)
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        Object.keys(res.body).length.should.eql(3);

        res.body.should.have.property("_id").not.to.be.null;
        res.body.should.have.property("name").eql(tag.name);

        generatedTagIds.push(res.body._id);
        done();
      });
  });
  it("TG_02 create second tag - 201", (done) => {
    let tag = {
      name: "maths",
    };

    chai
      .request(server)
      .post(url)
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        Object.keys(res.body).length.should.eql(3);

        res.body.should.have.property("_id").not.to.be.null;
        res.body.should.have.property("name").eql(tag.name);

        generatedTagIds.push(res.body._id);
        done();
      });
  });
  it("TG_03 create third tag - 201", (done) => {
    let tag = {
      name: "programming",
    };

    chai
      .request(server)
      .post(url)
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        Object.keys(res.body).length.should.eql(3);

        res.body.should.have.property("_id").not.to.be.null;
        res.body.should.have.property("name").eql(tag.name);

        generatedTagIds.push(res.body._id);
        done();
      });
  });

  it("TG_04 create tag - missing properties - 400", (done) => {
    let tag = {
      wrong: "prop"
    };

    chai
      .request(server)
      .post(url)
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("TG_05 create tag - empty object - 400", (done) => {
    let tag = {};

    chai
      .request(server)
      .post(url)
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("TG_06 create tag - incorrect paylod only a string was send - 400", (done) => {
    let tag = "";

    chai
      .request(server)
      .post(url)
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("TG_07 create tag - name not unique - 400", (done) => {
    let category = {
      name: "maths",
    };

    chai
      .request(server)
      .post(url)
      .set("Authorization", "Bearer " + token)
      .send(category)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("TG_08 GET all tags - 200", (done) => {
    chai
      .request(server)
      .get(url)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(
          generatedTagIds.length + numberOfExistingTags
        );

        let currentCategory = res.body[0];
        Object.keys(currentCategory).length.should.eql(3);

        currentCategory.should.have.property("_id").not.to.be.null;
        currentCategory.should.have.property("name");

        done();
      });
  });

  it("TG_09 GET a single tag by id - 200", (done) => {
    chai
      .request(server)
      .get(url + "/" + generatedTagIds[0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.not.have.property("length");
        res.body.should.have.property("_id").eql(generatedTagIds[0]);
        done();
      });
  });

  it("TG_10 GET - url not correct formatted - 404", (done) => {
    chai
      .request(server)
      .get(url + "/unknown")
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("TG_11 PATCH - Update first tag - 200", (done) => {
    let tag = {
      name: "history",
    };
    chai
      .request(server)
      .patch(url + "/" + generatedTagIds[0])
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("name").eql(tag.name);
        done();
      });
  });

  it("TG_12 PATCH - Update second tag - 200", (done) => {
    let tag = {
      name: "geography",
    };
    chai
      .request(server)
      .patch(url + "/" + generatedTagIds[1])
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("name").eql(tag.name);
        done();
      });
  });

  it("TG_13 PATCH - Update third tag - 200", (done) => {
    let tag = {
      name: "maths",
    };
    chai
      .request(server)
      .patch(url + "/" + generatedTagIds[2])
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("name").eql(tag.name);
        done();
      });
  });

  it("TG_14 PATCH category to update - id not in correct format - 404", (done) => {
    let tag = {
      name: "inactive",
    };

    chai
      .request(server)
      .patch(url + "/234-56232")
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("TG_15 PATCH tag incorrect payload - wrong property - 400", (done) => {
    let tag = {
      age: 2,
    };

    chai
      .request(server)
      .patch(url + "/" + generatedTagIds[0])
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("TG_16 PATCH tag incorrect payload - wrong id delivered - 400", (done) => {
    let tag = {
      id: 40404,
      lastname: "Boyle_1"
    };

    chai
      .request(server)
      .patch(url + "/" + generatedTagIds[0])
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("TG_17 PATCH tag - no payload - 400", (done) => {
    let tag = {};

    chai
      .request(server)
      .patch(url + "/" + generatedTagIds[0])
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("TG_18 DELETE first tag - 204", (done) => {
    tagDeletedId = generatedTagIds[0];
    chai
      .request(server)
      .delete(url + "/" + generatedTagIds[0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
        generatedTagIds = generatedTagIds.filter(
          (x) => x != generatedTagIds[0]
        );
      });
  });

  it("TG_19 GET - try to get the deleted tag again - 404", (done) => {
    chai
      .request(server)
      .get(url + "/" + tagDeletedId)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("TG_20 DELETE - delete first tag again - 404", (done) => {
    chai
      .request(server)
      .delete(url + "/" + tagDeletedId)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("TG_21 DELETE second tag - 204", (done) => {
    chai
      .request(server)
      .delete(url + "/" + generatedTagIds[0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
        generatedTagIds = generatedTagIds.filter(
          (x) => x != generatedTagIds[0]
        );
      });
  });

  it("TG_22 GET all tags (after deletion of two tags) - 200", (done) => {
    chai
      .request(server)
      .get(url)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(
          generatedTagIds.length + numberOfExistingTags
        );
        done();
      });
  });
  it("TG_23 DELETE last tag - 204", (done) => {
    chai
      .request(server)
      .delete(url + "/" + generatedTagIds[0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
        generatedTagIds = generatedTagIds.filter(
          (x) => x != generatedTagIds[0]
        );
      });
  });
  it("TG_24 Create tag, Id sent with Payload - 400", (done) => {
    let tag = {
      id: 1243,
      name: "Cooking",
    };

    chai
      .request(server)
      .post(url)
      .set("Authorization", "Bearer " + token)
      .send(tag)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });
  it("TG_25 DELETE user - 204", (done) => {
    chai
      .request(server)
      .delete(config.backend.apiPrefix + "/users/" + generatedUserId)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
});
