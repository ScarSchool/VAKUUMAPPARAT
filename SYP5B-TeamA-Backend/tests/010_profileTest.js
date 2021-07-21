const { expect } = require("chai");
const chai = require("chai");
const chaiHttp = require("chai-http");
const config = require("config");

const {
  server,
  checkErrorResponse,
  ensureServerIsRunning,
} = require("./000_helpersTest");

chai.use(chaiHttp);
chai.should();

const url = config.get("backend.apiPrefix");

before((done) => {
  ensureServerIsRunning(server, done);
});

let validCredentials = {
  username: "newmans-r@userprofile.com",
  password: "1234",
};

let secondValidCredentials = {
  username: "newmans-r@seconduserprofile.com",
  password: "1234",
};

let thirdValidCredentials = {
  username: "newmans-r@thirduserprofile.com",
  password: "1234",
};

describe('Profile Route Tests', () => {

  let token;
  let token2;
  let token3;

  let generatedReviewId;
  let generatedReviewId2;
  let reviewUrl;
    
    let profileUrl1;
    let profileUrl2;
  let profileUrl3;
  
  let likeUrl;

  let generatedUserId;
  let secondGeneratedUserId;
  let thirdGeneratedUserId;

  let generatedOfferId;
  let generatedCategoryId;
  let urlCategories1;

  before(async function () {});

  it("AB_01 POST - Create new user - 201", (done) => {
    let user = {
      lastname: "Newman",
      firstname: "Randy",
      username: "newmans-r@userprofile.com",
      password: "1234",
      state: "active",
    };

    chai
      .request(server)
      .post(config.get("backend.apiPrefix") + "/users")
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.not.have.property("password");
        generatedUserId = res.body._id;
        profileUrl1 = url + "/users/" + generatedUserId + "/profile";
        done();
      });
  });

  it("AB_01.1 POST - Create second new user - 201", (done) => {
    let user = {
      lastname: "Newman",
      firstname: "Randy",
      username: "newmans-r@seconduserprofile.com",
      password: "1234",
      state: "active",
    };

    chai
      .request(server)
      .post(config.get("backend.apiPrefix") + "/users")
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.not.have.property("password");
        secondGeneratedUserId = res.body._id;
        profileUrl2 = url + "/users/" + secondGeneratedUserId + "/profile";
        done();
      });
  });

  it("AB_01.1 POST - Create third new user - 201", (done) => {
    let user = {
      lastname: "Newman",
      firstname: "Randy",
      username: "newmans-r@thirduserprofile.com",
      password: "1234",
      state: "active",
    };

    chai
      .request(server)
      .post(config.get("backend.apiPrefix") + "/users")
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.not.have.property("password");
        thirdGeneratedUserId = res.body._id;
        profileUrl3 = url + "/users/" + thirdGeneratedUserId + "/profile";
        done();
      });
  });

  it("AB_02 POST - Login first user - 200", (done) => {
    chai
      .request(server)
      .post(config.get("backend.apiPrefix") + "/login")
      .send(validCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("token");
        token = res.body.token;
        done();
      });
  });

  it("AB_02.0.1 POST - Login second user - 200", (done) => {
    chai
      .request(server)
      .post(config.get("backend.apiPrefix") + "/login")
      .send(secondValidCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("token");
        token2 = res.body.token;
        done();
      });
  });

  it("AB_02.0.1 POST - Login third user - 200", (done) => {
    chai
      .request(server)
      .post(config.get("backend.apiPrefix") + "/login")
      .send(thirdValidCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("token");
        token3 = res.body.token;
        done();
      });
  });

  it("AB_03 POST - Create category 1 - 201", (done) => {
    let category = {
      name: "myCategory1234",
    };

    chai
      .request(server)
      .post(config.get("backend.apiPrefix") + "/categories")
      .set("Authorization", "Bearer " + token2)
      .send(category)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("_id");
        generatedCategoryId = res.body._id;
        urlCategories1 =
          config.get("backend.apiPrefix") + "/categories/" + generatedCategoryId + "/offers";
        done();
      });
  });

  it("AB_04 POST - Create offer - 201", (done) => {
    let offerObj = {
      title: "myNewTitle",
      description: "myDescription1",
      minAttendees: 3,
      maxAttendees: 10,
    };
    chai
      .request(server)
      .post(urlCategories1)
      .set("Authorization", "Bearer " + token2)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("attendeeCount").eql(0);
        generatedOfferId = res.body._id;
        done();
      });
  });

  it("AB_05 PATCH - enroll first user for offer with description - 204", (done) => {
    let enrollment = {
      description: "My enrollment is the best! Take me!",
    };
    chai
      .request(server)
      .patch(urlCategories1 + "/" + generatedOfferId + "/addEnrollment")
      .set("Authorization", "Bearer " + token)
      .send(enrollment)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("AB_05.1 PATCH - enroll second user for offer with description - 204", (done) => {
    let enrollment = {
      description: "My enrollment is the best! Take me!",
    };
    chai
      .request(server)
      .patch(urlCategories1 + "/" + generatedOfferId + "/addEnrollment")
      .set("Authorization", "Bearer " + token3)
      .send(enrollment)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("AB_06 PATCH - accept first attendee - 204", (done) => {
    let body = {
      id: generatedUserId,
    };

    chai
      .request(server)
      .patch(urlCategories1 + "/" + generatedOfferId + "/acceptAttendee")
      .set("Authorization", "Bearer " + token2)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("AB_06.1 PATCH - accept second attendee - 204", (done) => {
    let body = {
      id: thirdGeneratedUserId,
    };

    chai
      .request(server)
      .patch(urlCategories1 + "/" + generatedOfferId + "/acceptAttendee")
      .set("Authorization", "Bearer " + token2)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
    
    it("PF_01 GET - Get own user profile", (done) => {
        chai
            .request(server)
            .get(profileUrl1)
            .set("Authorization", "Bearer " + token)
            .send()
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.should.have.property('statistics');
              res.body.statistics.should.have.property("likedState", false);
              res.body.should.have.property('generalInfo');
              res.body.should.have.property("privateInfo");
              res.body.should.have.property("additionalInfo");
              res.body.should.have.property("reviews");
              res.body.reviews.length.should.be.eql(0);
              res.body.should.have.property("canReview", false);
              res.body.should.have.property("myReview", null);
                done();
            });
    });
  
  it("PF_02 GET - Get profile of different user", (done) => {
    chai
      .request(server)
      .get(profileUrl1)
      .set("Authorization", "Bearer " + token2)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("statistics");
        res.body.statistics.should.have.property("likedState", false);
        res.body.should.have.property("generalInfo");
        res.body.should.have.property("privateInfo");
        res.body.should.have.property("additionalInfo");
        res.body.should.have.property("reviews");
        res.body.reviews.length.should.be.eql(0);
        res.body.should.have.property("canReview", false);
        res.body.should.have.property("myReview", null);
        done();
      });
  });

  it("PF_02.1 GET - Get profile of unknown user - 404", (done) => {
    chai
      .request(server)
      .get(url + "/users/" + '5df65dc6ecfa191b9067d83d' + "/profile")
      .set("Authorization", "Bearer " + token2)
      .send()
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("PF_03 GET - Get profile of different user; can review = true - 200", (done) => {
    chai
      .request(server)
      .get(profileUrl2)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.body.should.be.a("object");
        res.body.should.have.property("canReview", true);
        done();
      });
  });

  it("AB_07 POST - Create new Review; first user - 200", (done) => {
    let review = {
      content: "Najo dos wird holt donn irgendwie so a content werden",
      rating: 3,
    };

    reviewUrl = url + "/users/" + secondGeneratedUserId + "/reviews";

    chai
      .request(server)
      .post(reviewUrl)
      .set("Authorization", "Bearer " + token)
      .send(review)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("_id");
        generatedReviewId = res.body._id;
        done();
      });
  });

  it("PF_04 GET - Get profile of reviewed user; check myReview != null - 200", (done) => {
    chai
      .request(server)
      .get(profileUrl2)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("canReview", true);
        res.body.should.have.property("myReview");
        res.body.myReview.should.have.property("_id");
        done();
      });
  });

  it("PF_05 GET - Get profile of different user; with Review; canReview = true - 200", (done) => {
    chai
      .request(server)
      .get(profileUrl2)
      .set("Authorization", "Bearer " + token3)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("reviews");
        res.body.reviews.length.should.be.eql(1);
        res.body.should.have.property("canReview", true);
        res.body.should.have.property("myReview", null);
        done();
      });
  });

  it("PF_06 GET - Get profile of different user; with own Review; canReview = false - 200", (done) => {
    chai
      .request(server)
      .get(profileUrl2)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("reviews");
        res.body.reviews.length.should.be.eql(0);
        res.body.should.have.property("canReview", true);
        res.body.should.have.property("myReview");
        res.body.myReview._id.should.be.eql(generatedReviewId);
        done();
      });
  });

  it("PF_07 GET - Get own user profile; canReview = false - 200", (done) => {
    chai
      .request(server)
      .get(profileUrl2)
      .set("Authorization", "Bearer " + token2)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("reviews");
        res.body.reviews.length.should.be.eql(1);
        res.body.should.have.property("canReview", false);
        res.body.should.have.property("myReview", null);
        done();
      });
  });

  it("PF_08 GET - Get rating and reviewCount of reviewed user; myReview != null - 200", (done) => {
    chai
      .request(server)
      .get(profileUrl2)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("statistics");
        res.body.statistics.should.have.property("averageRating", 3);
        res.body.statistics.should.have.property("reviewCount", 1);
        res.body.myReview.should.have.property("_id");
        done();
      });
  });

  it("PF_09 GET - Get rating and reviewCount of reviewed user; myReview = null - 200", (done) => {
    chai
      .request(server)
      .get(profileUrl2)
      .set("Authorization", "Bearer " + token3)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("statistics");
        res.body.statistics.should.have.property("averageRating", 3);
        res.body.statistics.should.have.property("reviewCount", 1);
        res.body.should.have.property("myReview", null);
        done();
      });
  });

  it("AB_08 POST - Create new Review; third user - 200", (done) => {
    let review = {
      content: "Najo dos wird holt donn irgendwie so a content werden",
      rating: 5,
    };

    reviewUrl = url + "/users/" + secondGeneratedUserId + "/reviews";

    chai
      .request(server)
      .post(reviewUrl)
      .set("Authorization", "Bearer " + token3)
      .send(review)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("_id");
        generatedReviewId2 = res.body._id;
        done();
      });
  });

  it("PF_10 GET - Get profile of reviewed user; check myReview != null - 200", (done) => {
    chai
      .request(server)
      .get(profileUrl2)
      .set("Authorization", "Bearer " + token3)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("canReview", true);
        res.body.should.have.property("myReview");
        res.body.myReview.should.have.property("_id");
        done();
      });
  });

  it("PF_11 GET - Get profile of reviewed user; check statistics - 200", (done) => {
    chai
      .request(server)
      .get(profileUrl2)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("statistics");
        res.body.statistics.should.have.property("reviewCount", 2);
        res.body.statistics.should.have.property("likeCount", 0);
        res.body.statistics.should.have.property("studentCount", 2);
        res.body.statistics.should.have.property("averageRating", 4);
        done();
      });
  });

  it("AB_09 PATCH - remove first attendee - 204", (done) => {
    let body = {
      id: generatedUserId,
    };

    chai
      .request(server)
      .patch(urlCategories1 + "/" + generatedOfferId + "/rejectAttendee")
      .set("Authorization", "Bearer " + token2)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("PF_12 GET - Get profile of reviewed user; check studentcount - 200", (done) => {
    chai
      .request(server)
      .get(profileUrl2)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("statistics");
        res.body.statistics.should.have.property("reviewCount", 2);
        res.body.statistics.should.have.property("likeCount", 0);
        res.body.statistics.should.have.property("studentCount", 1);
        res.body.statistics.should.have.property("averageRating", 4);
        done();
      });
  });

  it("PF_13 PATCH - like second user; third user - 204", (done) => {
    let body = {
      likeState: true
    };

    likeUrl = url + "/users/" + secondGeneratedUserId + "/setLikeState";

    chai
      .request(server)
      .patch(likeUrl)
      .set("Authorization", "Bearer " + token3)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
    })
  });

  it("PF_14 PATCH - like second user; first user - 204", (done) => {
    let body = {
      likeState: true,
    };

    chai
      .request(server)
      .patch(likeUrl)
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("PF_15 GET - Get profile of liked user; check likeCount - 200", (done) => {
    chai
      .request(server)
      .get(profileUrl2)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("statistics");
        res.body.statistics.should.have.property("reviewCount", 2);
        res.body.statistics.should.have.property("likeCount", 2);
        res.body.statistics.should.have.property("studentCount", 1);
        res.body.statistics.should.have.property("averageRating", 4);
        done();
      });
  });

  it("PF_16 PATCH - remove like from second user; first user - 204", (done) => {
    let body = {
      likeState: false,
    };

    likeUrl = url + "/users/" + secondGeneratedUserId + "/setLikeState";

    chai
      .request(server)
      .patch(likeUrl)
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("PF_15 GET - Get profile of liked user; check likeCount - 200", (done) => {
    chai
      .request(server)
      .get(profileUrl2)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("statistics");
        res.body.statistics.should.have.property("likeCount", 1);
        done();
      });
  });

  it("PF_16 PATCH - like second user again; third user - 204", (done) => {
    let body = {
      likeState: true,
    };

    chai
      .request(server)
      .patch(likeUrl)
      .set("Authorization", "Bearer " + token3)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("PF_17 PATCH - remove like from second user again; first user - 204", (done) => {
    let body = {
      likeState: false,
    };

    chai
      .request(server)
      .patch(likeUrl)
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("PF_18 GET - Get profile of liked user; check likeCount - 200", (done) => {
    chai
      .request(server)
      .get(profileUrl2)
      .set("Authorization", "Bearer " + token)
      .send()
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("statistics");
        res.body.statistics.should.have.property("likeCount", 1);
        done();
      });
  });

  it("PF_19 PATCH - like second user; first user; invalid payload - 400", (done) => {
    let body = {
      likeStatus: true,
    };

    chai
      .request(server)
      .patch(likeUrl)
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("PF_20 PATCH - like second user; first user; invalid likeState - 400", (done) => {
    let body = {
      likeState: "sau geil",
    };

    chai
      .request(server)
      .patch(likeUrl)
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it("PF_20 PATCH - like unknown user; - 404", (done) => {
    let body = {
      likeState: true,
    };

    chai
      .request(server)
      .patch(url + "/users/" + '5df65dc6ecfa191b9067d83d' + "/setLikeState")
      .set("Authorization", "Bearer " + token)
      .send(body)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it("AB_99 DELETE - User1 - 204", (done) => {
    chai
      .request(server)
      .delete(config.get("backend.apiPrefix") + "/users/" + generatedUserId)
      .set("Authorization", "Bearer " + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("AB_98 DELETE - User2 - 204", (done) => {
    chai
      .request(server)
      .delete(
        config.get("backend.apiPrefix") + "/users/" + secondGeneratedUserId
      )
      .set("Authorization", "Bearer " + token2)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it("AB_97 DELETE - User3 - 204", (done) => {
    chai
      .request(server)
      .delete(
        config.get("backend.apiPrefix") + "/users/" + thirdGeneratedUserId
      )
      .set("Authorization", "Bearer " + token3)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
})