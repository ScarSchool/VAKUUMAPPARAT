// Links which I have used:
// https://mochajs.org/

// https://scotch.io/tutorials/test-a-node-restful-api-with-mocha-and-chai
// https://github.com/microsoft/vscode-recipes/tree/master/debugging-mocha-tests
// https://github.com/chaijs/chai-http/issues/178
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

const url = config.get('backend.apiPrefix') + "/users";

before((done) => {
  ensureServerIsRunning(server, done);
});

describe("CRUD Entity /user " + url, () => {
  let generatedUserIds = [];
  let userDeletedId = null;
  let numberOfExistingUsers = 0;
  let token;

  before(async function () {});

  // GET Request should be implemented here
  // diegit se Requests aus dem POSTMAN nehmen

  it("AA_00 POST Create user - 201", (done) => {
    let user = {
      lastname: "Boyle",
      firstname: "Katlynn",
      username: "user1@htl-villach.at",
      password: "1234",
      state: "active",
    };

    chai
      .request(server)
      .post(url)
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        Object.keys(res.body).length.should.eql(8);

        res.body.should.have.property("_id").not.to.be.null;
        res.body.should.have.property("lastname").eql(user.lastname);
        res.body.should.have.property("firstname").eql(user.firstname);
        res.body.should.have.property("state").eql(user.state);

        res.body.should.not.have.property("password");

        generatedUserIds.push(res.body._id);
        done();
      });
  });

  it("AA_00 POST - Login user - 200", (done) => {
    let validCredentials = {
      username: "user1@htl-villach.at",
      password: "1234",
    };
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

  it("AA_01 GET all users (expect one) - 200", (done) => {
    chai
      .request(server)
      .get(url)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(1);
        numberOfExistingUsers = res.body.length - 1;
        done();
      });
  });

  it("AA_02 create second user - 201", (done) => {
    let user = {
      lastname: "Reynolds",
      firstname: "Destiney",
      password: "pw2",
      username: "user2@htl-villach.at",
      state: "active",
    };

    chai
      .request(server)
      .post(url)
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("_id").not.to.be.null;
        res.body.should.have.property("lastname").eql(user.lastname);
        res.body.should.have.property("firstname").eql(user.firstname);
        res.body.should.have.property("state").eql(user.state);
        res.body.should.not.have.property("password");

        generatedUserIds.push(res.body._id);
        done();
      });
  });

  it("AA_03 create third (inactive) user - 201", (done) => {
    let user = {
      lastname: "Homenick",
      firstname: "Monserrate",
      password: "pw3",
      username: "user3@htl-villach.at",
      state: "inactive",
    };

    chai
      .request(server)
      .post(url)
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("_id").not.to.be.null;
        res.body.should.have.property("lastname").eql(user.lastname);
        res.body.should.have.property("firstname").eql(user.firstname);
        // res.body.should.have.property("username").eql(user.username);
        res.body.should.have.property("state").eql(user.state);
        res.body.should.not.have.property("password");

        generatedUserIds.push(res.body._id);
        done();
      });
  });

  it("AA_04 create user - missing properties - 400", (done) => {
    let user = {
      lastname: "Boyle",
      firstname: "Katlynn",
      state: "active",
    };

    chai
      .request(server)
      .post(url)
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_05 create user - wrong properties - 400", (done) => {
    let user = {
      lastname: "Boyle",
      firstname: "Katlynn",
      username: "user1@htl-villach.at",
      password: "1234",
      state: "active",
      wrong: "prop",
    };

    chai
      .request(server)
      .post(url)
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_06 create user - properties empty - 400", (done) => {
    let user = {
      lastname: "",
      firstname: "",
      username: "",
      password: "1234",
      state: "active",
    };

    chai
      .request(server)
      .post(url)
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_07 create user - state not valid value - 400", (done) => {
    let user = {
      lastname: "Boyle 999",
      firstname: "Katlynn 999",
      username: "user999@htl-villach.at",
      password: "1234",
      state: "active -- XXX",
    };

    chai
      .request(server)
      .post(url)
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_08 create user - incorrect paylod only a string was send - 400", (done) => {
    let user = "";

    chai
      .request(server)
      .post(url)
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_09 create user - username not unique - 400", (done) => {
    let user = {
      lastname: "Boyle",
      firstname: "Katlynn",
      username: "user1@htl-villach.at",
      password: "1234",
      state: "active",
    };

    chai
      .request(server)
      .post(url)
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  // GET Request should be implemented here
  // diese Request aus dem POSTMAN nehmen
  it("AA_10 GET all users - 200", (done) => {
    chai
      .request(server)
      .get(url)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(
          generatedUserIds.length + numberOfExistingUsers
        );

        let currentUser = res.body[0];
        Object.keys(currentUser).length.should.eql(8);

        currentUser.should.have.property("_id").not.to.be.null;
        currentUser.should.have.property("lastname");
        currentUser.should.have.property("firstname");
        // currentUser.should.have.property("username");
        currentUser.should.have.property("state");

        done();
      });
  });

  it("AA_11 GET a single user by id - 200", (done) => {
    chai
      .request(server)
      .get(url + "/" + generatedUserIds[0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.not.have.property("length");
        res.body.should.have.property("_id").eql(generatedUserIds[0]);
        done();
      });
  });

  it("AA_12 GET a single user by username - 200", (done) => {
    chai
      .request(server)
      .get(url + "?username=user3@htl-villach.at")
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.not.have.property("length");
        res.body.should.have.property("_id").not.to.be.null;
        // res.body.should.have.property("username").eql("user3@htl-villach.at");
        done();
      });
  });

  it("AA_13 GET active users - 200", (done) => {
    chai
      .request(server)
      .get(url + "?state=active")
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(2 + numberOfExistingUsers);
        done();
      });
  });

  it("AA_14 GET - querystring not correct formatted - 400", (done) => {
    chai
      .request(server)
      .get(url + "?id=unknown")
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_15 GET - url not correct formatted - 404", (done) => {
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

  it("AA_16 Test Case deleted", (done) => {
    done();
  });

  // which changes are allowed?
  // only lastname, firstname, password and state can be changed

  it("AA_17.1 POST - Login first user - 200", (done) => {
    let validCredentials = {
      username: "user1@htl-villach.at",
      password: "1234",
    };
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


  it("AA_17.2 PATCH - Update first user - 200", (done) => {
    let user = {
      firstname: "Katlynn_1",
      lastname: "Boyle_1",
      password: "1234_1",
      state: "inactive",
    };

    chai
      .request(server)
      .patch(url + "/" + generatedUserIds[0])
      .set("Authorization", "Bearer " + token)
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("lastname").eql(user.lastname);
        res.body.should.have.property("firstname").eql(user.firstname);
        res.body.should.have.property("state").eql(user.state);
        res.body.should.not.have.property("password");
        done();
      });
  });

  it("AA_18.1 POST - Login second user - 200", (done) => {
    let validCredentials = {
      password: "pw2",
      username: "user2@htl-villach.at",
    };
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
  
  it("AA_18.2 PATCH update second user - 200", (done) => {
    let user = {
      firstname: "Destiney_2",
      lastname: "Reynolds_2",
    };

    chai
      .request(server)
      .patch(url + "/" + generatedUserIds[1])
      .set("Authorization", "Bearer " + token)
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("lastname").eql(user.lastname);
        res.body.should.have.property("firstname").eql(user.firstname);
        res.body.should.not.have.property("password");
        done();
      });
  });

  it("AA_18.3 POST - Login user - 200", (done) => {
    let validCredentials = {
      username: "user1@htl-villach.at",
      password: "1234_1",
    };
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
  
  it("AA_19.1 - Test info field updates - 200", (done) => {
    let user = {
      generalInfo: {
        biography: "neue bio",
        visibility: "public",
      },
      additionalInfo: {
        visibility: "public",
        education: "HTLa",
        jobTitle: "Der derzeitige Wert",
        residency: "Daham",
      },
    };

    chai
      .request(server)
      .patch(url + "/" + generatedUserIds[0])
      .set("Authorization", "Bearer " + token)
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it("AA_19.2 - Test info field updates - wrong fields - 400", (done) => {
    let user = {
      generalInfo: {
        biography: "neue bio",
        visibility: "public",
      },
      additionalInfo: {
        visibility: "public",
        education: "HTLa",
        jobTitle: "Der derzeitige Wert",
        nix: "Daham",
      },
    };

    chai
      .request(server)
      .patch(url + "/" + generatedUserIds[0])
      .set("Authorization", "Bearer " + token)
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_19.3 - Test info - field missing - 400", (done) => {
    let user = {
      generalInfo: {
        biography: "neue bio",
        visibility: "public",
      },
      additionalInfo: {
        visibility: "public",
        education: "HTLa",
        jobTitle: "Der derzeitige Wert",
      },
    };

    chai
      .request(server)
      .patch(url + "/" + generatedUserIds[0])
      .set("Authorization", "Bearer " + token)
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_20 PATCH user to update - id not in correct format - 404", (done) => {
    let user = {
      state: "inactive",
    };

    chai
      .request(server)
      .patch(url + "/234-56232")
      .set("Authorization", "Bearer " + token)
      .send(user)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_21 PATCH incorrect payload - wrong property - 400", (done) => {
    let user = {
      lastnameXXXX: "Boyle_1",
      firstname: "Katlynn_1",
      password: "1234_1",
      state: "inactive",
    };

    chai
      .request(server)
      .patch(url + "/" + generatedUserIds[0])
      .set("Authorization", "Bearer " + token)
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_22 PATCH incorrect payload - wrong id delivered - 400", (done) => {
    let user = {
      id: 40404,
      lastname: "Boyle_1",
      firstname: "Katlynn_1",
      password: "1234_1",
      state: "inactive",
    };

    chai
      .request(server)
      .patch(url + "/" + generatedUserIds[0])
      .set("Authorization", "Bearer " + token)
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_23 PATCH - no payload - 400", (done) => {
    let user = {};

    chai
      .request(server)
      .patch(url + "/" + generatedUserIds[0])
      .set("Authorization", "Bearer " + token)
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_24 DELETE first user - 204", (done) => {
    userDeletedId = generatedUserIds[0];
    chai
      .request(server)
      .delete(url + "/" + generatedUserIds[0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
        generatedUserIds = generatedUserIds.filter(
          (x) => x != generatedUserIds[0]
        );
      });
  });

  it("AA_25.1 POST - Login third user - 200", (done) => {
    let validCredentials = {
      password: "pw3",
      username: "user3@htl-villach.at",
    };
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

  it("AA_25.2 GET - try to get the deleted user again - 404", (done) => {
    chai
      .request(server)
      .get(url + "/" + userDeletedId)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_26 DELETE - delete first user again - 404", (done) => {
    chai
      .request(server)
      .delete(url + "/" + userDeletedId)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("AA_27 DELETE second user - 204", (done) => {
    chai
      .request(server)
      .delete(url + "/" + generatedUserIds[0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
        generatedUserIds = generatedUserIds.filter(
          (x) => x != generatedUserIds[0]
        );
      });
  });

  it("AA_28 GET all users (after deletion of two users) - 200", (done) => {
    chai
      .request(server)
      .get(url)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(
          generatedUserIds.length + numberOfExistingUsers
        );
        done();
      });
  });

  it("AA_29 DELETE last user - 204", (done) => {
    chai
      .request(server)
      .delete(url + "/" + generatedUserIds[0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
        generatedUserIds = generatedUserIds.filter(
          (x) => x != generatedUserIds[0]
        );
      });
  });

  it("AA_30 Create user, Id sent with Payload - 400", (done) => {
    let user = {
      id: 1243,
      lastname: "Boyle",
      firstname: "Katlynn",
      username: "user1276372@htl-villach.at",
      password: "1234",
      state: "active",
    };

    chai
      .request(server)
      .post(url)
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });
});
