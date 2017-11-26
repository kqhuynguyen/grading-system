const express = require("express");
const app = express();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const fs = require("fs");
const dataobj = require("./testdatabase.js");
const exec = require('child_process').execFile;
// server created from Express's requests handler
const server = require('http').createServer(app);
// socket io initialization
const io = require('socket.io')(server);
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
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
})
app.use(sessionMiddleware);

// set the static folder for public resources
app.use(express.static("public"));

// set view engine
app.set("view engine", "ejs");
app.set("views", "./views");
app.post("/submitfile", multipartMiddleware, function (req, res, next) {
    var file = req.files.file;
    var originalFilename = file.name;
    var pathUpload = __dirname + "/Data/" + originalFilename.split('.')[0] + "/" + originalFilename;
    fs.readFile(file.path, function (err, data) {
        if (!err) {
            fs.writeFile(pathUpload, data, function () {
              let db=require('./testdatabase.js');
              db.unzipFileSubmit(originalFilename.split('.')[0],function(err,suc){
              if(err) console.log('Loi compiler: '+err);
              });
            });
        } else console.log(err);
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
    let cookies = cookie.parse(socket.handshake.headers.cookie);
    if (cookies['sid']) {
        jwt.verify(cookies['token'], jwtSecret, (err, decoded) => {
            if (err) {
                return console.log(err);
            }
            socket.emit("already_authenticated", {
                username: decoded.username
            });
        });
    }
    socket.on("login", function (data) {
        dataobj.checkLoginCSV(data.username, data.password)
            .then(result => {
                // store the username in the session
                let payload = {
                    username: data.username
                }
                // sign jwt token asynchronously
                jwt.sign(payload, jwtSecret, (err, token) => {
                    let sid = socket.request.session.id;
                    // store the session id and the token in the session store
                    sessionStore.set(sid, token, (err) => {
                        if (err) {
                            return console.log(err);
                        }
                        // send back the token to the client
                        socket.emit("login_success", {
                            sid,
                            token
                        });
                    });
                });
            }, error => {
                socket.emit("login_fail", "login_fail");
                console.log(error);
            });
    });
    socket.on("wait_for_point", function (id) {
        let id_pathfile = __dirname + "/Data/" + id + "/output.txt";
        fs.readFile(id_pathfile, function (err, data) {
            if (err) console.log(err);
            else {
                socket.emit("get_point", data.toString('utf8'));
                fs.unlink(id_pathfile);
            }
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
    socket.on("logout", function(data) {
        console.log('shit');
    })
});
