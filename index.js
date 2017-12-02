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
let LecturerFolder=__dirname+'/Lecturer';
let TopicFile=LecturerFolder+'/'+'Topic.csv';
let TopicFolder=__dirname+'/Topic';
let DataFolder=__dirname+'/Data';
let PrefixOfHistotySubmitFile='history';
let linereader=require('line-reader');
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
})
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(sessionMiddleware);
// set the static folder for public resources
app.use(express.static("public"));

// set view engine
app.set("view engine", "ejs");
app.set("views", "./views");
app.post("/submitfile", multipartMiddleware, function (req, res, next) {
    let file = req.files.file;
    let nowuser=req.body.idnowuser.split(' ')[2];
    let numtopic=req.body.nowtopic;
    fs.readFile(file.path, function (err, data) {
      if (!err) {
          if(!fs.existsSync('./Data/'+nowuser)){fs.mkdirSync('./Data/'+nowuser);}
          if(!fs.existsSync('./Data/'+nowuser+'/topic'+numtopic)) {fs.mkdirSync('./Data/'+nowuser+'/topic'+numtopic);}
          dataobj.GetTimesSubmitOfStudent(nowuser,numtopic,function(times_submit){
            console.log(times_submit);
            let originalFilename = 'submit'+(Number(times_submit)+1)+'.zip';
            //console.log(originalFilename);
            let pathUpload ='./Data/' + nowuser + '/topic'+numtopic+'/' + originalFilename;
            fs.writeFile(pathUpload, data, function (err) {
              if(err) console.log(err);
              dataobj.unzipFileSubmit(nowuser,numtopic,times_submit,function(){

                });
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
        let db=require('./testdatabase.js');
        db.getListWeightOfTopic(infosubmit[1],function(arrnum,arrweight){
          db.getFileResult(infosubmit[0],infosubmit[1],arrnum,function(SetResult){
            socket.emit("your_result",SetResult);
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
    socket.on("Choose_Topic",function(numtopic){
      dataobj.getCellInData(numtopic,TopicFile,1,function(nametopic){
        let contentTopic=fs.readFileSync(TopicFolder+'/'+nametopic+'.txt','utf8');
        socket.emit("Your_Topic",contentTopic);
        });
    });
    socket.on("get_history_table",function(data){
      let filehistory=DataFolder+'/'+data[0]+'/topic'+data[1]+'/'+PrefixOfHistotySubmitFile+'.csv';
      let historyTable=[];
      linereader.eachLine(filehistory,function(line,last){
        let separate=line.split(',');
        historyTable.push(separate);
        if(last){
          socket.emit('Your_history_table',historyTable);
        }
      });
    });
});
