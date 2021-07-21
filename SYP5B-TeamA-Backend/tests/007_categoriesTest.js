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

const url = config.get('backend.apiPrefix') + "/categories";

before((done) => {
  ensureServerIsRunning(server, done);
});

describe("CRUD Entity /categories " + url, () => {
  let generatedCategoryIds = [];
  let categoryDeletedId = null;
  let numberOfExistingCategories = 0;

  let generatedUserId;

  before(async function () {});

  //get token from here, add to all requests
  // it("ZZ_02 Login user - 200", (done) => {
  //   let credentials = {
  //     username: "achim@htl-villach.at",
  //     password: "1234",
  //   };
  //   chai
  //     .request(server)
  //     .post(`${url}/login`)
  //     .send(credentials)
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       token = res.body.token;
  //       done();
  //     });
  // });

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

  it("CG_00 GET all categories (before creation, expect empty array) - 200", (done) => {
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

  it("CG_01 POST Create category - 201", (done) => {
    let category = {
      name: "English",
    };

    chai
      .request(server)
      .post(url)
      .set("Authorization", "Bearer " + token)
      .send(category)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        Object.keys(res.body).length.should.eql(4);

        res.body.should.have.property("_id").not.to.be.null;
        res.body.should.have.property("name").eql(category.name);

        generatedCategoryIds.push(res.body._id);
        done();
      });
  });
  it("CG_02 create second category - 201", (done) => {
    let category = {
      name: "Maths",
    };

    chai
      .request(server)
      .post(url)
      .set("Authorization", "Bearer " + token)
      .send(category)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        Object.keys(res.body).length.should.eql(4);

        res.body.should.have.property("_id").not.to.be.null;
        res.body.should.have.property("name").eql(category.name);

        generatedCategoryIds.push(res.body._id);
        done();
      });
  });
  it("CG_03 create third category - 201", (done) => {
    let category = {
      name: "Programming",
    };

    chai
      .request(server)
      .post(url)
      .set("Authorization", "Bearer " + token)
      .send(category)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        Object.keys(res.body).length.should.eql(4);

        res.body.should.have.property("_id").not.to.be.null;
        res.body.should.have.property("name").eql(category.name);

        generatedCategoryIds.push(res.body._id);
        done();
      });
  });

  it("CG_04 create category - missing properties - 400", (done) => {
    let category = {
      wrong: "prop",
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

  it("CG_05 create category - wrong properties - 400", (done) => {
    let user = {};

    chai
      .request(server)
      .post(url)
      .set("Authorization", "Bearer " + token)
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("CG_06 create category - incorrect paylod only a string was send - 400", (done) => {
    let category = "";

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

  it("CG_07 create category - name not unique - 400", (done) => {
    let category = {
      name: "Maths",
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

  it("CG_08 GET all categories - 200", (done) => {
    chai
      .request(server)
      .get(url)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(
          generatedCategoryIds.length + numberOfExistingCategories
        );

        let currentCategory = res.body[0];
        Object.keys(currentCategory).length.should.eql(4);

        currentCategory.should.have.property("_id").not.to.be.null;
        currentCategory.should.have.property("name");

        done();
      });
  });

  it("CG_09 GET a single category by id - 200", (done) => {
    chai
      .request(server)
      .get(url + "/" + generatedCategoryIds[0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.not.have.property("length");
        res.body.should.have.property("_id").eql(generatedCategoryIds[0]);
        done();
      });
  });

  it("CG_10 GET - url not correct formatted - 404", (done) => {
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

  it("CG_11 PATCH - Update first category - 200", (done) => {
    let category = {
      name: "History",
    };
    chai
      .request(server)
      .patch(url + "/" + generatedCategoryIds[0])
      .set("Authorization", "Bearer " + token)
      .send(category)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("name").eql(category.name);
        done();
      });
  });

  it("CG_12 PATCH - Update second category - 200", (done) => {
    let category = {
      name: "Geography",
    };
    chai
      .request(server)
      .patch(url + "/" + generatedCategoryIds[1])
      .set("Authorization", "Bearer " + token)
      .send(category)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("name").eql(category.name);
        done();
      });
  });

  it("CG_13 PATCH - Update third category - 200", (done) => {
    let category = {
      name: "Maths",
    };
    chai
      .request(server)
      .patch(url + "/" + generatedCategoryIds[2])
      .set("Authorization", "Bearer " + token)
      .send(category)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("name").eql(category.name);
        done();
      });
  });

  it("CG_14 PATCH category to update - id not in correct format - 404", (done) => {
    let category = {
      name: "inactive",
    };

    chai
      .request(server)
      .patch(url + "/234-56232")
      .set("Authorization", "Bearer " + token)
      .send(category)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("CG_15 PATCH incorrect payload - wrong property - 400", (done) => {
    let category = {
      age: 2,
    };

    chai
      .request(server)
      .patch(url + "/" + generatedCategoryIds[0])
      .set("Authorization", "Bearer " + token)
      .send(category)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("CG_16 PATCH incorrect payload - wrong id delivered - 400", (done) => {
    let category = {
      id: 40404,
      lastname: "Boyle_1",
      firstname: "Katlynn_1",
      password: "1234_1",
      state: "inactive",
    };

    chai
      .request(server)
      .patch(url + "/" + generatedCategoryIds[0])
      .set("Authorization", "Bearer " + token)
      .send(category)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("CG_17 PATCH - no payload - 400", (done) => {
    let category = {};

    chai
      .request(server)
      .patch(url + "/" + generatedCategoryIds[0])
      .set("Authorization", "Bearer " + token)
      .send(category)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("CG_18 Report demand for category - 200", (done) => {
    chai
      .request(server)
      .patch(`${url}/${generatedCategoryIds[0]}/reportDemand`)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it("CG_19 Report demand for category again - 200", (done) => {
    chai
      .request(server)
       .patch(`${url}/${generatedCategoryIds[0]}/reportDemand`)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it("CG_20 GET - get category with one demand - 200", (done) => {
    chai
      .request(server)
      .get(`${url}/${generatedCategoryIds[0]}`)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it("CG_21 Remove demand for category - 200", (done) => {
    chai
      .request(server)
      .patch(`${url}/${generatedCategoryIds[0]}/removeDemand`)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it("CG_22 Remove demand for category again - 200", (done) => {
    chai
      .request(server)
       .patch(`${url}/${generatedCategoryIds[0]}/removeDemand`)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it("CG_22 Report demand for category again - 200", (done) => {
    chai
      .request(server)
      .patch(`${url}/${generatedCategoryIds[0]}/reportDemand`)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it("CG_23 DELETE first category - 204", (done) => {
    categoryDeletedId = generatedCategoryIds[0];
    chai
      .request(server)
      .delete(url + "/" + generatedCategoryIds[0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
        generatedCategoryIds = generatedCategoryIds.filter(
          (x) => x != generatedCategoryIds[0]
        );
      });
  });

  it("CG_24 GET - try to get the deleted category again - 404", (done) => {
    chai
      .request(server)
      .get(url + "/" + categoryDeletedId)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("CG_25 DELETE - delete first category again - 404", (done) => {
    chai
      .request(server)
      .delete(url + "/" + categoryDeletedId)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("CG_26 DELETE second category - 204", (done) => {
    chai
      .request(server)
      .delete(url + "/" + generatedCategoryIds[0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
        generatedCategoryIds = generatedCategoryIds.filter(
          (x) => x != generatedCategoryIds[0]
        );
      });
  });

  it("CG_27 GET all categories (after deletion of two categories) - 200", (done) => {
    chai
      .request(server)
      .get(url)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(
          generatedCategoryIds.length + numberOfExistingCategories
        );
        done();
      });
  });
  it("CG_28 DELETE last category - 204", (done) => {
    chai
      .request(server)
      .delete(url + "/" + generatedCategoryIds[0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
        generatedCategoryIds = generatedCategoryIds.filter(
          (x) => x != generatedCategoryIds[0]
        );
      });
  });
  it("CG_29 Create category, Id sent with Payload - 400", (done) => {
    let category = {
      id: 1243,
      name: "Cooking",
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
  it("CG_30 DELETE user - 204", (done) => {
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
