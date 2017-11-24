var express = require("express");
var app = express();
var multipart = require("connect-multiparty");
var multipartMiddleware = multipart();
var fs = require("fs");
var dataobj = require("./testdatabase.js");
var exec = require('child_process').execFile;
// server created from Express's requests handler
var server = require('http').createServer(app);
// socket io initialization
var io = require('socket.io')(server);
const port = process.env.PORT || 3000;
// set the static folder for public resources
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.post("/submitfile", multipartMiddleware, function(req, res, next) {
    var file = req.files.file;
    var originalFilename = file.name;
    var pathUpload = __dirname + "/Data/" + originalFilename.split('.')[0] + "/" + originalFilename;
    fs.readFile(file.path, function(err, data) {
        if (!err) {
            fs.writeFile(pathUpload, data, function() {
                let move_file = require("./copymove.js");
                move_file.moveFile(pathUpload, __dirname + '/Data/execute_exe/' + originalFilename.split('.')[0] + '.cpp', function() {
                    let exe_file = require("./testcompile.js");
                    exe_file.compile_cpp_file(originalFilename.split('.')[0], function() {});
                });
                return;
            });
        } else console.log(err);
    });
});
app.get("/", function(req, res) {
    res.render("homepage");
});

// start the server
server.listen(port, () => {
    console.log(`Server is running on ${port}`);
});


io.on("connection", function(socket) {
    console.log("Connected found: " + socket.id);
    socket.on("login", function(data) {
        dataobj.check_login_csv(data[0], data[1])
            .then(result => { socket.emit("Success_in_login", "Success_in_login"); }, error => {
                socket.emit("Fail_in_login", "Fail_in_login");
                console.log(error);
            });
    });
    socket.on("wait_for_point", function(id) {
        let id_pathfile = __dirname + "/Data/" + id + "/output.txt";
        fs.readFile(id_pathfile, function(err, data) {
            if (err) console.log(err);
            else {
                socket.emit("get_point", data.toString('utf8'));
                fs.unlink(id_pathfile);
            }
        });
    });
    socket.on("signup",function(data){
       let add_new_line=require('./testdatabase.js');
       add_new_line.check_account_existence(data[0],function(exist){
       console.log(exist);
       if(exist) socket.emit('Exist this account',data[0]);
       else {
         let new_line_account=data[0]+','+data[2]+','+data[1]+'\r\n';
         add_new_line.add_new_account(new_line_account);
         socket.emit("signup_successfully",data[0])
      }
    });
  });
});
