const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('config');

const {
  server,
  checkErrorResponse,
  ensureServerIsRunning,
} = require('./000_helpersTest');

chai.use(chaiHttp);
chai.should();

const url = config.get('backend.apiPrefix');

before((done) => {
  ensureServerIsRunning(server, done);
});

let validCredentials = {
  username: 'newmans-r@userreview.com',
  password: '1234',
};

let secondValidCredentials = {
  username: 'newmans-r@seconduserreview.com',
  password: '1234',
};

let thirdValidCredentials = {
  username: 'newmans-r@thirduserreviews.com',
  password: '1234',
};

let fourthValidCredentials = {
  username: "newmans-r@fourthuserreviews.com",
  password: "1234",
};

describe(`Entity 'Review' tests`, () => {

  let token;
  let token2;
  let token3;
  let token4;

  let generatedReviewId;
  let generatedReviewId2;

  let generatedUserId;
  let secondGeneratedUserId;
  let thirdGeneratedUserId;
  let fourthGeneratedUserId;

  let reviewUrl1;
  let reviewUrl2;
  let reviewUrl3;

  let patchUrl;
  
  let generatedAnswerIds = [];

  let generatedOfferId;
  let generatedCategoryId;
  let urlCategories1;

  before(async function () {});

  it('AB_01 POST - Create new user - 201', (done) => {
    let user = {
      lastname: 'Newman',
      firstname: 'Randy',
      username: 'newmans-r@userreview.com',
      password: '1234',
      state: 'active',
    };

    chai
      .request(server)
      .post(config.get('backend.apiPrefix') + '/users')
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.not.have.property('password');
        generatedUserId = res.body._id;
        reviewUrl1 = url + '/users/' + generatedUserId + '/reviews';
        done();
      });
  });

  it('AB_01.1 POST - Create second new user - 201', (done) => {
    let user = {
      lastname: 'Newman',
      firstname: 'Randy',
      username: 'newmans-r@seconduserreview.com',
      password: '1234',
      state: 'active'
    };

    chai
      .request(server)
      .post(config.get('backend.apiPrefix') + '/users')
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.not.have.property('password');
        secondGeneratedUserId = res.body._id;
        reviewUrl2 = url + '/users/' + secondGeneratedUserId + '/reviews';
        done();
      });
  });

  it('AB_01.1 POST - Create third new user - 201', (done) => {
    let user = {
      lastname: 'Newman',
      firstname: 'Randy',
      username: 'newmans-r@thirduserreviews.com',
      password: '1234',
      state: 'active'
    };

    chai
      .request(server)
      .post(config.get('backend.apiPrefix') + '/users')
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.not.have.property('password');
        thirdGeneratedUserId = res.body._id;
        reviewUrl3 = url + '/users/' + thirdGeneratedUserId + '/reviews';
        done();
      });
  });

  it("AB_01.1 POST - Create fourth new user - 201", (done) => {
    let user = {
      lastname: "Newman",
      firstname: "Randy",
      username: "newmans-r@fourthuserreviews.com",
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
        fourthGeneratedUserId = res.body._id;
        done();
      });
  });

  it('AB_02 POST - Login first user - 200', (done) => {
    chai
      .request(server)
      .post(config.get('backend.apiPrefix') + '/login')
      .send(validCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        token = res.body.token;
        done();
      });
  });

  it('AB_02.0.1 POST - Login second user - 200', (done) => {
    chai
      .request(server)
      .post(config.get('backend.apiPrefix') + '/login')
      .send(secondValidCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        token2 = res.body.token;
        done();
      });
  });

  it('AB_02.0.1 POST - Login third user - 200', (done) => {
    chai
      .request(server)
      .post(config.get('backend.apiPrefix') + '/login')
      .send(thirdValidCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        token3 = res.body.token;
        done();
      });
  });

  it("AB_02.0.1 POST - Login fourth user - 200", (done) => {
    chai
      .request(server)
      .post(config.get("backend.apiPrefix") + "/login")
      .send(fourthValidCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("token");
        token4 = res.body.token;
        done();
      });
  });

  it('AB_03 POST - Create category 1 - 201', (done) => {
    let category = {
      name: 'myCategory123',
    };

    chai
      .request(server)
      .post(config.get('backend.apiPrefix') + '/categories')
      .set('Authorization', 'Bearer ' + token2)
      .send(category)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        generatedCategoryId = res.body._id;
        urlCategories1 =
          config.get('backend.apiPrefix') + '/categories/' + generatedCategoryId + '/offers';
        done();
      });
  });

  it('AB_04 POST - Create offer - 201', (done) => {
    let offerObj = {
      title: 'myNewTitle',
      description: 'myDescription1',
      minAttendees: 3,
      maxAttendees: 10,
    };
    chai
      .request(server)
      .post(urlCategories1)
      .set('Authorization', 'Bearer ' + token2)
      .send(offerObj)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('attendeeCount').eql(0);
        generatedOfferId = res.body._id;
        done();
      });
  });

  it('AB_05 PATCH - enroll user for offer with description - 204', (done) => {
    let enrollment = {
      description: 'My enrollment is the best! Take me!',
    };
    chai
      .request(server)
      .patch(urlCategories1 + '/' + generatedOfferId + '/addEnrollment')
      .set('Authorization', 'Bearer ' + token)
      .send(enrollment)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
  
  it('AB_05.1 PATCH - enroll second user for offer with description - 204', (done) => {
    let enrollment = {
      description: 'My enrollment is the best! Take me!',
    };
    chai
      .request(server)
      .patch(urlCategories1 + '/' + generatedOfferId + '/addEnrollment')
      .set('Authorization', 'Bearer ' + token3)
      .send(enrollment)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it('RV_01 POST - Create new Review; not eligable - 400', (done) => {
    let review = {
      content: 'Najo dos wird holt donn irgendwie so a content werden',

      rating: 3,
    };

    chai
      .request(server)
      .post(reviewUrl2)
      .set('Authorization', 'Bearer ' + token)
      .send(review)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('AB_06 PATCH - accept attendee - 204', (done) => {
    let body = {
      id: generatedUserId
    };

    chai
      .request(server)
      .patch(urlCategories1 + '/' + generatedOfferId + '/acceptAttendee')
      .set('Authorization', 'Bearer ' + token2)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it('AB_06.1 PATCH - accept second attendee - 204', (done) => {
    let body = {
      id: thirdGeneratedUserId
    };

    chai
      .request(server)
      .patch(urlCategories1 + '/' + generatedOfferId + '/acceptAttendee')
      .set('Authorization', 'Bearer ' + token2)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it('RV_02 POST - Create new Review - 200', (done) => {
    let review = {
      content: 'Najo dos wird holt donn irgendwie so a content werden',
      rating: 3
    };

    chai
      .request(server)
      .post(reviewUrl2)
      .set('Authorization', 'Bearer ' + token)
      .send(review)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        generatedReviewId = res.body._id;
        done();
      });
  });

  it('AB_09 PATCH - remove second attendee - 204', (done) => {
    let body = {
      id: thirdGeneratedUserId,
    };

    chai
      .request(server)
      .patch(urlCategories1 + '/' + generatedOfferId + '/rejectAttendee')
      .set('Authorization', 'Bearer ' + token2)
      .send(body)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it('RV_02.1 POST - Create new Review; removed attendee - 200', (done) => {
    let review = {
      content: 'Najo dos wird holt donn irgendwie so a content werden',
      rating: 3,
    };

    chai
      .request(server)
      .post(reviewUrl2)
      .set('Authorization', 'Bearer ' + token3)
      .send(review)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        generatedReviewId2 = res.body._id;
        done();
      });
  });

  it('RV_02.2 DELETE - delete second review - 204', (done) => {
    chai
      .request(server)
      .delete(reviewUrl2 + '/' + generatedReviewId2)
      .set('Authorization', 'Bearer ' + token3)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it('RV_03 POST - Create new review for own user - 400', (done) => {
    let review = {
      content: 'Najo dos wird holt donn irgendwie so a content sein',
      rating: 3,
    };

    chai
      .request(server)
      .post(reviewUrl1)
      .set('Authorization', 'Bearer ' + token)
      .send(review)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_04 POST - Create second review for user - 400', (done) => {
    let review = {
      content: 'Najo dos wird holt donn irgendwie so a content werden',
      rating: 3,
    };

    chai
      .request(server)
      .post(reviewUrl3)
      .set('Authorization', 'Bearer ' + token)
      .send(review)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_05 POST - Create Review with invalid payload - 400', (done) => {
    let review = {
      text: 'Najo dos wird holt donn irgendwie so a content werden',
      nummer: 3,
      author: generatedUserId,
    };

    chai
      .request(server)
      .post(reviewUrl2)
      .set('Authorization', 'Bearer ' + token)
      .send(review)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_06 POST - Create Review with invalid rating - 400', (done) => {
    let review = {
      content: 'Najo dos wird holt donn irgendwie so a content werden',
      rating: 'blau',
    };

    chai
      .request(server)
      .post(reviewUrl2)
      .set('Authorization', 'Bearer ' + token)
      .send(review)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_07 POST - Create Review with rating out of range - 400', (done) => {
    let review = {
      content: 'Najo dos wird holt donn irgendwie so a content werden',
      rating: 100
    };

    chai
      .request(server)
      .post(reviewUrl2)
      .set('Authorization', 'Bearer ' + token)
      .send(review)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_08 POST - Create Review for unknown user - 404', (done) => {
    let review = {
      content: 'Najo dos wird holt donn irgendwie so a content werden',
      rating: 3
    };

    chai
      .request(server)
      .post(
        config.get('backend.apiPrefix') +
          '/users/5edd2aeea595544294454ab3/reviews'
      )
      .set('Authorization', 'Bearer ' + token)
      .send(review)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_09 GET - Get all Reviews for one user [EMPTY] - 200', (done) => {
    chai
      .request(server)
      .get(reviewUrl1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
  });

  it('RV_10 GET - Get all Reviews for one user [NOT EMPTY] - 200', (done) => {
    chai
      .request(server)
      .get(reviewUrl2)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(1);
        done();
      });
  });

  it('RV_11 GET - Get all Reviews for unknown user - 404', (done) => {
    chai
      .request(server)
      .get(
        config.get('backend.apiPrefix') +
          '/users/5edd2aeea595544294454ab3/reviews'
      )
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_12 GET - Get one Review per id - 200', (done) => {
    chai
      .request(server)
      .get(reviewUrl2 + '/' + generatedReviewId)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.not.have.property('length');
        res.body.should.have.property('_id').eql(generatedReviewId);
        done();
      });
  });

  it('RV_13 GET - Get one review per id from unknown user - 404', (done) => {
    chai
      .request(server)
      .get(
        config.get('backend.apiPrefix') +
          '/users/5edd2aeea595544294454ab3/reviews' +
          '/' +
          generatedReviewId
      )
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_14 GET - Get one review per id; unknown reviewId - 404', (done) => {
    chai
      .request(server)
      .get(reviewUrl2 + '/' + '5edd2aeea595544294454ab3')
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_15 PATCH - Update review; one field - 200', (done) => {
    patchUrl = reviewUrl2 + '/' + generatedReviewId;

    let updateFields = {
      content: 'Dos is donn echt da content so',
    };

    chai
      .request(server)
      .patch(patchUrl)
      .set('Authorization', 'Bearer ' + token)
      .send(updateFields)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('RV_16 PATCH - Update review; all fields - 200', (done) => {
    let updateFields = {
      content: 'Des is jetzt da content',
      rating: 5,
    };

    chai
      .request(server)
      .patch(patchUrl)
      .set('Authorization', 'Bearer ' + token)
      .send(updateFields)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('RV_17 PATCH - Update Review of unknown user - 404', (done) => {
    let updateFields = {
      content: 'Des is jetzt da content',
      rating: 5,
    };

    chai
      .request(server)
      .patch(
        config.get('backend.apiPrefix') +
          '/users/5edd2aeea595544294454ab3/reviews' +
          '/' +
          generatedReviewId
      )
      .set('Authorization', 'Bearer ' + token)
      .send(updateFields)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_18 PATCH - Update unknown review - 404', (done) => {
    let updateFields = {
      content: 'Des is jetzt da content',
      rating: 5,
    };

    chai
      .request(server)
      .patch(reviewUrl2 + '/' + '5edd2aeea595544294454ab3')
      .set('Authorization', 'Bearer ' + token)
      .send(updateFields)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_19 PATCH - Update authorId of review - 400', (done) => {
    let updateFields = {
      authorId: secondGeneratedUserId,
    };

    chai
      .request(server)
      .patch(patchUrl)
      .set('Authorization', 'Bearer ' + token)
      .send(updateFields)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_20 PATCH - Update rating; invalid rating - 400', (done) => {
    let updateFields = {
      rating: 'blau',
    };

    chai
      .request(server)
      .patch(patchUrl)
      .set('Authorization', 'Bearer ' + token)
      .send(updateFields)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_21 PATCH - Update rating; out of range - 400', (done) => {
    let updateFields = {
      rating: 100,
    };

    chai
      .request(server)
      .patch(patchUrl)
      .set('Authorization', 'Bearer ' + token)
      .send(updateFields)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_22 PATCH - Update review; Invalid payload - 400', (done) => {
    let updateFields = {
      autor: secondGeneratedUserId,
      text: 'neuer text',
    };

    chai
      .request(server)
      .patch(patchUrl)
      .set('Authorization', 'Bearer ' + token)
      .send(updateFields)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_23 DELETE - delete review from unknown user - 404', (done) => {
    chai
      .request(server)
      .delete(
        config.get('backend.apiPrefix') +
          '/users/5edd2aeea595544294454ab3/reviews' +
          '/' +
          generatedReviewId
      )
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_24 DELETE - delete unknown review - 404', (done) => {
    chai
      .request(server)
      .delete(reviewUrl2 + '/' + '5edd2aeea595544294454ab3')
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_25 DELETE - Delete review of different author - 400', (done) => {
    chai
      .request(server)
      .delete(patchUrl)
      .set('Authorization', 'Bearer ' + token3)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_26 Create first review answer - 200', (done) => {
    let answer = {
      content: 'Du redest nur kacke heee'
    };
    chai
      .request(server)
      .post(patchUrl + '/answers')
      .set('Authorization', 'Bearer ' + token)
      .send(answer)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.answers.should.be.a('array');
        generatedAnswerIds.push(res.body.answers[res.body.answers.length - 1]._id);
        res.body.answers.length.should.be.eql(generatedAnswerIds.length);
        res.body.answers[res.body.answers.length - 1].should.have.property('content').eql(answer.content);
        done();
      });
  });

  it('RV_27 Create second review answer - 200', (done) => {
    let answer = {
      content: 'Dos stimmt nit! I sog de Wohrheit'
    };
    chai
      .request(server)
      .post(patchUrl + '/answers')
      .set('Authorization', 'Bearer ' + token)
      .send(answer)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.answers.should.be.a('array');
        generatedAnswerIds.push(res.body.answers[res.body.answers.length - 1]._id);
        res.body.answers.length.should.be.eql(generatedAnswerIds.length);
        res.body.answers[res.body.answers.length - 1].should.have.property('content').eql(answer.content);
        done();
      });
  });

  it('RV_28 Create review answer - wrong body param - 400', (done) => {
    let answer = {
      kontent: 'Sichaaaa'
    };
    chai
      .request(server)
      .post(patchUrl + '/answers')
      .set('Authorization', 'Bearer ' + token)
      .send(answer)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_29 Create review answer - empty content - 400', (done) => {
    let answer = {
      content: ''
    };
    chai
      .request(server)
      .post(patchUrl + '/answers')
      .set('Authorization', 'Bearer ' + token)
      .send(answer)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_30 Create review answer - no body param - 400', (done) => {
    let answer = { };
    chai
      .request(server)
      .post(patchUrl + '/answers')
      .set('Authorization', 'Bearer ' + token)
      .send(answer)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_31 Create review answer - too many body params - 400', (done) => {
    let answer = {
      content: 'Sichaaaa',
      authorId: generatedUserId
    };
    chai
      .request(server)
      .post(patchUrl + '/answers')
      .set('Authorization', 'Bearer ' + token)
      .send(answer)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_32 Create review answer - not allowed - 400', (done) => {
    let answer = {
      content: 'Du redest nur kacke heee'
    };
    chai
      .request(server)
      .post(patchUrl + '/answers')
      .set('Authorization', 'Bearer ' + token4)
      .send(answer)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_33 GET - Get one Review per id with answers - 200', (done) => {
    chai
      .request(server)
      .get(reviewUrl2 + '/' + generatedReviewId)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.not.have.property('length');
        res.body.should.have.property('_id').eql(generatedReviewId);
        res.body.answers.should.be.a('array');
        res.body.answers.length.should.be.eql(generatedAnswerIds.length);
        done();
      });
  });

   it('RV_34 PATCH review answer by author - 200', (done) => {
    let answer = {
      content: 'Jo stimmt host recht'
    };
    chai
      .request(server)
      .patch(reviewUrl2 + '/' + generatedReviewId + '/answers/' + generatedAnswerIds[0])
      .set('Authorization', 'Bearer ' + token)
      .send(answer)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.answers.should.be.a('array');
        res.body.answers.length.should.be.eql(generatedAnswerIds.length);
        res.body.answers[0].should.have.property('content').eql(answer.content);
        done();
      });
   });
  
  it('RV_35 PATCH review answer by author - empty content - 400', (done) => {
    let answer = {
      content: ''
    };
    chai
      .request(server)
      .patch(reviewUrl2 + '/' + generatedReviewId + '/answers/' + generatedAnswerIds[0])
      .set('Authorization', 'Bearer ' + token)
      .send(answer)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
   });
  
  it('RV_36 PATCH review answer by offeror - 400', (done) => {
    let answer = {
      content: 'Jo stimmt host du oba nit recht'
    };
    chai
      .request(server)
      .patch(reviewUrl2 + '/' + generatedReviewId + '/answers/' + generatedAnswerIds[0])
      .set('Authorization', 'Bearer ' + token2)
      .send(answer)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_37 PATCH review answer by someone else - 400', (done) => {
    let answer = {
      content: 'Jo stimmt host du oba echt nit recht'
    };
    chai
      .request(server)
      .patch(reviewUrl2 + '/' + generatedReviewId + '/answers/' + generatedAnswerIds[0])
      .set('Authorization', 'Bearer ' + token3)
      .send(answer)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_38 PATCH review answer - wrong reviewId - 404', (done) => {
    let answer = {
      content: 'Jo stimmt host du oba echt nit recht'
    };
    chai
      .request(server)
      .patch(reviewUrl2 + '/' + generatedUserId + '/answers/' + generatedAnswerIds[0])
      .set('Authorization', 'Bearer ' + token)
      .send(answer)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_39 PATCH review answer - wrong answerId - 404', (done) => {
    let answer = {
      content: 'Jo stimmt host du oba echt nit recht'
    };
    chai
      .request(server)
      .patch(reviewUrl2 + '/' + generatedReviewId + '/answers/' + generatedReviewId)
      .set('Authorization', 'Bearer ' + token3)
      .send(answer)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_40 DELETE review answer as author - 204', (done) => {
    chai
      .request(server)
      .delete(patchUrl + '/answers/' + generatedAnswerIds[0])
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        res.should.have.status(204);
        generatedAnswerIds = generatedAnswerIds.filter(x => x != generatedAnswerIds[0]);
        done();
      });
  });

  it('RV_41 GET - Get one Review per id with answers after deleting one - 200', (done) => {
    chai
      .request(server)
      .get(reviewUrl2 + '/' + generatedReviewId)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.not.have.property('length');
        res.body.should.have.property('_id').eql(generatedReviewId);
        res.body.answers.should.be.a('array');
        res.body.answers.length.should.be.eql(generatedAnswerIds.length);
        done();
      });
  });

  it('RV_42 DELETE review answer - wrong reviewId - 404', (done) => {
    chai
      .request(server)
      .delete(reviewUrl2 + '/' + generatedAnswerIds[0] + '/answers/' + generatedReviewId)
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        res.should.have.status(404);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_43 DELETE review answer - wrong answerId - 404', (done) => {
  chai
    .request(server)
    .delete(reviewUrl2 + '/' + generatedReviewId + '/answers/' + generatedReviewId)
    .set('Authorization', 'Bearer ' + token)
    .end((err, res) => {
      res.should.have.status(404);
      checkErrorResponse(res);
      done();
    });
  });
  
  it('RV_44 DELETE review answer - not permitted user - 400', (done) => {
    chai
      .request(server)
      .delete(reviewUrl2 + '/' + generatedReviewId + '/answers/' + generatedAnswerIds[0])
      .set('Authorization', 'Bearer ' + token3)
      .end((err, res) => {
        res.should.have.status(400);
        checkErrorResponse(res);
        done();
      });
  });

  it('RV_45 DELETE review answer as offeror - 204', (done) => {
    chai
      .request(server)
      .delete(patchUrl + '/answers/' + generatedAnswerIds[0])
      .set('Authorization', 'Bearer ' + token2)
      .end((err, res) => {
        res.should.have.status(204);
        generatedAnswerIds = generatedAnswerIds.filter(x => x != generatedAnswerIds[0]);
        done();
      });
  });

  it('RV_46 GET - Get one Review per id with answers after deleting another one - 200', (done) => {
    chai
      .request(server)
      .get(reviewUrl2 + '/' + generatedReviewId)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.not.have.property('length');
        res.body.should.have.property('_id').eql(generatedReviewId);
        res.body.answers.should.be.a('array');
        res.body.answers.length.should.be.eql(generatedAnswerIds.length);
        done();
      });
  });

  it('RV_47 DELETE - delete review - 204', (done) => {
    chai
      .request(server)
      .delete(patchUrl)
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it('RV_48 GET - Get all Reviews after deletion - 200', (done) => {
    chai
      .request(server)
      .get(reviewUrl2)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
  });

  it('AB_99 DELETE - User1 - 204', (done) => {
    chai
      .request(server)
      .delete(config.get('backend.apiPrefix') + '/users/' + generatedUserId)
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  it('AB_98 DELETE - User2 - 204', (done) => {
    chai
      .request(server)
      .delete(
        config.get('backend.apiPrefix') + '/users/' + secondGeneratedUserId
      )
      .set('Authorization', 'Bearer ' + token2)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
  it('AB_97 DELETE - User3 - 204', (done) => {
    chai
      .request(server)
      .delete(
        config.get('backend.apiPrefix') + '/users/' + thirdGeneratedUserId
      )
      .set('Authorization', 'Bearer ' + token3)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
  it("AB_96 DELETE - User4 - 204", (done) => {
    chai
      .request(server)
      .delete(
        config.get("backend.apiPrefix") + "/users/" + fourthGeneratedUserId
      )
      .set("Authorization", "Bearer " + token4)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
});
