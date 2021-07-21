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

describe("Searching for offers", () => {
  let generatedOfferIds = [];

  let tagsForAll = [
    "allTag",
    "getAll"
  ]

  let generatedUserId;
  let generatedCategoryId;
  let urlCategory;

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
      name: "cat",
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
        urlCategory =
          apiPrefix +
          "/categories/" +
          generatedCategoryId +
          "/offers";
        done();
      });
  });

  it("SO_00 GET all offers (before creation, expect empty array) - 200", (done) => {
    chai
      .request(server)
      .get(urlCategory)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        done();
      });
  });

  it("SO_01 POST - Create offer - 201", (done) => {
    let offerTags = ["1"];
    let tags = [...tagsForAll, ...offerTags];
    let offerObj = {
      title: "myTitle 1",
      description: "myDescription1",
      minAttendees: 3,
      maxAttendees: 10,
      tags: tags
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
      .post(urlCategory)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(0);

        generatedOfferIds.push(res.body._id);
        done();
      });
  });

  it("SO_02 POST - Create offer - 201", (done) => {
    let offerTags = ["2"];
    let tags = [...tagsForAll, ...offerTags];
    let offerObj = {
      title: "myTitle 2",
      description: "myDescription2",
      minAttendees: 3,
      maxAttendees: 10,
      tags: tags
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
      .post(urlCategory)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(0);

        generatedOfferIds.push(res.body._id);
        done();
      });
  });

  it("SO_03 POST - Create offer - 201", (done) => {
    let offerTags = ["3"];
    let tags = [...tagsForAll, ...offerTags];
    let offerObj = {
      title: "myTitle 3",
      description: "myDescription3",
      minAttendees: 3,
      maxAttendees: 10,
      tags: tags
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
      .post(urlCategory)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(0);

        generatedOfferIds.push(res.body._id);
        done();
      });
  });

  it("SO_04 POST - Create offer unlimited attendees - 201", (done) => {
    let offerTags = ["4"];
    let tags = [...tagsForAll, ...offerTags];
    let offerObj = {
      title: "myTitle 4",
      description: "myDescription4",
      minAttendees: -1,
      maxAttendees: -1,
      tags: tags
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
      .post(urlCategory)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(0);

        generatedOfferIds.push(res.body._id);
        done();
      });
  });

  it("SO_05 POST - Create offer unlimited attendees with min attendees - 201", (done) => {
    let offerTags = ["twoOffers"];
    let tags = [...tagsForAll, ...offerTags];
    let offerObj = {
      title: "myTitle 22",
      description: "doubleOffers",
      minAttendees: "5",
      maxAttendees: "-1",
      tags: tags
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
      .post(urlCategory)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(0);

        generatedOfferIds.push(res.body._id);
        done();
      });
  });

  it("SO_06 POST - Create offer unlimited attendees with max attendees - 201", (done) => {
    let offerTags = ["twoOffers"];
    let tags = [...tagsForAll, ...offerTags];
    let offerObj = {
      title: "myTitle 22",
      description: "doubleOffers",
      minAttendees: -1,
      maxAttendees: 5,
      tags: tags
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
      .post(urlCategory)
      .set("Authorization", "Bearer " + token)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(0);

        generatedOfferIds.push(res.body._id);
        done();
      });
  });

  it("SO_07 GET all offers by 'allTag' tag in category 1 - 200", (done) => {
    chai
      .request(server)
      .get(urlCategory + "?tags=allTag")
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(
          generatedOfferIds.length
        );
        done();
      });
  });
    
    it("SO_08 GET all offers by 'myTitle' tag in category 1 - 200", (done) => {
    chai
      .request(server)
      .get(urlCategory + "?title=myTitle")
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(
          generatedOfferIds.length
        );
        done();
      });
  });
    
  it("SO_09 GET one offer by '1' tag in category 1 - 200", (done) => {
    chai
      .request(server)
      .get(urlCategory + "?tags=1")
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a("array");
      res.body.length.should.be.eql(1);
      done();
    });
  });
    
  it("SO_10 GET one offer by '1' title in category 1 - 200", (done) => {
    chai
      .request(server)
      .get(urlCategory + "?title=1")
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a("array");
      res.body.length.should.be.eql(1);
      done();
    });
  });
    
  it("SO_11 GET two offers by 'twoOffers' tag in category 1 - 200", (done) => {
    chai
      .request(server)
      .get(urlCategory + "?tags=twooffers")
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a("array");
      res.body.length.should.be.eql(2);
      done();
    });
  });
    
  it("SO_12 GET two offers by '22' title in category 1 - 200", (done) => {
    chai
      .request(server)
      .get(urlCategory + "?title=22")
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(2);
        done();
      });
  });
  
  it("SO_13 GET two offers by '22' title and 'twoOffers' tag in category 1 - 200", (done) => {
    chai
      .request(server)
      .get(urlCategory + "?title=22&tag=twoOffers")
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(2);
        done();
      });
  });

  it("SO_14 GET offers - Wrong query format - 400", (done) => {
    chai
      .request(server)
      .get(urlCategory + "?tistle=22&tag=twoOffers")
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });
});
