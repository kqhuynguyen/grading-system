function return_timesubmit(timesSubmit) {
    return timesSubmit;
}

function getTimesSubmitOfStudent(username, onsuccess) {
    let lineReader = require('line-reader');
    let fileData = __dirname + "/DataStudent/Danhsachsinhvien.csv";
    lineReader.eachLine(fileData, function(line, last) {
        let seperate = line.split(',');
        if (seperate[0] == username) onsuccess(seperate[2]);
    });
}

function editOneCell(id, source, collum, newcell, success) {
    let filedata = '';
    let lineread = require('line-reader');
    lineread.eachLine(source, function(line, last) {
        let arrline = line.split(',');
        if (arrline[0] != id) filedata += line + '\r\n';
        else {
            arrline[Number(collum)] = newcell;
            let editline = '';
            for (let i = 0; i < arrline.length - 1; ++i) { editline += arrline[i] + ','; }
            editline += arrline[arrline.length - 1];
            filedata += editline + '\r\n';
        }
        if (last) { success(filedata); }
    });
}
module.exports = {
    checkLoginCSV: function(username, password) {
        return new Promise((resolve, reject) => {
            let lineReader = require('line-reader');
            let fileData = __dirname + "/DataStudent/Account.csv";
            lineReader.eachLine(fileData, function(line, last) {
                if (line.split(',')[0] == username) {
                    if (line.split(',')[1] == password) {
                        return resolve(line);
                    } else return reject("Wrong password");
                }
                if (last) {
                    if (line.split(',')[0] == username) {
                        if (line.split(',')[1] == password) {
                            return resolve(line);
                        } else return reject("Wrong password");
                    } else return reject("Wrong username");
                }
            });
        });
    },
    waitForSecond: function(ms, afterWait) {
        let start = new Date().getTime();
        let end = start;
        while (end < start + ms) {
            end = new Date().getTime();
        }
        afterWait();
    },
    GetTimesSubmitOfStudent: function(username, onsuccess) {
        getTimesSubmitOfStudent(username, function(times_submit) {
            onsuccess(times_submit);
        });
    },
    addNewAccount: function(data) {
        let append = require('fs');
        console.log('in function ' + data);
        let account_source = __dirname + '/DataStudent/Account.csv';
        append.appendFile(account_source, data, function(err, success) {
            if (err) console.log(err);
        });
    },
    checkAccountExistence: function(data, exist) {
        let line_reader = require('line-reader');
        let file_data = __dirname + "/DataStudent/Account.csv";
        line_reader.eachLine(file_data, function(line, last) {
            let seperate = line.split(',');
            if (seperate[0] == data) exist(seperate[0]);
            if (last) {
                if (seperate[0] == data) exist(seperate[0]);
                else exist(null);
            }
        });
    },
    unzipFileSubmit:function(id,result){
     let db=require('./testdatabase.js');
     db.GetTimesSubmitOfStudent(id,function(times_submit){
       let now_submit=Number(times_submit)+1;
       let rename=require('./copymove.js');
       let oldpath=__dirname+'/Data/'+id+'/'+id+'.zip';
       let newpath=__dirname+'/Data/'+id+'/submit'+now_submit+'.zip';
       rename.moveFile(oldpath,newpath,function(){
       let extract=require('extract-zip');
       extract(newpath,{dir:__dirname+'/Data/'+id},function(err){
       if(err) console.log(err);
       else {
              console.log('extract file successfully !');
              let old_folder=__dirname+'/Data/'+id+'/submit';
              let newfolder=__dirname+'/Data/'+id+'/submit'+now_submit;
              rename.moveFile(old_folder,newfolder,function(){
              let DataStudent='./DataStudent/Danhsachsinhvien.csv';
              db.editCellInData(id,DataStudent,2,now_submit,function(){
                db.createXmlFileFromFolder(id,function(){
                      let fs=require('fs');
                      let buildFolder='./Data/'+id+'/submit'+now_submit+'/build';
                      fs.mkdirSync(buildFolder);
                      let sourceCreatetestcase='./public/';
                      rename.copyFile(sourceCreatetestcase+'createtestcase.exe',buildFolder,function(){
                         rename.copyFile(sourceCreatetestcase+'libstdc++-6.dll',buildFolder,function(){
                            let createtestcase=require('child_process');
                            createtestcase.exec('createtestcase.exe',{cwd:buildFolder},function(err,stdout,stderr){
                               if(err) console.log(err);
                               else console.log(stdout);
                             });
                          });
                      });
                      let xmlCompile=require('./xml_compile.js');
                      xmlCompile.readXmlAndCompile(id,now_submit,function(error,success){
                        if(error) {result(error,null);fs.unlinkSync(newfolder+'/'+id+'.exe');}
                        else{rename.moveFile(newfolder+'/'+id+'.exe',newfolder+'/build/'+id+'.exe',function(){
                              xmlCompile.runExeFile(id,now_submit,'input1.txt','output1.txt',function(err,success){
                                if(err){
                                  result(err,null);
                                }
                                else {
                                  xmlCompile.runExeFile(id,now_submit,'input2.txt','output2.txt',function(err1,success1){
                                    if(err1) result(err1,null);
                                  });
                                }
                            });
                        });
                    }
                });
            });
        });
    },
    editCellInData: function(id, source, collum, newcell, onsuccess) {
        editOneCell(id, source, collum, newcell, function(filedata) {
            let write = require('fs');
            write.writeFile('./DataStudent/Danhsachsinhvien.csv', filedata, function(err) {
                if (err) console.log(err);
                else onsuccess();
            });
        });
    },
    createXmlFileFromFolder: function(id, onsuccess) {
        let db = require('./testdatabase.js');
        db.GetTimesSubmitOfStudent(id, function(times_submit) {
            let desfile = './Data/' + id + '/submit' + times_submit;
            let fs = require('fs');
            fs.readdir(desfile, function(err, files) {
                if (err) console.log(err);
                let xmlbuild = require('xmlbuilder');
                let xmlfile = xmlbuild.create('project');
                for (let i = 0; i < files.length; ++i) {
                    let separate = files[i].split('.');
                    if (separate[1] == 'h') {
                        xmlfile.ele('header_files').txt(files[i]);
                    } else if (separate[1] == 'cpp' && separate[0] != 'main') {
                        xmlfile.ele('source_files').txt(files[i]);
                    } else if (separate[0] == 'main') {
                        xmlfile.ele('main').txt(files[i]);
                    }
                }
                let data = xmlfile.toString({ pretty: true });
                let filename = 'project.xml';
                fs.writeFile(desfile + '/' + filename, data, function(err) {
                    if (err) console.log(err);
                    onsuccess();
                });
            });
        });
    }
}
