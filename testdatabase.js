let PrefixOfInputFile='input';
let PrefixOfResultFile='result';
let PrefixOfOutputFile='output';
let PrefixOfHistotySubmitFile='history';
let PrefixOfTopicFile='Topic';
let PrefixOfRankTopicFile='rank';
let StudentInputFile='input.txt';
let DataStudentFolder=__dirname+'/DataStudent';
let DataStudentFile=DataStudentFolder+'/Danhsachsinhvien.csv';
let SumaryPointFolder=__dirname+'/SumaryPoint';
let DataFolder=__dirname+'/Data';
let PublicFolder=__dirname+'/public';
let TempFolderExecute=__dirname+'/Data/execute_exe';
let CreateTestcaseFolder=__dirname+'/CreateTestcase';
let RunTestcaseFolder=__dirname+'/RunTestcase';
let CheckPointFolder=__dirname+'/CheckPoint';
let LecturerFolder=__dirname+'/Lecturer';
let TestcaseFolder=__dirname+'/Testcase';
let StudentOutputFile='output.txt';
let StudentErrorFile='error.txt';
let AccountFile=DataStudentFolder+'/'+'Account.csv';
let XmlFile='project.xml';
let TopicFile=LecturerFolder+'/'+'Topic.csv';
let LibStdFile='libstdc++-6.dll';
let fs=require('fs');
let linereader=require('line-reader');
let copyandmove=require('./copymove.js');
let childprocess=require('child_process');
let extract = require('extract-zip');
let xmlcompile=require('./xml_compile.js');
let xmlbuild = require('xmlbuilder');
let datetime=require('node-datetime');
function return_timesubmit(timesSubmit) {
    return timesSubmit;
}
function getTimesSubmitOfStudent(username,numtopic,onsuccess) {
    let fileData =SumaryPointFolder+'/Topic'+numtopic+'.csv';
    linereader.eachLine(fileData, function(line, last) {
        let seperate = line.split(',');
        if (seperate[0] == username) onsuccess(seperate[1]);
    });
}
function editOneCell(id, source, collum, newcell, success) {
    let filedata = '';
    linereader.eachLine(source, function(line, last) {
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
            let fileData =AccountFile;
            linereader.eachLine(fileData, function(line, last) {
                if (line.split(',')[0] == username) {
                    if (line.split(',')[1] == password) {
                        return resolve(line);
                    } else return reject("Wrong password");
                }
                if (last) return reject("Wrong username");
            });
        });
    },
    waitForSecond: function(ms) {
        let start = new Date().getTime();
        let end = start;
        while (end < start + ms) {
            end = new Date().getTime();
        }
    },
    GetTimesSubmitOfStudent: function(username,numtopic, onsuccess) {
        getTimesSubmitOfStudent(username,numtopic,function(times_submit) {
            onsuccess(times_submit);
        });
    },
    addNewAccount: function(data) {
        let account_source =AccountFile;
        fs.appendFile(account_source, data, function(err, success) {
            if (err) console.log(err);
        });
    },
    checkAccountExistence: function(data, exist) {
        let file_data =AccountFile;
        linereader.eachLine(file_data, function(line, last) {
            let seperate = line.split(',');
            if (seperate[0] == data) exist(seperate[0]);
            if (last) {
                if (seperate[0] == data) exist(seperate[0]);
                else exist(null);
            }
        });
    },
    editCellInData: function(id, source, collum, newcell, onsuccess) {
        editOneCell(id, source, collum, newcell, function(filedata) {
            fs.writeFile(source, filedata, function(err) {
                if (err) console.log(err);
                else onsuccess();
            });
        });
    },

    copyandrename: function(sourcefolderold, oldname,sourcefoldernew,newname) {
        let data=fs.readFileSync(sourcefolderold+'/'+oldname);
        fs.writeFileSync(sourcefoldernew+'/'+newname,data,'utf8');
    },
    // copyandrename: function(sourcefolder, oldname,newname,success) {
    //     let data=fs.readFileSync(sourcefolder+'/'+oldname);
    //     fs.writeFile(sourcefolder+'/'+newname,data,'utf8',function(){
    //       success();
    //     });
    // },
    getCellInData: function(id, source, collum, onsuccess) {
        linereader.eachLine(source, function(line, last) {
            let separate = line.split(',');
            if (separate[0] == id) { onsuccess(separate[Number(collum)]); }
        });
    },

    editNameAfterUnzip:function(temp,source,onsuccess){
      fs.readdir(temp,function(err,files){
          copyandmove.moveFile(temp+'/'+files[0],source,function(){
            onsuccess();
          });
      });
    },
    creatfolderforStudent:function(source){
      linereader.eachLine(source,function(line,last){
      let separate=line.split(',');
      if(separate[0]!='Id'){
          fs.mkdirSync(DataFolder+'/'+separate[0]);
          fs.mkdirSync(DataFolder+'/'+separate[0]+'/temp');
          fs.writeFile(DataFolder+'/'+separate[0]+'/demo.txt','Student :'+separate[0],function(err){
          if(err) console.log(err);
          });
        }
      });
    },
    getListWeightOfTopic:function(numtopic,onsuccess){
        let db=require('./testdatabase.js');
        db.getCellInData(numtopic,TopicFile,'2',function(filetestcase){
          let arrnum=[];let arrweight=[];
          linereader.eachLine(TestcaseFolder+'/'+filetestcase+'.txt',function(line,last){
            let separate1=line.split(' ');
            for(let i = 0;i<separate1.length;++i){
            let separate2=separate1[i].split(':');
            arrnum.push(separate2[0]);arrweight.push(separate2[1]);
              }
            if(last) onsuccess(arrnum,arrweight);
          });
        });
    },
    prepareTestcase:function(id,now_submit,nowtopic,success){
       let db=require('./testdatabase.js');
       let builddir=DataFolder+'/'+id+'/topic'+nowtopic+'/submit'+now_submit+'/build';
       fs.mkdirSync(builddir);
       db.getListWeightOfTopic(nowtopic,function(arrnum,arrweight){
         db.getCellInData(nowtopic,TopicFile,'3',function(filecreatetestcase){
            for(let i = 0;i<arrnum.length;++i){
              let numtestcasefile=builddir+'/numtestcase'+(i+1)+'.txt'
              fs.writeFile(numtestcasefile,arrnum[i],function(err){
                if(err) console.log(err);
                childprocess.exec(CreateTestcaseFolder+'/'+filecreatetestcase+'.exe'+' <numtestcase'+(i+1)+'.txt> '+PrefixOfInputFile+(i+1)+'.txt',{cwd:builddir},
              function(err,stdout,stderr){
                if(err)console.log(err);
                else{
                      console.log('CreateTestcase for '+id+' topic '+nowtopic+' Timessubmit '+now_submit+' Successfully !');
                      fs.unlinkSync(numtestcasefile);
                      if(i==arrnum.length-1)success(arrnum,arrweight);
                    }
                  });
              });
            }
          });
       });
    },
    runTestcase:function(id,numtopic,now_submit,arrnum,success){
      let db=require('./testdatabase.js');
      db.getCellInData(numtopic,TopicFile,4,function(nameruntestcasefile){
        RunTestcaseFolder=__dirname+'/RunTestcase';
        let runtestcasefile=RunTestcaseFolder+'/'+nameruntestcasefile+'.exe';
        let folderbuild=DataFolder+'/'+id+'/topic'+numtopic+'/submit'+now_submit+'/build';
          for(let i=0;i<arrnum.length;++i){
            childprocess.exec(runtestcasefile+' <'+PrefixOfInputFile+(i+1)+'.txt> '+PrefixOfResultFile+(i+1)+'.txt',{cwd:folderbuild},function(err,stdout,stderr){
              if(err) console.log(err);
              else {if(i==arrnum.length-1) success();}
            });
          }
        });
    },
    createXmlFileFromFolder: function(id,numtopic,onsuccess) {
        let db=require('./testdatabase.js');
        db.GetTimesSubmitOfStudent(id,numtopic,function(times_submit) {
          let desfile = DataFolder+'/'+ id +'/topic'+numtopic+'/submit'+times_submit;
          fs.readdir(desfile, function(err, files) {
            if (err) console.log(err);
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
                let filename =XmlFile;
                fs.writeFile(desfile + '/' + filename, data, function(err) {
                    if (err) console.log(err);
                    else console.log('Create xml file for '+id+' topic '+numtopic+' Timessubmit '+times_submit+' successfully !');
                    onsuccess(times_submit);
                });
            });
        });
    },
    unzipFileSubmit: function(id,numtopic,times_submit,success) {
      let db=require('./testdatabase.js');let now_submit=Number(times_submit)+1;
      let filetopic=SumaryPointFolder+'/Topic'+numtopic+'.csv';
      let newpath =DataFolder+'/'+id+'/topic'+numtopic+'/submit'+now_submit+'.zip';
      let tempfolder =DataFolder+'/'+id+'/topic'+numtopic+'/temp';
      if(!fs.existsSync(tempfolder)) fs.mkdirSync(tempfolder);
        extract(newpath,{ dir: tempfolder}, function(err) {
          if (err) console.log(err);
          else {
          console.log('Extract file for '+id+' topic '+numtopic+' Timessubmit '+times_submit+' successfully !');
          let newfolder=DataFolder+'/'+id+'/topic'+numtopic+'/submit'+now_submit;
          db.editNameAfterUnzip(tempfolder,newfolder, function() {
           let NowTopicFile=SumaryPointFolder+'/Topic'+numtopic+'.csv';
           db.editCellInData(id, NowTopicFile,1, now_submit, function() {
            db.prepareTestcase(id,now_submit,numtopic,function(arrnum,arrweight){
              db.runTestcase(id,numtopic,now_submit,arrnum,function(){
                db.processProject(id,numtopic,arrnum,arrweight,function(point){
                  db.editCellInData(id,filetopic,2,point,function(){
                    let now=datetime.create().format('d-m-Y H:M:S');
                    let fault='None';
                    if(fs.existsSync(newfolder+'/build/'+StudentErrorFile)){
                      fault=fs.readFileSync(newfolder+'/build/'+StudentErrorFile);
                    }
                    let infoTimesSubmit=new Array(now,point,fault);
                    db.AppendFileHistorySubmit(id,numtopic,infoTimesSubmit,function(){
                      success();
                                });
                              });
                            });
                          });
                        });
                      });
                  });
                }
            });
    },
  processProject:function(id,numtopic,arrnum,arrweight,result){
      let db=require('./testdatabase.js');let point=0;
      db.getCellInData(numtopic,TopicFile,5,function(filecheckpoint){
      db.createXmlFileFromFolder(id,numtopic,function(times_submit){
        xmlcompile.readXmlAndCompile(id,numtopic,times_submit,function(error,success){
          if(error) db.noteError(id,numtopic,times_submit,error,function(){result(point);});
          else{
            let sourcefolder=DataFolder+'/'+id+'/topic'+numtopic+'/submit'+times_submit+'/build';
            copyandmove.copyFile(__dirname+'/'+LibStdFile,sourcefolder,function(){
              for(let i=0;i<arrnum.length;++i){
                let temp=i+1;
                fs.mkdirSync(sourcefolder+'/testcase'+temp);
                let newsource=sourcefolder+'/testcase'+temp;
                db.copyandrename(sourcefolder,PrefixOfInputFile+temp+'.txt',newsource,PrefixOfInputFile+'.txt');
              }
              setTimeout(function(){
               for(let i=0;i<arrnum.length;++i){
                 let temp=i+1;
                 let pointoftest=xmlcompile.grading(id,numtopic,times_submit,filecheckpoint,temp);
                 point+=Number(pointoftest)*Number(arrweight[i]);
                 if(i==arrnum.length-1) result(point);
               }
              },1500);
              for(let i=0;i<arrnum.length;++i){
                let temp=i+1;
                xmlcompile.runExeFile(id,numtopic,times_submit,temp);
              }
            });
        }
       });
     });
   });
  },
    noteError:function(id,numtopic,times_submit,error,success){
      let folderbuild=DataFolder+'/'+id+'/topic'+numtopic+'/submit'+times_submit+'/build';
      fs.writeFile(folderbuild+'/'+StudentErrorFile,error,function(err){
       if(err)console.log(err);
       else {
         console.log('Note error for '+id+' topic '+numtopic+' Timessubmit '+times_submit+' successfully !');
         success();
       }
      });
    },
    getFileResult:function(id,numtopic,arrnum,success){
      let db=require('./testdatabase.js');
      db.GetTimesSubmitOfStudent(id,numtopic,function(now_submit) {
      let folderbuild=DataFolder+'/'+id+'/topic'+numtopic+'/submit'+now_submit+'/build';
      let data='';let SetResult=[];
      for(let i=0;i<arrnum.length;++i){
        let result='';let temp=i+1;
        if(fs.existsSync(folderbuild+'/testcase'+temp+'/'+PrefixOfOutputFile+temp+'X.txt')){
          result=fs.readFileSync(folderbuild+'/testcase'+temp+'/'+PrefixOfOutputFile+temp+'X.txt','utf8');
        }
        data+=result+'.';
      }
      SetResult.push(data);
      if(fs.existsSync(folderbuild+'/'+StudentErrorFile)){
        let err=fs.readFileSync(folderbuild+'/'+StudentErrorFile,'utf8');
        SetResult.push(err);
      }else SetResult.push(null);
      let nowtopicfile=SumaryPointFolder+'/Topic'+numtopic+'.csv';
      db.getCellInData(id,nowtopicfile,2,function(point){
        SetResult.push(point);
        success(SetResult);
        });
      });
    },
    AppendFileHistorySubmit:function(id,numtopic,infoTimesSubmit,success){
      let foldernowtopic=DataFolder+'/'+id+'/topic'+numtopic;
      if(!fs.existsSync(foldernowtopic+'/'+PrefixOfHistotySubmitFile+'.csv')){
        let header='Time,Point,Error'+'\r\n';
        fs.writeFileSync(foldernowtopic+'/'+PrefixOfHistotySubmitFile+'.csv',header);
        }
      let historyTopic=foldernowtopic+'/'+PrefixOfHistotySubmitFile+'.csv';
      let newInfoSubmit=infoTimesSubmit[0]+','+infoTimesSubmit[1]+','+infoTimesSubmit[2]+'\r\n';
      fs.appendFile(historyTopic,newInfoSubmit,function(err){
        if(err) console.log(err);
        else {
          console.log('Append file history for '+id+' topic '+numtopic);
        }
      });
    },
    GetaLineInCsvFile:function(id,source,onsuccess){
      linereader.eachLine(source,function(line,last){
        let separate=line.split(',');
        if(separate[0]==id){
          let data=[];
          for(let i=0;i<separate.length;++i){
            data.push(separate[i]);
          }
          onsuccess(data);
        }
      });
    },
    RankTopic:function(numtopic,typerank,typesort,success){
      let db=require('./testdatabase.js');
      let NowTopicFile=SumaryPointFolder+'/'+PrefixOfTopicFile+numtopic+'.csv';
      let numStudent=db.getNowNumStudent(DataStudentFile);
      childprocess.execSync(SumaryPointFolder+'/'+PrefixOfRankTopicFile+'.exe '+PrefixOfTopicFile+numtopic+'.csv '+typerank+' '+typesort+' > rank'+numtopic+'.txt',{cwd:SumaryPointFolder});
    },
    getNowNumStudent:function(source){
      let data=fs.readFileSync(source,'utf8');
      let arr=data.split('\n');
      return arr.length-2;
    },
    getRankTopic:function(numtopic,typerank,typesort,success){
      let db=require('./testdatabase.js');
      if(Number(typerank)>0){
      db.RankTopic(numtopic,typerank,typesort,function(){});
      let NowRankTopicFile=SumaryPointFolder+'/'+PrefixOfRankTopicFile+numtopic+'.txt';
      let rankTable=[];
      linereader.eachLine(NowRankTopicFile,function(line,last){
        let seperate=line.split(',');
        rankTable.push(seperate);
        if(last) success(rankTable);
      });
     }
    }
}



    //let now=datetime.create();
    //let now=datetime.create().format('d-m-Y H:M:S');
  //  console.log(now);
    //console.log(time);
   //let db=require('./testdatabase.js');
   //db.getRankTopic('1',function(){});
   //let numStudent=db.getNowNumStudent(DataStudentFile);
   //console.log('num '+numStudent);
   //db.AppendFileHistorySubmit('1611111','1','ahihi',function(){});
  //     db.GetTimesSubmitOfStudent('1611111',1,function(times_submit){
  //       console.log('times_submit '+times_submit);
  //     })
      //db.prepareTestcase('1611111','1','1',function(){

    //  });
