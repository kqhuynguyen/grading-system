// get the server for testing
const server = require('./../index');

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

// async for multiple requests in parallel
const async = require('async');

// fake user for testing. Also need to add an entry in Topic1.csv and Account.csv
const userId = '__test';
const topic = '1';
const numberOfUser = 50;
// seeder array to store fake users
let seeders = [];

const fse = require('fs-extra');
const path = require('path');
// read the original content of Topic1.csv
let topicPath = path.join(`${__dirname}`, '../SumaryPoint/Topic1.csv');
let originalTopic = fse.readFileSync(topicPath, "utf-8");
before((done) => {
    for (let i = 0; i < numberOfUser; ++i) {
        seeders.push(`${userId}${i},0,0`);
    }
    let dataPath = path.join(`${__dirname}`, '../Data/.');    
    fse.readdir(dataPath, (err, files) => {
        if (err) {
            console.log(err);
            done(err);
        }
        let testFiles = files.filter(name => /^\_\_test.+/.test(name));
        async.each(testFiles, (file, callback) => {
            fse.remove(path.join(dataPath, file))
            .then(() => {
                callback();
            })
            .catch((e) => {
                callback(e);
            });
        }, () => {
            fse.appendFile(topicPath, seeders.join('\n') + '\n', 'utf-8', (err) => {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                done();
            });
        })
    })
});
after((done) => {
    let topicPath = path.join(`${__dirname}`, '../SumaryPoint/Topic1.csv');
    fse.writeFile(topicPath, originalTopic, 'utf-8', (err) => {
        if (err) {
            console.log(err);
            done(err);
        }
        let dataPath = path.join(`${__dirname}`, '../Data/.');
        fse.readdir(dataPath, (err, files) => {
            if (err) {
                console.log(err);
                done(err);
            }
            let testFiles = files.filter(name => /^\_\_test.+/.test(name));
            async.each(testFiles, (file, callback) => {
                fse.remove(path.join(dataPath, file))
                .then(() => {
                    callback();
                })
                .catch((e) => {
                    callback(e);
                });
            },done)
        })
    });
});
// note: these routes have yet to implement authentication
describe('POST /submitfile', function () {
    // the 200 respond is received whenever the program is run successfully.
    // otherwise a 400 respond is received

    it('Should send a single request and get 200 OK', function(done) {
        this.timeout(10000);
        chai.request(server)
            .post('/submitfile')
            .field('idnowuser', `Now user: ${userId}0`)
            .field('nowtopic', topic)
            .attach("file", `${__dirname}/resources/submit1.zip`, 'file')
            .then((res) => {
                expect(res).to.have.status(200);
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it(`Should send ${numberOfUser} requests in parallel and get 200 OK`, function(done) {
        this.timeout(30000);
        let requestsArray = [];
        for (let i = 1; i < numberOfUser; ++i) {
            requestsArray.push((callback) => {
                chai.request(server)
                    .post('/submitfile')
                    .field('idnowuser', `Now user: ${userId}${i}`)
                    .field('nowtopic', topic)
                    .attach("file", `${__dirname}/resources/submit1.zip`, 'file')
                    .then((res) => {
                        expect(res).to.have.status(200);
                        callback(null, true);
                    })
                    .catch(err => {
                        callback(err);
                    })
            });
        }
        
        // numberOfUser requests
        async.parallel(requestsArray, (err, results) => {
            if (err) {
                return done(err);
            }
            done();
        });
    });
});