module.exports = {
  readXmlAndCompile: function (id, timesSubmit, onsuccess) {
    let fs = require('fs');
    let xmlReader = require('xml2js');
    let xmlParser = new xmlReader.Parser();
    let sourceCpp = __dirname + '/Data/' + id + '/submit' + timesSubmit + '/';
    fs.readFile(sourceCpp + 'project.xml', 'utf8', function (err, data) {
      if (err) throw err;
      let strSumFile = '';
      xmlParser.parseString(data, function (err, result) {
        if (err) throw err;
        result.project.header_files.forEach(function (i) {
          strSumFile += i + ' ';
        });
        result.project.source_files.forEach(function (i) {
          strSumFile += i + ' ';
        });
        result.project.main.forEach(function (i) {
          strSumFile += i + ' ';
        });
        strSumFile += '-o ' + id;
        let childProcess = require('child_process');
        childProcess.exec('g++ ' + strSumFile, {
          cwd: sourceCpp
        }, (error, stdout, stderr) => {
          if (error) {
            onsuccess(error,null);
          }
          else{console.log(stdout);
          console.log("Read xml file successfully !");
          onsuccess(null,'1')
            }
        });
      });
    });
  },
  runExeFile: function (id, times_submit, onsuccess) {
    let sourceCpp = __dirname + '/Data/' + id + '/submit' + times_submit + '/build/';
    let childProcess = require('child_process');
    //setTimeout(function(){

  //  },3000);
    childProcess.exec(id + '.exe', {
      cwd: sourceCpp
    }, (error, stdout, stderr) => {
      if (error) {
        console.log(error);
      }
      console.log(stdout);
      onsuccess();
    });
  }
}
let ps = require('ps-node');

// A simple pid lookup
ps.lookup({ name:'svhosijijt.exe' }, function(err, resultList ) {
    if (err) {
        throw new Error( err );
    }

    let process = resultList[ 0 ];

    if( process ){

        console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
    }
    else {
        console.log( 'No such process found!' );
    }
});
