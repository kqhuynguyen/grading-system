function return_timesubmit(timesSubmit) {
    return timesSubmit;
}

function getTimesSubmitOfStudent(username, onsuccess) {
    let lineReader = require('line-reader');
    let fileData = __dirname + "/DataStudent/Danhsachsinhvien.csv";
    lineReader.eachLine(fileData, function (line, last) {
        let seperate = line.split(',');
        if (seperate[0] == username) onsuccess(seperate[2]);
    });
}
module.exports = {
    checkLoginCSV: function (username, password) {
        return new Promise((resolve, reject) => {
            let lineReader = require('line-reader');
            let fileData = __dirname + "/DataStudent/Account.csv";
            lineReader.eachLine(fileData, function (line, last) {
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
    waitForSecond: function (ms, afterWait) {
        let start = new Date().getTime();
        let end = start;
        while (end < start + ms) {
            end = new Date().getTime();
        }
        afterWait();
    },
    getTimesSubmitOfStudent: function (username, onsuccess) {
        getTimesSubmitOfStudent(username, function (times_submit) {
            onsuccess(times_submit);
        });
    },
    addNewAccount: function (data) {
        let append = require('fs');
        console.log('in function ' + data);
        let account_source = __dirname + '/DataStudent/Account.csv';
        append.appendFile(account_source, data, function (err, success) {
            if (err) console.log(err);
        });
    },
    checkAccountExistence: function (data, exist) {
        let line_reader = require('line-reader');
        let file_data = __dirname + "/DataStudent/Account.csv";
        line_reader.eachLine(file_data, function (line, last) {
            let seperate = line.split(',');
            if (seperate[0] == data) exist(seperate[0]);
            if (last) {
                if (seperate[0] == data) exist(seperate[0]);
                else exist(null);
            }
        });
    }
}