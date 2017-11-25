module.exports = {
    compileCppFile: function(id, afterCompile) {
        let childProcess = require('child_process');
        let sourceCpp = __dirname + '/Data/execute_exe/';
        let exeName = id;
        let execute;
        childProcess.execFile('g++', [sourceCpp + exeName + '.cpp', '-o', exeName], (error, stdout, stderr) => {
            if (error) {
                console.log(error);
            }
            console.log(stdout);
            setTimeout(function() {
                childProcess.exec('taskkill /F /IM ' + exeName + '.exe', { cwd: sourceCpp }, function(err, stdout, stderr) {
                    if (err) console.log(err);
                    let fs = require('fs');
                    let path = __dirname + '/Data/execute_exe/output.txt';
                    if (fs.existsSync(path)) {
                        moveFile.moveFile(path, __dirname + '/Data/' + exeName + '/output.txt', function() {});
                    }
                    afterCompile();
                });
            }, 3000);
            let moveFile = require('./copymove.js');
            console.log(exeName);
            moveFile.moveFile(__dirname + '/' + exeName + '.exe', __dirname + '/Data/execute_exe/' + exeName + '.exe', function() {
                execute = childProcess.exec(exeName + '.exe', { cwd: sourceCpp }, (error, stdout, stderr) => {
                    if (error) {
                        console.log(error);
                    }
                    console.log(stdout);

                });
            });
        });
    }
}