module.exports = {
    readXmlAndCompile: function(id, timesSubmit, onsuccess) {
        let fs = require('fs');
        let xmlReader = require('xml2js');
        let xmlParser = new xmlReader.Parser();
        let sourceCpp = __dirname + '\\Data\\' + id + '\\submit' + timesSubmit + '\\';
        fs.readFile(sourceCpp + 'project.xml', 'utf8', function(err, data) {
            if (err) throw err;
            let strSumFile = '';
            xmlParser.parseString(data, function(err, result) {
                if (err) throw err;
                result.project.header_files.forEach(function(i) {
                    strSumFile += i + ' ';
                });
                result.project.source_files.forEach(function(i) {
                    strSumFile += i + ' ';
                });
                result.project.main.forEach(function(i) { strSumFile += i + ' '; });
                strSumFile += '-o ' + id;
                let childProcess = require('child_process');
                childProcess.exec(
                    'g++ ' + strSumFile, { cwd: sourceCpp }, (error, stdout, stderr) => {
                        if (error) {
                            onsuccess(error, null);
                        } else {
                            console.log(stdout);
                            console.log('Read xml file successfully !');
                            onsuccess(null, '1')
                        }
                    });
            });
        });
    },
    runExeFile: function(id, times_submit, onsuccess) {
        let sourceCpp = __dirname + '\\Data\\' + id + '\\submit' + times_submit + '\\build\\';
        let childProcess = require('child_process');
        setTimeout(function() {
            let newprocess = require('child_process');
            newprocess.exec('taskkill /F /IM ' + id + '.exe', { cwd: sourceCpp }, function(error, stdout, stderr) {
                if (error) console.log('Run file successfully !');
                else {
                    let typeFault = 'Stack overflow !';
                    onsuccess(typeFault, null);
                }
            });
        }, 3000);
        childProcess.exec(id + '.exe', {
            cwd: sourceCpp
        }, (error, stdout, stderr) => {
            if (error) {
                console.log(error);
            }
            console.log(stdout);
            onsuccess(null, '1');
        });
    },

    grading: function(id, times_submit, numtestcase, success) {
        // checkpoint exe compare lec and stu output to get score
        let checkPoint = __dirname + '\\checkPoint.exe';
        // lecturer output
        let lecturerOutput = __dirname + '\\Data\\' + id + '\\submit' + times_submit + '\\build\\result' + numtestcase + '.txt';
        // student output
        let studentOutput = __dirname + '\\Data\\' + id + '\\submit' + times_submit + '\\build\\output.txt';

        let childProcess = require('child_process');
        // COMMAND: checkpoint lecOutput stuOutput
        childProcess.exec(checkPoint + ' ' + lecturerOutput + ' ' + studentOutput, (error, stdout, stderr) => {
            if (error)
                console.log(error);
            console.log(stdout);
            success(stdout);
        });
    },
}