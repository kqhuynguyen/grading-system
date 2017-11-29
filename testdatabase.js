function return_timesubmit(timesSubmit) {
    return timesSubmit;
}

function getTimesSubmitOfStudent(username, onsuccess) {
    let lineReader = require('line-reader');
    let fileData = __dirname + "\\DataStudent\\Danhsachsinhvien.csv";
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
            for (let i = 0; i < arrline.length - 1; ++i) {
                editline += arrline[i] + ',';
            }
            editline += arrline[arrline.length - 1];
            filedata += editline + '\r\n';
        }
        if (last) {
            success(filedata);
        }
    });
}
module.exports = {
    checkLoginCSV: function(username, password) {
        return new Promise((resolve, reject) => {
            let lineReader = require('line-reader');
            let fileData = __dirname + "\\DataStudent\\Account.csv";
            lineReader.eachLine(fileData, function(line, last) {
                if (line.split(',')[0] == username) {
                    if (line.split(',')[1] == password) {
                        return resolve(line);
                    } else return reject("Wrong password");
                }
                if (last) return reject("Wrong username");
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
        let account_source = __dirname + '\\DataStudent\\Account.csv';
        append.appendFile(account_source, data, function(err, success) {
            if (err) console.log(err);
        });
    },
    checkAccountExistence: function(data, exist) {
        let line_reader = require('line-reader');
        let file_data = __dirname + "\\DataStudent\\Account.csv";
        line_reader.eachLine(file_data, function(line, last) {
            let seperate = line.split(',');
            if (seperate[0] == data) exist(seperate[0]);
            if (last) {
                if (seperate[0] == data) exist(seperate[0]);
                else exist(null);
            }
        });
    },
    unzipFileSubmit: function(id, result) {
        let db = require('./testdatabase.js');
        db.GetTimesSubmitOfStudent(id, function(times_submit) {
            let now_submit = Number(times_submit) + 1;
            let rename = require('./copymove.js');
            let oldpath = __dirname + '\\Data\\' + id + '\\' + id + '.zip';
            let newpath = __dirname + '\\Data\\' + id + '\\submit' + now_submit + '.zip';
            let tempfolder = __dirname + '\\Data\\' + id + '\\temp';
            rename.moveFile(oldpath, newpath, function() {
                let extract = require('extract-zip');
                extract(newpath, { dir: tempfolder }, function(err) {
                    if (err) console.log(err);
                    else {
                        console.log('extract file successfully !');
                        let newfolder = __dirname + '\\Data\\' + id + '\\submit' + now_submit;
                        let sourcefile = __dirname + '\\Data\\' + id + '\\submit' + now_submit;
                        db.editNameAfterUnzip(tempfolder, sourcefile, function() {
                            let DataStudent = '.\\DataStudent\\Danhsachsinhvien.csv';
                            db.editCellInData(id, DataStudent, 2, now_submit, function() {
                                db.createXmlFileFromFolder(id, function() {
                                    let fs = require('fs');
                                    let buildFolder = '.\\Data\\' + id + '\\submit' + now_submit + '\\build';
                                    fs.mkdirSync(buildFolder);
                                    let sourceCreatetestcase = '.\\public\\';
                                    rename.copyFile(sourceCreatetestcase + 'createtestcase.exe', buildFolder, function() {
                                        rename.copyFile(sourceCreatetestcase + 'libstdc++-6.dll', buildFolder, function() {
                                            let createtestcase = require('child_process');
                                            createtestcase.exec('createtestcase.exe', { cwd: buildFolder }, function(err, stdout, stderr) {
                                                if (err) console.log(err);
                                                else {
                                                    setTimeout(function() {
                                                        let xmlCompile = require('./xml_compile.js');
                                                        let sumpoint = 0;
                                                        xmlCompile.readXmlAndCompile(id, now_submit, function(error, success) {
                                                            if (error) {
                                                                result(error, null);
                                                                fs.unlinkSync(newfolder + '\\' + id + '.exe');
                                                                fs.writeFile(buildFolder + '\\fault.txt', error, function(err) {
                                                                    if (err) console.log(err);
                                                                });
                                                            } else {
                                                                rename.moveFile(newfolder + '\\' + id + '.exe', newfolder + '\\build\\' + id + '.exe', function() {
                                                                    let tempdir = '.\\Data\\execute_exe';
                                                                    db.copyandrename(buildFolder, 'input1.txt', tempdir, 'input.txt', function() {
                                                                        xmlCompile.runExeFile(id, now_submit, function(err, success) {
                                                                            if (err) {
                                                                                result(err, sumpoint);
                                                                                fs.writeFile(buildFolder + '\\fault.txt', err, function(err2) {
                                                                                    if (err2) console.log(err2);
                                                                                });
                                                                            } else {
                                                                                xmlCompile.grading(id, now_submit, '1', function(point1) {
                                                                                    rename.moveFile(buildFolder + '\\outputX.txt', buildFolder + '\\outputX1.txt', function() {
                                                                                        sumpoint += 0.3 * Number(point1);
                                                                                        db.copyandrename(buildFolder, 'input2.txt', tempdir, 'input.txt', function() {
                                                                                            xmlCompile.runExeFile(id, now_submit, function(err1, success1) {
                                                                                                if (err1) {
                                                                                                    result(err1, sumpoint);
                                                                                                    fs.writeFile(buildFolder + '\\fault.txt', err1, function(err3) {
                                                                                                        if (err3) console.log(err3);
                                                                                                    });
                                                                                                } else {
                                                                                                    xmlCompile.grading(id, now_submit, '2', function(point2) {
                                                                                                        rename.moveFile(buildFolder + '\\outputX.txt', buildFolder + '\\outputX2.txt', function() {
                                                                                                            sumpoint += 0.7 * Number(point2);
                                                                                                            result(null, sumpoint);
                                                                                                        });
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        });
                                                                                    });
                                                                                });
                                                                            }
                                                                        });
                                                                    });
                                                                });
                                                            }

                                                        });
                                                    }, 2000);

                                                    rename.copyFile(sourceCreatetestcase + 'runtestcase.exe', buildFolder, function() {
                                                        let runtestcase = require('child_process');
                                                        runtestcase.exec('runtestcase.exe <input1.txt> result1.txt', { cwd: buildFolder + '\\' }, function(err, stdout, stderr) {
                                                            if (err) console.log(err);
                                                            else {
                                                                runtestcase.exec('runtestcase.exe <input2.txt> result2.txt', { cwd: buildFolder + '\\' }, function(err, stdout, stderr) {
                                                                    if (err) console.log(err);
                                                                    else {

                                                                    }
                                                                });
                                                            }
                                                        });
                                                    });
                                                }
                                            });
                                        });
                                    });
                                });
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
            write.writeFile('.\\DataStudent\\Danhsachsinhvien.csv', filedata, function(err) {
                if (err) console.log(err);
                else onsuccess();
            });
        });
    },
    createXmlFileFromFolder: function(id, onsuccess) {
        let db = require('./testdatabase.js');
        db.GetTimesSubmitOfStudent(id, function(times_submit) {
            let desfile = '.\\Data\\' + id + '\\submit' + times_submit;
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
                let data = xmlfile.toString({
                    pretty: true
                });
                let filename = 'project.xml';
                fs.writeFile(desfile + '\\' + filename, data, function(err) {
                    if (err) console.log(err);
                    onsuccess();
                });
            });
        });
    },
    copyandrename: function(filesource, oldname, tempdir, newname, success) {
        let copymove = require('./copymove.js');
        copymove.copyFile(filesource + '\\' + oldname, tempdir, function() {
            copymove.moveFile(tempdir + '\\' + oldname, filesource + '\\' + newname, function() {
                success();
            });
        });
    },
    getFileResult: function(id, success) {
        let db = require('./testdatabase.js');
        db.GetTimesSubmitOfStudent(id, function(times_submit) {
            let buildFolder = __dirname + "\\Data\\" + id + "\\submit" + times_submit + '\\build';
            let result1;
            let result2;
            let result3;
            let fs = require('fs');
            if (fs.existsSync(buildFolder + '\\outputX1.txt')) {
                result1 = fs.readFileSync(buildFolder + '\\outputX1.txt', 'utf8');
            } else result1 = '';
            if (fs.existsSync(buildFolder + '\\outputX2.txt')) {
                result2 = fs.readFileSync(buildFolder + '\\outputX2.txt', 'utf8');
            } else result2 = '';
            if (fs.existsSync(buildFolder + '\\fault.txt')) {
                result3 = fs.readFileSync(buildFolder + '\\fault.txt', 'utf8');
            } else result3 = '';
            let filedata = '.\\DataStudent\\Danhsachsinhvien.csv';
            db.getCellInData(id, filedata, '3', function(point) {
                success(result1, result2, result3, point);
            });
        });
    },
    getCellInData: function(id, source, collum, onsuccess) {
        let lineread = require('line-reader');
        lineread.eachLine(source, function(line, last) {
            let separate = line.split(',');
            if (separate[0] == id) { onsuccess(separate[Number(collum)]); }
        });
    },
    editNameAfterUnzip: function(temp, source, onsuccess) {
        let fs = require('fs');
        fs.readdir(temp, function(err, files) {
            let copymove = require('./copymove.js');
            copymove.moveFile(temp + '\\' + files[0], source, function() {
                onsuccess();
            });
        });
    }
}