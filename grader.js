'use strict';

const walk = require('walk');
const xml2js = require('xml2js');
const path = require('path');
const fse = require('fs-extra');
const { exec } = require('child_process');
const async = require('async');
const csv = require('csv');
class Grader {
    constructor(userId, topicId, submissionId) {
        this.userId = userId;
        this.topicId = topicId;
        this.submissionId = submissionId;
        this.extractDir = path.join(__dirname, './Data/', userId, '/topic' + topicId, submissionId);
    }


    /**
     * This function build an xml object from the directory and pass it to the callback
     * @param callback function to pass the xml object to
     */
    buildXml(callback) {
        // build an xml to describe the project's structure
        this.xmlObject = {
            header_files: [],
            source_files: [],
            main: null
        }
        let xmlObject = this.xmlObject;
        // walk through each file and build an object that represents the xml
        let walker = walk.walk(this.extractDir, {
            followLinks: false
        });
        walker.on('file', (root, stats, next) => {
            let fileName = stats.name;
            let fullPath = path.join(root, fileName);
            let fileExtension = fileName.split('.').pop();
            if (fileExtension === 'h') {
                xmlObject.header_files.push(fullPath);
            } else if (fileExtension === 'cpp') {
                if (fileName === 'main.cpp') {
                    xmlObject.main = fullPath;
                } else {
                    xmlObject.source_files.push(fullPath);
                }
            }
            next();
        });
        // walk completed and now we build the xmlObject (optional)
        walker.on('end', () => {
            let builder = new xml2js.Builder();
            let xml = builder.buildObject(xmlObject);
            fse.writeFile(path.join(this.extractDir, 'project.xml'), xml, 'utf-8', (err) => {
                if (err) {
                    return callback(err);
                }
                callback();
            });
        });
    }

    /**
     * Save the xml into the default directory
     * @param xmlObject the passed xml object
     * @param callback the callback upon completion
     */
    saveXml (callback) {
        if (!this.xmlObject) {
            return callback("No xml object detected");
        }
        let xmlObject = this.xmlObject;
        fse.mkdirSync(`${this.extractDir}/build`);
        exec(`g++ --std=c++11 ${xmlObject.source_files.join(' ')} ${xmlObject.main} -o build/${this.userId}`, {
            cwd: this.extractDir
        }, (err, stdout, stderr) => {
            if (err) {
                return callback(err);
            }
            callback();
        });
    };

    /**
     * Read test case settings 
     * @param topicId the id of the topic to be read
     * @param callback handle the settings
     */
    readTestcaseSettings(callback) {
        fse.readJSON(`./Testcase/SetTestcase${this.topicId}.json`, (err, data) => {
            if (err) {
                return callback(err);
            }
            this.settings = data;
            callback();
        });
    };

    /**
     * Create test cases based on the test case settings and store them in the build folder
     * @param data the test case settings, including the number of inputs and the weight of each test case
     */
    grade(callback) {
        let settings = this.settings;
        let createTestCasePath = path.join('CreateTestcase', 'createtestcase1.exe');
        let runTestCasePath = path.join('RunTestcase', 'runtestcase1.exe');
        let buildDir = path.join(this.extractDir, 'build');
        this.totalScore = 0;
        let totalScore = this.totalScore;
        async.eachOf(settings, (item, index, cb) => {
                let inputPath = path.join(buildDir, `input${index + 1}.txt`);
                let outputPath = path.join(buildDir, `output${index + 1}.txt`);
                // create the sample output for each of the generated input and store them in /build
                async.waterfall([
                    // Create sample outputs and store them in /build
                    (cb) => {
                        exec(`${createTestCasePath} ${item.num} > ${inputPath} && ${runTestCasePath} < ${inputPath} > ${outputPath}`, {
                                cwd: __dirname
                            },
                            (err, stdout, stderr) => {
                                if (err) {
                                    return cb(err);
                                }
                                cb();
                            });
                    },
                    (cb) => {
                        // Test cases built. Now we run the student's program and get their output
                        exec(`${this.userId}.exe < input${index + 1}.txt > studentOutput${index + 1}.txt`, {
                                cwd: buildDir
                            },
                            (err, stdout, stderr) => {
                                if (err) {
                                    return cb(err);
                                }
                                cb();
                            });
                    },
                    (cb) => {
                        // get total score
                        let checkPointExe = path.join(__dirname, 'CheckPoint', 'checkpoint1.exe');
                        exec(`${checkPointExe} ${buildDir}/output${index + 1}.txt ${buildDir}/studentOutput${index + 1}.txt`, (err, stdout, stderr) => {
                            if (err) {
                                return cb(err);
                            }
                            totalScore += item.weight * Number(stdout);
                            cb();
                        });
                    },

                ], (err) => {
                    if (err) {
                        return cb(err);
                    }
                    cb(err);
                });
            },
            (err) => {
                if (err) {
                    return callback(err);
                }
                callback();
            });
    };

    /**
     * Update the user in the TopicX.csv and Accounts.csv, increasing this user's submission count by 1 and update their last point
     * @param userId the Id of the user
     * @param topicId the id of the topic
     * @param totalScore the score earned for this submission
     */
    updateUser(callback) {
        let totalScore = this.totalScore;
        // update changes to csv
        let accountsDir = path.join(__dirname, 'SumaryPoint', `Topic${this.topicId}.csv`);
        fse.readFile(accountsDir, 'utf-8', (err, data) => {
            csv.parse(data, (err, data) => {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                let userIndex = data.findIndex((element) => element[0] === this.userId);
                data[userIndex][1]++;
                csv.stringify(data, (err, data) => {
                    fse.writeFile(accountsDir, data, 'utf-8', (err, data) => {
                        if (err) {
                            return callback(err);
                        }
                        callback();
                    });
                });

            });
        });
    };
}




module.exports = Grader;