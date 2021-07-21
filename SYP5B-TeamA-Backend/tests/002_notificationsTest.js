// Links which I have used:
// https://mochajs.org/

// https://scotch.io/tutorials/test-a-node-restful-api-with-mocha-and-chai
// https://github.com/microsoft/vscode-recipes/tree/master/debugging-mocha-tests
// https://github.com/chaijs/chai-http/issues/178
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

let usersUrl = config.get('backend.apiPrefix') + '/users';
let url = config.get('backend.apiPrefix') + '/users/notifications';

before((done) => {
    ensureServerIsRunning(server, done);
});

describe('CRUD Entity /notifications ' + url, () => {
    let mainUserId = null;
    let mainUserToken = null;
    let notificationMainUserURL = null;
    let secondUserId = null;
    let secondUserToken = null;
    let generatedNotificationIds = [];
    let notificationDeletedId = null;
    let numberOfExistingNotifications = 0;
    let token;

    before(async function () {});

    // GET Request should be implemented here
    // diegit se Requests aus dem POSTMAN nehmen

    it('AA_00 POST Create user - 201', (done) => {
        let user = {
        lastname: 'Boyle',
        firstname: 'Katlynn',
        username: 'user1@htl-villach.at',
        password: '1234',
        state: 'active',
        };

        chai
        .request(server)
        .post(usersUrl)
        .send(user)
        .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            Object.keys(res.body).length.should.eql(8);

            res.body.should.have.property('_id').not.to.be.null;
            res.body.should.have.property('lastname').eql(user.lastname);
            res.body.should.have.property('firstname').eql(user.firstname);
            res.body.should.have.property('state').eql(user.state);

            res.body.should.not.have.property('password');

            mainUserId = res.body._id;
            notificationMainUserURL = `${usersUrl}/${mainUserId}/notifications`;
            done();
        });
    });

    it('AA_00 POST - Login user - 200', (done) => {
        let validCredentials = {
        username: 'user1@htl-villach.at',
        password: '1234',
        };
        chai
        .request(server)
        .post(config.backend.apiPrefix + '/login')
        .send(validCredentials)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('token');
            mainUserToken = res.body.token;
            done();
        });
    });

    it('AA_00 create second user - 201', (done) => {
        let user = {
        lastname: 'Reynolds',
        firstname: 'Destiney',
        password: '1234',
        username: 'user2@htl-villach.at',
        state: 'active',
        };

        chai
        .request(server)
        .post(usersUrl)
        .send(user)
        .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            res.body.should.have.property('_id').not.to.be.null;
            res.body.should.have.property('lastname').eql(user.lastname);
            res.body.should.have.property('firstname').eql(user.firstname);
            res.body.should.have.property('state').eql(user.state);
            res.body.should.not.have.property('password');

            secondUserId = res.body._id;
            done();
        });
    });

    it('AA_00 POST - Login second user - 200', (done) => {
        let validCredentials = {
        username: 'user2@htl-villach.at',
        password: '1234',
        };
        chai
        .request(server)
        .post(config.backend.apiPrefix + '/login')
        .send(validCredentials)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('token');
            secondUserToken = res.body.token;
            done();
        });
    });

    it('AA_01 GET all notifications - 200', (done) => {
        chai
        .request(server)
        .get(url)
        .set('Authorization', 'Bearer ' + mainUserToken)
            .end((err, res) => {
            debugger
            res.should.have.status(200);
            Object.keys(res.body).length.should.be.eql(2);
            res.body.notifications.length.should.be.eql(generatedNotificationIds.length);
            done();
        });
    });

    it('AA_02 create notification 1 - 201', (done) => {
        let notification = {
            title: 'Notification test'
        };

        chai
        .request(server)
        .post(notificationMainUserURL)
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(201);
            Object.keys(res.body).length.should.eql(6);

            res.body.should.have.property('_id').not.to.be.null;
            res.body.should.have.property('title').eql(notification.title);
            res.body.should.have.property('type').eql('info');
            res.body.should.have.property('read').eql(false);
            res.body.should.have.property('timestamp');
            res.body.should.have.property('contentReference').eql({ type: 'none', content: '' });

            res.body.should.not.have.property('description');

            generatedNotificationIds.push(res.body._id);
            done();
        });
    });

    it('AA_03 GET all notifications - 200', (done) => {
        chai
        .request(server)
        .get(url)
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(200);
            Object.keys(res.body).length.should.be.eql(2);
            res.body.notifications.length.should.be.eql(generatedNotificationIds.length);
            done();
        });
    });

    it('AA_04 create notification 2 - 201', (done) => {
        let notification = {
            title: 'Seas du notification 2',
            type: 'error',
            description: 'i bin a suppa notification',
            contentReference: {
                type: 'none'
            }
        };

        chai
        .request(server)
        .post(notificationMainUserURL)
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(201);
            Object.keys(res.body).length.should.eql(7);

            res.body.should.have.property('_id').not.to.be.null;
            res.body.should.have.property('title').eql(notification.title);
            res.body.should.have.property('type').eql(notification.type);
            res.body.should.have.property('description').eql(notification.description);
            res.body.should.have.property('contentReference').not.eql(notification.contentReference);
            res.body.should.have.property('read').eql(false);
            res.body.should.have.property('timestamp');

            generatedNotificationIds.push(res.body._id);
            done();
        });
    });

    it('AA_05 create notification 3 - 201', (done) => {
        let notification = {
            title: 'Seas du notification 3',
            type: 'warning',
            description: 'i bin a suppa notification3',
            contentReference: {
                type: 'offeraccepted',
                content: {
                    categoryId: '124214ksdxma923jsa',
                    offerId: '467324sdjf12381'
                }
            }
        };

        chai
        .request(server)
        .post(notificationMainUserURL)
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(201);
            Object.keys(res.body).length.should.eql(7);

            res.body.should.have.property('_id').not.to.be.null;
            res.body.should.have.property('title').eql(notification.title);
            res.body.should.have.property('type').eql(notification.type);
            res.body.should.have.property('description').eql(notification.description);
            res.body.should.have.property('contentReference').eql(notification.contentReference);
            res.body.should.have.property('read').eql(false);
            res.body.should.have.property('timestamp');

            generatedNotificationIds.push(res.body._id);
            done();
        });
    });

    it('AA_06 GET all notifications - 200', (done) => {
        chai
        .request(server)
        .get(url)
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(200);
            Object.keys(res.body).length.should.be.eql(2);
            res.body.notifications.length.should.be.eql(generatedNotificationIds.length);
            done();
        });
    });

    it('AA_07 create notification - wrong user id - 404', (done) => {
        let notification = {
            title: 'Seas du notification 3',
            type: 'warning',
            description: 'i bin a suppa notification3'
        };

        chai
        .request(server)
        .post(`${usersUrl}/12312312sdasdas/notifications`)
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(404);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_07 create notification - wrong property name - 400', (done) => {
        let notification = {
            titels: 'Seas du notification 3',
            type: 'warning',
            description: 'i bin a suppa notification3'
        };

        chai
        .request(server)
        .post(notificationMainUserURL)
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(400);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_08 create notification - required property - 400', (done) => {
        let notification = {
            type: 'warning',
            description: 'i bin a suppa notification3'
        };

        chai
        .request(server)
        .post(notificationMainUserURL)
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(400);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_09 create notification - empty notification - 400', (done) => {
        let notification = { };

        chai
        .request(server)
        .post(notificationMainUserURL)
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(400);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_10 create notification - too many properties - 400', (done) => {
        let notification = {
            title: 'Seas du notification 2',
            type: 'error',
            description: 'i bin a suppa notification',
            contentReference: 'https://seas.at',
            from: 'user1'
        };

        chai
        .request(server)
        .post(notificationMainUserURL)
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(400);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_11 create notification - empty title - 400', (done) => {
        let notification = {
            title: '',
            type: 'error',
            description: 'i bin a suppa notification',
            contentReference: 'https://seas.at',
            from: 'user1'
        };

        chai
        .request(server)
        .post(notificationMainUserURL)
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(400);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_12 GET two notifications - 200', (done) => {
        chai
        .request(server)
        .get(url + '?count=2')
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(200);
            Object.keys(res.body).should.be.a('array');
            res.body.notifications.length.should.be.eql(2);
            done();
        });
    });

    it('AA_12.1 GET unread notification count - 200', (done) => {
        chai
        .request(server)
        .get(url + '/unread')
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.eql(generatedNotificationIds.length);
            done();
        });
    });

    it('AA_13 PATCH read notification - 200', (done) => {
        chai
        .request(server)
        .patch(url + '/read/' + generatedNotificationIds[0])
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });

    it('AA_14 GET all unread notifications - 200', (done) => {
        chai
        .request(server)
        .get(url + '?onlyUnread=true')
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(200);
            Object.keys(res.body).should.be.a('array');
            res.body.notifications.length.should.be.eql(generatedNotificationIds.length - 1);
            done();
        });
    });

    it('AA_14.1 GET unread notification count after reading one - 200', (done) => {
        chai
        .request(server)
        .get(url + '/unread')
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.eql(generatedNotificationIds.length - 1);
            done();
        });
    });

    it('AA_13 PATCH read all notification - 204', (done) => {
        chai
        .request(server)
        .patch(url + '/readAll')
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(204);
            done();
        });
    });

    it('AA_14.1 GET unread notification count after read all - 200', (done) => {
        chai
        .request(server)
        .get(url + '/unread')
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.eql(0);
            done();
        });
    });

    it('AA_13 GET all notifications - 400', (done) => {
        chai
        .request(server)
        .get(url + '?count=test')
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(400);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_14 GET first notification with userId - 200', (done) => {
        chai
        .request(server)
        .get(notificationMainUserURL + '/' + generatedNotificationIds[0])
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(200);
            Object.keys(res.body).length.should.eql(6);

            res.body.should.have.property('_id').not.to.be.null;
            res.body.should.have.property('title').not.to.be.null;
            res.body.should.have.property('type').not.to.be.null;
            res.body.should.have.property('contentReference').not.to.be.null;
            res.body.should.have.property('read').eql(true);
            res.body.should.have.property('timestamp').not.to.be.null;

            res.body.should.not.have.property('description');

            done();
        });
    });

    it('AA_15 GET first notification without user id - 200', (done) => {
        chai
        .request(server)
        .get(url + '/' + generatedNotificationIds[0])
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(200);
            Object.keys(res.body).length.should.eql(6);

            res.body.should.have.property('_id').not.to.be.null;
            res.body.should.have.property('title').not.to.be.null;
            res.body.should.have.property('type').not.to.be.null;
            res.body.should.have.property('contentReference').not.to.be.null;
            res.body.should.have.property('read').eql(true);
            res.body.should.have.property('timestamp').not.to.be.null;

            res.body.should.not.have.property('description');

            done();
        });
    });

    it('AA_16 GET second notification - 200', (done) => {
        chai
        .request(server)
        .get(notificationMainUserURL + '/' + generatedNotificationIds[1])
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(200);
            Object.keys(res.body).length.should.eql(7);

            res.body.should.have.property('_id').not.to.be.null;
            res.body.should.have.property('title').not.to.be.null;
            res.body.should.have.property('type').not.to.be.null;
            res.body.should.have.property('read').eql(true);
            res.body.should.have.property('timestamp').not.to.be.null;
            res.body.should.have.property('description').not.to.be.null;
            res.body.should.have.property('contentReference').not.to.be.null;

            done();
        });
    });

    it('AA_17 GET notification - wrong id - 400', (done) => {
        chai
        .request(server)
        .get(notificationMainUserURL + '/asdas213123sad')
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(400);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_18 GET notification - wrong user (unauthorized) - 401', (done) => {
        chai
        .request(server)
        .get(notificationMainUserURL + '/' + generatedNotificationIds[1])
        .set('Authorization', 'Bearer ' + secondUserToken)
        .end((err, res) => {
            res.should.have.status(401);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_19 PATCH update first notification - 200', (done) => {
        let notification = {
            title: 'updated',
            type: 'info',
            description: 'edited',
            contentReference: {
                type: 'url',
                content: 'https://enderlon.net'
            }
        };

        chai
        .request(server)
        .patch(url + '/' + generatedNotificationIds[0])
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('title').eql(notification.title);
            res.body.should.have.property('type').eql(notification.type);
            res.body.should.have.property('description').eql(notification.description);
            res.body.should.have.property('contentReference').eql(notification.contentReference);
            done();
        });
    });

    it('AA_20 PATCH update first notification - not allowed properties - 400', (done) => {
        let notification = {
            timestamp: 'test'
        };

        chai
        .request(server)
        .patch(url + '/' + generatedNotificationIds[0])
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(400);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_21 PATCH update first notification - wrong properties - 400', (done) => {
        let notification = {
            tittlee: 'test'
        };

        chai
        .request(server)
        .patch(url + '/' + generatedNotificationIds[0])
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(400);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_22 PATCH update first notification - wrong type value - 400', (done) => {
        let notification = {
            type: 'fehler'
        };

        chai
        .request(server)
        .patch(url + '/' + generatedNotificationIds[0])
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(400);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_23 PATCH update notification - wrong id - 404', (done) => {
        let notification = {
            type: 'fehler'
        };

        chai
        .request(server)
        .patch(url + '/' + mainUserId)
        .set('Authorization', 'Bearer ' + mainUserToken)
        .send(notification)
        .end((err, res) => {
            res.should.have.status(404);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_24 DELETE first notification - 204', (done) => {
    chai
      .request(server)
      .delete(url + '/' + generatedNotificationIds[0])
      .set('Authorization', 'Bearer ' + mainUserToken)
      .end((err, res) => {
            res.should.have.status(204);
            done();
            notificationDeletedId = generatedNotificationIds[0];
            generatedNotificationIds = generatedNotificationIds.filter(
                (x) => x != generatedNotificationIds[0]
            );
        });
    });

    it('AA_25 GET deleted notification - 404', (done) => {
        chai
        .request(server)
        .get(url + '/' + notificationDeletedId)
        .set('Authorization', 'Bearer ' + mainUserToken)
        .end((err, res) => {
            res.should.have.status(404);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_26 DELETE notification - wrong id - 404', (done) => {
    chai
      .request(server)
      .delete(url + '/' + mainUserToken)
      .set('Authorization', 'Bearer ' + mainUserToken)
      .end((err, res) => {
            res.should.have.status(404);
            checkErrorResponse(res);
            done();
        });
    });

    it('AA_27 DELETE all notification - 204', (done) => {
    chai
      .request(server)
      .delete(url + '/deleteAll')
      .set('Authorization', 'Bearer ' + mainUserToken)
      .end((err, res) => {
            res.should.have.status(204);
            done();
            generatedNotificationIds = [];
        });
    });

    it('AA_28 GET all notifications after deleteAll - 200', (done) => {
        chai
        .request(server)
        .get(url)
        .set('Authorization', 'Bearer ' + mainUserToken)
            .end((err, res) => {
            debugger
            res.should.have.status(200);
            Object.keys(res.body).length.should.be.eql(2);
            res.body.notifications.length.should.be.eql(generatedNotificationIds.length);
            done();
        });
    });
});
