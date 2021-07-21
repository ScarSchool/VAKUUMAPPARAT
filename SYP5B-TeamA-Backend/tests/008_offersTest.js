const chai = require("chai");
const chaiHttp = require("chai-http");

const config = require('config');
const apiPrefix = config.get('backend.apiPrefix');
const {
  server,
  checkErrorResponse,
  ensureServerIsRunning,
} = require("./000_helpersTest");

chai.use(chaiHttp);
chai.should();

before((done) => {
  ensureServerIsRunning(server, done);
});

let validCredentials = {
  username: "newmans-r@user.com",
  password: "1234",
};

let secondValidCredentials = {
  username: "newmans-r@seconduser.com",
  password: "1234",
};

let thirdValidCredentials = {
  username: "newmans-r@thirduser.com",
  password: "1234",
};

describe("CRUD Entity offers", () => {
  let generatedOfferIds = {};
  let offerDeletedId = null;
  let numberOfExistingOffers = 0;

  let generatedUserId;
  let secondGeneratedUserId;
  let thirdGeneratedUserId;
  let offerWithRequirementsId;

  let generatedCategoryId;
  let generatedCategoryId2;
  let urlCategories1;
  let urlCategories2;

  before(async function () {});

  it("AB_01 POST - Create new user - 201", (done) => {
    let user = {
      lastname: "Newman",
      firstname: "Randy",
      username: "newmans-r@user.com",
      password: "1234",
      state: "active",
    };

    chai
      .request(server)
      .post(apiPrefix + "/users")
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.not.have.property("password");
        generatedUserId = res.body._id;
        done();
      });
  });

  it("AB_01.1 POST - Create second new user - 201", (done) => {
    let user = {
      lastname: "Newman",
      firstname: "Randy",
      username: "newmans-r@seconduser.com",
      password: "1234",
      state: "active",
    };

    chai
      .request(server)
      .post(apiPrefix + "/users")
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.not.have.property("password");
        secondGeneratedUserId = res.body._id;
        done();
      });
  });

  it("AB_01.1 POST - Create third new user - 201", (done) => {
    let user = {
      lastname: "Newman",
      firstname: "Randy",
      username: "newmans-r@thirduser.com",
      password: "1234",
      state: "active",
    };

    chai
      .request(server)
      .post(apiPrefix + "/users")
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.not.have.property("password");
        thirdGeneratedUserId = res.body._id;
        done();
      });
  });

  it("AB_02 POST - Login user - 200", (done) => {
    chai
      .request(server)
      .post(apiPrefix + "/login")
      .send(validCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("token");
        token = res.body.token;
        done();
      });
  });

  it("AB_03 POST - Create category 1 - 201", (done) => {
    let category = {
      name: "myCategory1",
    };

    chai
      .request(server)
      .post(apiPrefix + "/categories")
      .set("Authorization", "Bearer " + token)
      .send(category)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("_id");
        generatedCategoryId = res.body._id;
        generatedOfferIds[generatedCategoryId] = [];
        urlCategories1 =
          apiPrefix +
          "/categories/" +
          generatedCategoryId +
          "/offers";
        done();
      });
  });

  it("AB_03 POST - Create category 2 - 201", (done) => {
    let category = {
      name: "myCategory2",
    };

    chai
      .request(server)
      .post(apiPrefix + "/categories")
      .set("Authorization", "Bearer " + token)
      .send(category)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("_id");
        generatedCategoryId2 = res.body._id;
        generatedOfferIds[generatedCategoryId2] = [];
        urlCategories2 =
          apiPrefix +
          "/categories/" +
          generatedCategoryId2 +
          "/offers";
        done();
      });
  });

  it("OF_00 GET all offers (before creation, expect empty array) - 200", (done) => {
    chai
      .request(server)
      .get(urlCategories1)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        done();
      });
  });

  it("OF_01 POST - Create offer - 201", (done) => {
    let offerObj = {
      title: "myTitle1",
      description: "myDescription1",
      minAttendees: 3,
      maxAttendees: 10,
      tags: ['seas', '123']
    };

    let offerror = {
      _id: generatedUserId,
      lastname: "Newman",
      firstname: "Randy",
      username: "newman-r@user.com",
      state: "active",
    };

    chai
      .request(server)
      .post(urlCategories1)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(0);

        generatedOfferIds[generatedCategoryId].push(res.body._id);
        done();
      });
  });

  it("OF_02 POST - Create offer - 201", (done) => {
    let offerObj = {
      title: "myTitle2",
      description: "myDescription2",
      minAttendees: 3,
      maxAttendees: 10,
    };

    let offerror = {
      _id: generatedUserId,
      lastname: "Newman",
      firstname: "Randy",
      username: "newman-r@user.com",
      state: "active",
    };

    chai
      .request(server)
      .post(urlCategories1)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(0);

        generatedOfferIds[generatedCategoryId].push(res.body._id);
        done();
      });
  });

  it("OF_03 POST - Create offer - 201", (done) => {
    let offerObj = {
      title: "myTitle3",
      description: "myDescription3",
      minAttendees: 3,
      maxAttendees: 10,
    };

    let offerror = {
      _id: generatedUserId,
      lastname: "Newman",
      firstname: "Randy",
      username: "newman-r@user.com",
      state: "active",
    };

    chai
      .request(server)
      .post(urlCategories2)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(0);

        generatedOfferIds[generatedCategoryId2].push(res.body._id);
        done();
      });
  });

  it("OF_04 POST - Create offer unlimited attendees - 201", (done) => {
    let offerObj = {
      title: "myTitle4",
      description: "myDescription4",
      minAttendees: -1,
      maxAttendees: -1,
    };

    let offerror = {
      _id: generatedUserId,
      lastname: "Newman",
      firstname: "Randy",
      username: "newman-r@user.com",
      state: "active",
    };

    chai
      .request(server)
      .post(urlCategories2)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(0);

        generatedOfferIds[generatedCategoryId2].push(res.body._id);
        done();
      });
  });

  it("OF_05 POST - Create offer unlimited attendees with min attendees - 201", (done) => {
    let offerObj = {
      title: "myTitle5",
      description: "myDescription5",
      minAttendees: 5,
      maxAttendees: -1,
    };

    let offerror = {
      _id: generatedUserId,
      lastname: "Newman",
      firstname: "Randy",
      username: "newman-r@user.com",
      state: "active",
    };

    chai
      .request(server)
      .post(urlCategories2)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(0);

        generatedOfferIds[generatedCategoryId2].push(res.body._id);
        done();
      });
  });

  it("OF_06 POST - Create offer unlimited attendees with max attendees - 201", (done) => {
    let offerObj = {
      title: "myTitle5",
      description: "myDescription5",
      minAttendees: -1,
      maxAttendees: 5,
    };

    let offerror = {
      _id: generatedUserId,
      lastname: "Newman",
      firstname: "Randy",
      username: "newman-r@user.com",
      state: "active",
    };

    chai
      .request(server)
      .post(urlCategories1)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(0);

        generatedOfferIds[generatedCategoryId].push(res.body._id);
        done();
      });
  });

  it("OF_07 POST - Create offer min > max - 400", (done) => {
    let offerObj = {
      title: "myTitle4",
      description: "myDescription4",
      minAttendees: 10,
      maxAttendees: 3,
    };

    chai
      .request(server)
      .post(urlCategories2)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_08 POST - Create offer min < -1 - 400", (done) => {
    let offerObj = {
      title: "myTitle5",
      description: "myDescription5",
      minAttendees: -2,
      maxAttendees: 3,
    };

    chai
      .request(server)
      .post(urlCategories2)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_09 POST - create offer with missing properties - 400", (done) => {
    let offerObj = {
      title: "myTitle5",
      minAttendees: 2,
      maxAttendees: 3,
    };

    chai
      .request(server)
      .post(urlCategories1)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_10 POST - create offer with wrong properties - 400", (done) => {
    let offerObj = {
      ueberschrift: "myTitle5",
      desciption: "myDescription5",
      minAttendees: -2,
      maxAttendees: 3,
    };

    chai
      .request(server)
      .post(urlCategories1)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_11 POST - create offer with empty properties - 400", (done) => {
    let offerObj = {
      ueberschrift: "",
      desciption: "",
      minAttendees: -2,
      maxAttendees: 3,
    };

    chai
      .request(server)
      .post(urlCategories1)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_12 POST - create offer with incorrect paylod only a string was send - 400", (done) => {
    let offerObj = "";

    chai
      .request(server)
      .post(urlCategories1)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_13 GET all offers in category 1 (after creation) - 200", (done) => {
    chai
      .request(server)
      .get(urlCategories1)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(
          generatedOfferIds[generatedCategoryId].length
        );
        done();
      });
  });

  it("OF_13 GET all offers in category 2 (after creation) - 200", (done) => {
    chai
      .request(server)
      .get(urlCategories2)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(
          generatedOfferIds[generatedCategoryId2].length
        );
        done();
      });
  });

  it("OF_14 GET a single offer by id - 200", (done) => {
    chai
      .request(server)
      .get(urlCategories1 + "/" + generatedOfferIds[generatedCategoryId][0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.not.have.property("length");
        res.body.should.have
          .property("_id")
          .eql(generatedOfferIds[generatedCategoryId][0]);
        done();
      });
  });

  it("OF_15 GET - offer from wrong category - 404", (done) => {
    chai
      .request(server)
      .get(urlCategories1 + "/" + generatedOfferIds[generatedCategoryId2][0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_16 GET - url not correct formatted - 404", (done) => {
    chai
      .request(server)
      .get(urlCategories2 + "/unknown")
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_17 PATCH - Update first offer - 200", (done) => {
    let offerObj = {
      title: "myTitleEdited1",
      description: "myDescriptionEdited1",
      minAttendees: 22,
      maxAttendees: 28,
      tags: ['seas', 'hots di gschlagelt', 'der is neu']
    };

    chai
      .request(server)
      .patch(urlCategories1 + "/" + generatedOfferIds[generatedCategoryId][0])
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("title").eql(offerObj.title);
        res.body.should.have.property("description").eql(offerObj.description);
        res.body.should.have
          .property("minAttendees")
          .eql(offerObj.minAttendees);
        res.body.should.have
          .property("maxAttendees")
          .eql(offerObj.maxAttendees);
        done();
      });
  });

  it("OF_18 PATCH update second user - 200", (done) => {
    let offerObj = {
      title: "myTitleEdited2",
      description: "myDescriptionEdited3",
    };

    chai
      .request(server)
      .patch(urlCategories1 + "/" + generatedOfferIds[generatedCategoryId][1])
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("title").eql(offerObj.title);
        res.body.should.have.property("description").eql(offerObj.description);
        done();
      });
  });

  it("OF_19 PATCH update third user - 200", (done) => {
    let offerObj = {
      minAttendees: 100,
      maxAttendees: 120,
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + generatedOfferIds[generatedCategoryId2][0])
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have
          .property("minAttendees")
          .eql(offerObj.minAttendees);
        res.body.should.have
          .property("maxAttendees")
          .eql(offerObj.maxAttendees);
        done();
      });
  });

  it("OF_20 PATCH offer - id not in correct format - 404", (done) => {
    let offerObj = {
      maxAttendees: 1000,
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/234-56232")
      .send(offerObj)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_21 PATCH incorrect payload - wrong property - 400", (done) => {
    let offerObj = {
      title2: "myTitleEdited1",
      description: "myDescriptionEdited1",
      minAckentees: 22,
      maxAttendees: 28,
    };

    chai
      .request(server)
      .patch(urlCategories1 + "/" + generatedOfferIds[generatedCategoryId][0])
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_22 PATCH offer incorrect payload - wrong id delivered - 400", (done) => {
    let offerObj = {
      id: 213112,
      title: "myTitleEdited1",
      description: "myDescriptionEdited1",
      minAttendees: 22,
      maxAttendees: 28,
    };

    chai
      .request(server)
      .patch(urlCategories1 + "/" + generatedOfferIds[generatedCategoryId][0])
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_23 PATCH - no payload - 400", (done) => {
    let offerObj = {};

    chai
      .request(server)
      .patch(urlCategories1 + "/" + generatedOfferIds[generatedCategoryId][0])
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_24 POST - Create offer with requirements - 201", (done) => {
    let offerObj = {
      title: "myTitle6",
      description: "myDescription6",
      minAttendees: -1,
      maxAttendees: 3,
      requirements: [
        {
          requirementName: "Price",
          requirementValue: "50€",
        },
      ],
    };

    chai
      .request(server)
      .post(urlCategories2)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        offerWithRequirementsId = res.body._id;
        done();
      });
  });

  it("OF_25 POST - Create offer with wrong requirements - 400", (done) => {
    let offerObj = {
      title: "myTitle7",
      description: "myDescription6",
      minAttendees: -2,
      maxAttendees: 3,
      requirements: [
        {
          requirementName: "Entlohnung",
          requirementValue: "50€",
        },
      ],
    };

    chai
      .request(server)
      .post(urlCategories2)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_26 PATCH - update requirements - 200", (done) => {
    let offerObj = {
      requirements: [
        {
          requirementName: "Location",
          requirementValue: "50€",
        },
      ],
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it("OF_27 PATCH - update wrong requirements - 400", (done) => {
    let offerObj = {
      requirements: [
        {
          requirementName: "Entlohnung",
          requirementValue: "50€",
        },
      ],
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_28 PATCH - update requirements, empty array - 200", (done) => {
    let offerObj = {
      requirements: [],
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it("AB_55.1 POST - Login second user - 200", (done) => {
    chai
      .request(server)
      .post(apiPrefix + "/login")
      .send(secondValidCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("token");
        token = res.body.token;
        done();
      });
  });

  it("OF_55.2 PATCH - enroll user for offer with description - 204", (done) => {
    let enrollment = {
      description: "My enrollment is the best! Take me!"
    }
    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/addEnrollment")
      .set("Authorization", "Bearer " + token)
      .send(enrollment)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("OF_55.3 PATCH - remove enrollment for own user - 204", (done) => {
    chai
      .request(server)
      .patch(
        urlCategories2 + "/" + offerWithRequirementsId + "/removeEnrollment"
      )
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("OF_55.4 PATCH - enroll user for offer without description - 204", (done) => {
    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/addEnrollment")
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("OF_56 PATCH - remove enrollment for own user - 204", (done) => {
    chai
      .request(server)
      .patch(
        urlCategories2 + "/" + offerWithRequirementsId + "/removeEnrollment"
      )
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("OF_55.4 PATCH - enroll user for offer with too long description - 400", (done) => {
     let enrollment = {
       description: `asdasdasdasdsadjsdgisdafpodsjafpoksadfopksdaopfksmadopfmdsaofmsdaofmsa
                      dopfmsdapfmsdafölsadfmlösdamflsdöafmlöasdmflösdafmsdalöfmsdaölfdsafsadfsdafsadfsdafssss
                      ssssasdasdasdasdsösdamflsdöafmlöasdmflösdafmsdalöfmsdaölfdsafsadfsdafsadfsdafssssssssssssss`
    }
    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/addEnrollment")
      .set("Authorization", "Bearer " + token)
      .send(enrollment)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it("OF_57 PATCH - enroll user for offer again - 204", (done) => {
    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/addEnrollment")
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("OF_57 PATCH - enroll user for offer again - 204", (done) => {
    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/addEnrollment")
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("OF_58.1 POST - Login first user - 200", (done) => {
    chai
      .request(server)
      .post(apiPrefix + "/login")
      .send(validCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("token");
        token = res.body.token;
        done();
      });
  });

  it("OF_58.3 PATCH - remove enrollment for other user - 204", (done) => {
    let body = {
      id: secondGeneratedUserId,
    };

    chai
      .request(server)
      .patch(
        urlCategories2 + "/" + offerWithRequirementsId + "/removeEnrollment"
      )
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("OF_58.3 PATCH - remove enrollment for other user; again - 400", (done) => {
    let body = {
      id: secondGeneratedUserId,
    };
    chai
      .request(server)
      .patch(
        urlCategories2 + "/" + offerWithRequirementsId + "/removeEnrollment"
      )
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it("OF_59 PATCH - remove enrollment for other user; user is not renrolled - 400", (done) => {
    let body = {
      id: thirdGeneratedUserId,
    };

    chai
      .request(server)
      .patch(
        urlCategories2 + "/" + offerWithRequirementsId + "/removeEnrollment"
      )
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_60 PATCH - remove enrollment for other user; body invalid - 400", (done) => {
    let body = {
      name: "Gustav",
    };

    chai
      .request(server)
      .patch(
        urlCategories2 + "/" + offerWithRequirementsId + "/removeEnrollment"
      )
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_61 PATCH - remove enrollment for other user; user id is not valid - 400", (done) => {
    let body = {
      id: "5fc76124e077d672445e33d1",
    };

    chai
      .request(server)
      .patch(
        urlCategories2 + "/" + offerWithRequirementsId + "/removeEnrollment"
      )
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("AB_62.1 POST - Login second user - 200", (done) => {
    chai
      .request(server)
      .post(apiPrefix + "/login")
      .send(secondValidCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("token");
        token = res.body.token;
        done();
      });
  });

  it("OF_62.2 PATCH - enroll user for offer - 204", (done) => {
    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/addEnrollment")
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("AB_62.1 POST - Login first user - 200", (done) => {
    chai
      .request(server)
      .post(apiPrefix + "/login")
      .send(validCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("token");
        token = res.body.token;
        done();
      });
  });

  it("OF_63 PATCH - accept attendee; not enrolled user - 400", (done) => {
    let body = {
      id: thirdGeneratedUserId,
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/acceptAttendee")
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_64 PATCH - accept attendee; invalid body id - 400", (done) => {
    let body = {
      id: "5fc76124e077d672445e33d1",
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/acceptAttendee")
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_65 PATCH - accept attendee; invalid body id - 400", (done) => {
    let body = {
      id: "5fc76124e077d672445e33d1",
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/acceptAttendee")
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_66 PATCH - accept attendee - 204", (done) => {
    let body = {
      id: secondGeneratedUserId,
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/acceptAttendee")
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("OF_66.01 PATCH - enroll as attendee - 400", (done) => {
    let body = {
      id: secondGeneratedUserId,
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/addEnrollment")
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  // it("deleted", (done) => {
  // });

  it("OF_67 GET - get offer attendee_count - 200", (done) => {
    chai
      .request(server)
      .get(urlCategories2 + "/" + offerWithRequirementsId)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(1);
        res.body.should.have.property("attendees");
        done();
      });
  });

  it("OF_68 PATCH - reject attendee; non attendee - 400", (done) => {
    let body = {
      id: thirdGeneratedUserId,
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/rejectAttendee")
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("OF_69 PATCH - reject attendee; invalid body id - 400", (done) => {
    let body = {
      id: "5fc76124e077d672445e33d1",
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/rejectAttendee")
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_70 PATCH - reject attendee; invalid body id - 400", (done) => {
    let body = {
      id: "5fc76124e077d672445e33d1",
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/rejectAttendee")
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("AB_71.1 POST - Login second user - 200", (done) => {
    chai
      .request(server)
      .post(apiPrefix + "/login")
      .send(secondValidCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("token");
        token = res.body.token;
        done();
      });
  });

  it("OF_71.2 PATCH - reject attendee; not authorized - 401", (done) => {
    let body = {
      id: thirdGeneratedUserId,
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/rejectAttendee")
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(401);
        checkErrorResponse(res);
        done();
      });
  });

  it("AB_72.3 POST - Login first user - 200", (done) => {
    chai
      .request(server)
      .post(apiPrefix + "/login")
      .send(validCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("token");
        token = res.body.token;
        done();
      });
  });

  it("OF_72 PATCH - reject attendee - 204", (done) => {
    let body = {
      id: secondGeneratedUserId,
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/rejectAttendee")
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("OF_73 PATCH - reject attendee again - 400", (done) => {
    let body = {
      id: secondGeneratedUserId,
    };

    chai
      .request(server)
      .patch(urlCategories2 + "/" + offerWithRequirementsId + "/rejectAttendee")
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("OF_29 DELETE first offer in first category - 204", (done) => {
    offerDeletedId = generatedOfferIds[generatedCategoryId][0];
    chai
      .request(server)
      .delete(urlCategories1 + "/" + offerDeletedId)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
        generatedOfferIds[generatedCategoryId] = generatedOfferIds[
          generatedCategoryId
        ].filter((x) => x != offerDeletedId);
      });
  });

  it("OF_30 GET - try to get the deleted offer in first category again - 404", (done) => {
    chai
      .request(server)
      .delete(urlCategories1 + "/" + offerDeletedId)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_31 DELETE - delete first deleted offer of first category again - 404", (done) => {
    chai
      .request(server)
      .delete(urlCategories1 + "/" + offerDeletedId)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("OF_32 DELETE second offer - 204", (done) => {
    chai
      .request(server)
      .delete(urlCategories1 + "/" + generatedOfferIds[generatedCategoryId][0])
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
        generatedOfferIds[generatedCategoryId] = generatedOfferIds[
          generatedCategoryId
        ].filter((x) => x != generatedOfferIds[generatedCategoryId][0]);
      });
  });

  it("OF_33 GET all offers (after deletion of two offers) - 200", (done) => {
    chai
      .request(server)
      .get(urlCategories1)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(
          generatedOfferIds[generatedCategoryId].length
        );
        done();
      });
  });
  it("OF_34 DELETE user - 204", (done) => {
    chai
      .request(server)
      .delete(apiPrefix + "/users/" + generatedUserId)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
});
