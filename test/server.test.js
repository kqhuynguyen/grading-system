// get the server for testing
const server = require('./../index');
// csv
const csv = require('csv');

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

// async for multiple requests in parallel
const async = require('async');

// fake user for testing. Also need to add an entry in Topic1.csv and Account.csv
const userId = '__test';
const topic = '1';
const numberOfUser = 3;
// seeder array to store fake users
let seeders = [];

const fse = require('fs-extra');
const path = require('path');
// read the original content of Topic1.csv
let topicPath = path.join(`${__dirname}`, '../SumaryPoint/Topic1.csv');
let originalTopic = fse.readFileSync(topicPath, "utf-8");

for (let i = 0; i < numberOfUser; ++i) {
    seeders.push([`${userId}${i}`, 0, 0]);
}
// note: these routes have yet to implement authentication
describe('POST /submitfile', function () {
    beforeEach(function(done){
        this.timeout(5000);
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
                csv.stringify(seeders, (err, csvString) => {
                    fse.writeFile(topicPath, csvString, (err) => {
                        if (err) {
                            console.log(err);
                            return done(err);
                        }
                        done();
                    })
                });
            })
        })
    });
    after(function(done) {
        this.timeout(20000);
        setTimeout(() => {
            let topicPath = path.join(`${__dirname}`, '../SumaryPoint/Topic1.csv');
            fse.writeFile(topicPath, originalTopic, 'utf-8', (err) => {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                let dataPath = path.join(`${__dirname}`, '../Data/.');
                fse.readdir(dataPath, (err, files) => {
                    if (err) {
                        console.log(err);
                        return done(err);
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
                    }, done)
                })
            });
        },10000)
    });
    // the 200 respond is received whenever the program is run successfully.
    // otherwise a 400 respond is received

    it('Should send a single request and get 200 OK', function (done) {
        // this test should not take longer than 100000
        this.timeout(10000);

        // make a request to the server that succeeds
        chai.request(server)
            .post('/submitfile')
            .field('idnowuser', `Now user: ${userId}0`)
            .field('nowtopic', topic)
            .attach("file", `${__dirname}/resources/submit1.zip`, 'file')
            .then((res) => {
                expect(res).to.have.status(200);
                return fse.readdir(`Data/${userId}0/topic1/submit1`);
            })
            .then((files) => {
                expect(files).to.not.be.null;
                expect(files).to.include.members(['build', 'submit', 'project.xml']);
                return fse.readdir(`Data/${userId}0/topic1/submit1/build`);
            })
            .then((files) => {
                expect(files).to.not.be.null;
                expect(files).to.include.members(['input1.txt', 'input2.txt', 'output1.txt', 'output2.txt', 'studentOutput1.txt', 'studentOutput2.txt', `${userId}0.exe`]);
                return fse.readFile('SumaryPoint/Topic1.csv');
            })
            .then((data) => {
                csv.parse(data, (err, data) => {
                    if (err) {
                        return Promise.reject(err);
                    }
                    let userData = data.find((element) => element[0] === `${userId}0`);
                    expect(userData).to.not.be.null;

                    // the number of submit should be 1
                    expect(userData[1]).to.equal("1");
                    // score should be 10
                    expect(userData[2]).to.equal("0");
                    done();
                });
            })
            .catch(err => {
                done(err);
            });
    });

    // make numberOfUsers requests to ser1ver that succeeds
    it(`Should send ${numberOfUser} requests in parallel and get 200 OK`, function (done) {
        this.timeout(30000);
        let requestsArray = [];
        for (let i = 0; i < numberOfUser; ++i) {
            requestsArray.push(function (callback)  {
                chai.request(server)
                    .post('/submitfile')
                    .field('idnowuser', `Now user: ${userId}${i}`)
                    .field('nowtopic', topic)
                    .attach("file", `${__dirname}/resources/submit1.zip`, 'file')
                    .then((res) => {
                        expect(res).to.have.status(200);
                        return fse.readdir(`Data/${userId}0/topic1/submit1`);
                    })
                    .then((files) => {
                        expect(files).to.not.be.null;
                        expect(files).to.include.members(['build', 'submit', 'project.xml']);
                        return fse.readdir(`Data/${userId}${i}/topic1/submit1/build`);
                    })
                    .then((files) => {
                        expect(files).to.not.be.null;
                        expect(files).to.include.members(['input1.txt', 'input2.txt', 'output1.txt', 'output2.txt', 'studentOutput1.txt', 'studentOutput2.txt', `${userId}${i}.exe`]);
                        return fse.readFile('SumaryPoint/Topic1.csv');
                    })
                    .then((data) => {
                        csv.parse(data, (err, data) => {
                            if (err) {
                                throw error;
                            }
                            expect(data).to.not.be.null;
                            let userData = data.find((element) => element[0] === `${userId}0`);
                            expect(userData).to.not.be.null;
        
                            // the number of submit should be 1
                            expect(userData[1]).to.equal("1");
                            // score should be 10
                            expect(userData[2]).to.equal("0");
                            callback();      
                        });
                    })
                    .catch(err => {
                        callback(err);
                    })
            });
        }

        // numberOfUser requests
        async.parallel(async.reflectAll(requestsArray), (err, results) => {
            for (let result of results) {
                if (result.error) {
                    return done(result.error);
                }
            }
            done();
        });
    });

    // make numberofUser requests in serial
    it(`Should send ${numberOfUser} requests in serial and get 200 OK`, function (done) {
        this.timeout(30000);
        let requestsArray = [];
        for (let i = 0; i < numberOfUser; ++i) {
            requestsArray.push(function (callback)  {
                chai.request(server)
                    .post('/submitfile')
                    .field('idnowuser', `Now user: ${userId}${i}`)
                    .field('nowtopic', topic)
                    .attach("file", `${__dirname}/resources/submit1.zip`, 'file')
                    .then((res) => {
                        expect(res).to.have.status(200);
                        return fse.readdir(`Data/${userId}0/topic1/submit1`);
                    })
                    .then((files) => {
                        expect(files).to.not.be.null;
                        expect(files).to.include.members(['build', 'submit', 'project.xml']);
                        return fse.readdir(`Data/${userId}${i}/topic1/submit1/build`);
                    })
                    .then((files) => {
                        expect(files).to.not.be.null;
                        expect(files).to.include.members(['input1.txt', 'input2.txt', 'output1.txt', 'output2.txt', 'studentOutput1.txt', 'studentOutput2.txt', `${userId}${i}.exe`]);
                        return fse.readFile('SumaryPoint/Topic1.csv');
                    })
                    .then((data) => {
                        csv.parse(data, (err, data) => {
                            if (err) {
                                throw error;
                            }
                            expect(data).to.not.be.null;
                            let userData = data.find((element) => element[0] === `${userId}${i}`);
                            expect(userData).to.not.be.null;
        
                            // the number of submit should be 1
                            expect(userData[1]).to.equal("1");
                            // score should be 10
                            expect(userData[2]).to.equal("0");
                            callback();      
                        });
                    })
                    .catch(err => {
                        callback(err);
                    })
            });
        }

        // numberOfUser requests
        async.series(requestsArray, done);
    });
});