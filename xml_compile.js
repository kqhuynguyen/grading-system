let DataFolder=__dirname+'/Data';
let PrefixOfResultFile='result';
let PrefixOfInputFile='input';
let PrefixOfOutputFile='outputX';
let StudentOutputFile='output.txt';
let childprocess=require('child_process');
let copyandmove=require('./copymove.js');
let LecturerFolder=__dirname+'/Lecturer';
let TopicFile=LecturerFolder+'/'+'Topic.csv';
let LibStdFile='libstdc++-6.dll';
let fs=require('fs');
module.exports = {
    readXmlAndCompile: function(id,numtopic,timesSubmit, onsuccess) {
        let fs = require('fs');
        let xmlReader = require('xml2js');
        let xmlParser = new xmlReader.Parser();
        let sourceCpp = __dirname + '/Data/' + id +'/topic'+numtopic+'/submit' + timesSubmit + '/';
        let builddir=sourceCpp+'build';
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
              childprocess.exec('g++ ' + strSumFile, { cwd: sourceCpp }, (error, stdout, stderr) => {
                  if (error) {
                      onsuccess(error, null);
                  } else {
                      console.log(stdout);
                      console.log('Read xml file successfully !');
                      copyandmove.moveFile(sourceCpp+'/'+id+'.exe',builddir+'/'+id+'.exe',function(){
                        onsuccess(null, '1');
                      })
                    }
                });
            });
        });
    },
    // runExeFile: function(id,numtopic,times_submit,numtestcase) {
    //     let db=require('./testdatabase.js');
    //     let sourceCpp = __dirname + '/Data/' + id +'/topic'+numtopic+ '/submit' + times_submit + '/build';
    //     setTimeout(function() {
    //     }, 3000);
    //      try{
    //      childprocess.execSync(id+'.exe',{cwd:sourceCpp+'/'});
    //      }catch(err){
    //        if(err) console.log(err);
    //      }
    //      if(fs.existsSync(sourceCpp+'/'+StudentOutputFile)){
    //        fs.renameSync(sourceCpp+'/'+StudentOutputFile,sourceCpp+'/output'+numtestcase+'.txt');
    //
    //      }
    //   },
    runExeFile: function(id,numtopic,times_submit,numtestcase,nowtime) {
        let db=require('./testdatabase.js');
        let sourceCpp = __dirname + '/Data/' + id +'/topic'+numtopic+ '/submit' + times_submit + '/build/testcase'+numtestcase;
        let folderbuild=DataFolder+'/'+id+'/topic'+numtopic+'/submit'+times_submit+'/build';
        setTimeout(function() {
            childprocess.exec('taskkill /F /IM '+id+'.exe',{},function(err,stdout,stderr){
            if(err) console.log('Run file successfully !');
            else{
                let typeError='Stack overflow_____Stack overflow !';
                let historyFile=__dirname + '/Data/' + id +'/topic'+numtopic+'/history.csv';
                db.noteError(id,numtopic,times_submit,typeError,function(){});
                db.editCellInData(nowtime,historyFile,'2','Stack overflow',function(){});
             }
            });
        }, 3000);
           childprocess.exec(folderbuild+'/'+id+'.exe',{cwd:sourceCpp},function(err,stdout,stderr){
           if(fs.existsSync(sourceCpp+'/'+StudentOutputFile)){
             fs.renameSync(sourceCpp+'/'+StudentOutputFile,sourceCpp+'/output'+numtestcase+'.txt');
            }
         });
        },
      grading: function(id,numtopic,times_submit,filecheckpoint,numtestcase) {
        // checkpoint exe compare lec and stu output to get score
        let db=require('./testdatabase.js');

        let checkPoint = __dirname+'/CheckPoint/'+filecheckpoint+'.exe';
          // lecturer output
        let lecturerOutput = DataFolder +'/'+ id +'/topic'+numtopic+'/submit' + times_submit + '/build/'+PrefixOfResultFile + numtestcase + '.txt';
          // student output
        let studentOutput = DataFolder +'/'+ id +'/topic'+numtopic+'/submit' + times_submit + '/build/testcase'+numtestcase+'/output'+numtestcase+'.txt';

        let builddir=DataFolder +'/'+ id +'/topic'+numtopic+'/submit' + times_submit + '/build';

        let point='';
         try{
          childprocess.execSync(checkPoint + ' ' + lecturerOutput + ' ' + studentOutput+' >pointtemp'+numtestcase+'.txt',{cwd:builddir});
          } catch(err){
          return '0';}
          point=fs.readFileSync(builddir+'/pointtemp'+numtestcase+'.txt');
          return point;
      },
}
