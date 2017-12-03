const express = require("express");
const app = express();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const fse = require("fs-extra");
const path = require('path');
const dataobj = require("./testdatabase.js");
// server created from Express's requests handler
const server = require('http').createServer(app);
// socket io initialization
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
// session for login
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const sessionStore = new FileStore({
    secret: 'Glory to the State'
});
// cookie parser
const cookie = require('cookie');
// JSON web token for authentication
const jwt = require('jsonwebtoken');
const jwtSecret = 'A Song of Ice And Fire';
// session
const sessionMiddleware = session({
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    secret: 'Glory to the State'
});
// extract-zip
const extract = require('extract-zip');
// xml builder
const xml2js = require('xml2js');
// helper for resurively go through each directory
const walk = require('walk');
// child process
const {
    exec,
    execFile,
    spawn,
} = require('child_process');
// async
const async = require('async');
let LecturerFolder = __dirname + '/Lecturer';
let TopicFile = LecturerFolder + '/' + 'Topic.csv';
let TopicFolder = __dirname + '/Topic';
let DataFolder = __dirname + '/Data';
let PrefixOfHistotySubmitFile = 'history';
let linereader = require('line-reader');
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
})
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json())
app.use(sessionMiddleware);
// set the static folder for public resources
app.use(express.static("public"));

// set view engine
app.set("view engine", "ejs");
app.set("views", "./views");


app.post("/submitfile", multipartMiddleware, function (req, res, next) {
    let file = req.files.file;
    let nowuser = req.body.idnowuser.split(' ')[2];
    let numtopic = req.body.nowtopic;

    if (!fse.existsSync(`./Data/${nowuser}`)) {
        fse.mkdirSync(`./Data/${nowuser}`);
    }
    if (!fse.existsSync(`./Data/${nowuser}/topic${numtopic}`)) {
        fse.mkdirSync(`./Data/${nowuser}/topic${numtopic}`);
    }
    // generate the index of submit
    dataobj.GetTimesSubmitOfStudent(nowuser, numtopic, function (times_submit) {
        let submitName = 'submit' + (Number(times_submit) + 1);
        let extractDir = path.join(__dirname, './Data/', nowuser, '/topic' + numtopic, submitName);

        // extract the uploaded file
        extract(req.files.file.path, {
            dir: extractDir
        }, (err) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }

            // build an xml to describe the project's structure
            let xmlObject = {
                header_files: [],
                source_files: [],
                main: null
            }
            // walk through each file and build an object that represents the xml
            let walker = walk.walk(extractDir, {
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
                // write to project.xml
                fse.writeFile(path.join(extractDir, 'project.xml'), xml, 'utf-8', (err) => {
                    if (err) {
                        console.log(err);
                        res.status(400).send();
                    }


                    // xml built. Now we compile the application 
                    fse.mkdirSync(`${extractDir}/build`);
                    /* THIS IS WHERE WE SPAWN A CHILD PROCESS */
                    exec(`g++ ${xmlObject.source_files.join(' ')} ${xmlObject.main} -o build/${nowuser}`, {
                        cwd: extractDir
                    }, (err, stdout, stderr) => {
                        if (err) {
                            console.log(err);
                            return res.status(400).send();
                        }

                        // app compiled. Now for the time being, we generate test cases
                        fse.readJSON(`./Testcase/SetTestcase${numtopic}.json`)
                            .then((data) => {
                                let createTestCasePath = path.join('CreateTestcase', 'createtestcase1.exe');
                                let runTestCasePath = path.join('RunTestcase', 'runtestcase1.exe');
                                async.eachOf(data, (item, index, cb) => {
                                    let inputPath = path.join(extractDir, `input${index + 1}.txt`);
                                    let outputPath = path.join(extractDir, `output${index + 1}.txt`);
                                    exec(`${createTestCasePath} ${item.num} > ${inputPath} && ${runTestCasePath} < ${inputPath} > ${outputPath}`, {
                                            cwd: __dirname
                                        },
                                        (err, stdout, stderr) => {
                                            if (err) {
                                                return cb(err);
                                            }
                                            cb();
                                        });
                                }, (err) => {
                                    if (err) {
                                        console.log(err);
                                        res.status(400).send();
                                    }
                                    
                                    // Test cases built. Now we run the student's program and get their output
                                    
                                    res.send();
                                })
                            })
                            .catch((e) => {
                                console.log(e);
                                res.status(400).send();
                            })
                    });
                });
            });
        });
    });
});
app.get("/", function (req, res) {
    res.render("homepage");
    // if an user is available in the session
});

// start the server
server.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
io.on("connection", function (socket) {
    console.log("Connection found: " + socket.id);

    if (socket.handshake.headers.cookie) {
        let cookies = cookie.parse(socket.handshake.headers.cookie);
        // check if the token exists in the cookie
        if (cookies['auth']) {
            // verify that is it a valid token
            jwt.verify(cookies['auth'], jwtSecret, (err, decoded) => {
                if (err) {
                    return console.log(err);
                }
                // tell the user that they are already authenticated
                socket.emit("already_authenticated", {
                    username: decoded.username
                });
            });
        }
    }

    socket.on("login", function (data) {
        dataobj.checkLoginCSV(data.username, data.password)
            .then(result => {
                let session = socket.request.session;
                // get the session's id
                let sid = session.id;
                // store the username in the session
                let payload = {
                    username: data.username,
                }
                // sign jwt token asynchronously
                jwt.sign(payload, jwtSecret, (err, token) => {
                    // regenerate the session
                    session.regenerate((err) => {
                        console.log(err);
                        // store the session id and the token in the session store
                        sessionStore.set(sid, token, (err) => {
                            if (err) return console.log(err);
                            socket.emit('login_success', token)
                        });
                    });

                });
            }, error => {
                socket.emit("login_fail", "login_fail");
                console.log(error);
            });
    });
    socket.on("wait_for_point", function (infosubmit) {
        let db = require('./testdatabase.js');
        db.getListWeightOfTopic(infosubmit[1], function (arrnum, arrweight) {
            db.getFileResult(infosubmit[0], infosubmit[1], arrnum, function (SetResult) {
                socket.emit("your_result", SetResult);
            });
        });
    });
    socket.on("signup", function (data) {
        let addNewLine = require('./testdatabase.js');
        addNewLine.checkAccountExistence(data[0], function (exist) {
            console.log(exist);
            if (exist) socket.emit('Exist this account', data[0]);
            else {
                let new_line_account = data[0] + ',' + data[2] + ',' + data[1] + '\r\n';
                addNewLine.addNewAccount(new_line_account);
                socket.emit("signup_successfully", data[0])
            }
        });
    });
    socket.on("logout", function (data) {
        // get the session cookies
        let cookies = cookie.parse(socket.handshake.headers.cookie);
        // remove the session on the server's side
        sessionStore.destroy(cookies['sid'], err => {
            if (err) {
                return console.log(err);
            }
            // destroy the session on the client's side
            socket.request.session.destroy();
            console.log('logged out');
        });
    });
    socket.on("Choose_Topic", function (numtopic) {
        dataobj.getCellInData(numtopic, TopicFile, 1, function (nametopic) {
            let contentTopic = fse.readFileSync(TopicFolder + '/' + nametopic + '.txt', 'utf8');
            socket.emit("Your_Topic", contentTopic);
        });
    });
    socket.on("get_history_table", function (data) {
        let filehistory = DataFolder + '/' + data[0] + '/topic' + data[1] + '/' + PrefixOfHistotySubmitFile + '.csv';
        let historyTable = [];
        linereader.eachLine(filehistory, function (line, last) {
            let separate = line.split(',');
            historyTable.push(separate);
            if (last) {
                socket.emit('Your_history_table', historyTable);
            }
        });
    });
});

module.exports = server;