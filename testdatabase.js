let PrefixOfSetTestcase='SetTestcase';
let PrefixOfSetResult='SetResult';
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
let CheckPointFile="checkpoint2";
let LecturerFolder=__dirname+'/Lecturer';
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
let random=require('random-js')();
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
        db.GetaLineInCsvFile(numtopic,TopicFile,function(lineInfoTopic){
          let arrweight=[];let max_range=Number(lineInfoTopic[3]);
          //let nowtestcase=random.integer(1,max_range);
          let nowtestcase=2;
          console.log("Now Testcase "+nowtestcase);
          linereader.eachLine(CreateTestcaseFolder+'/'+lineInfoTopic[2]+'/'+PrefixOfSetTestcase+nowtestcase+'/'+PrefixOfSetTestcase+'.txt',function(line,last){
            let seperate=line.split(' ');
            for(let i=0;i<seperate.length;++i){
              arrweight.push(seperate[i]);
            }
            if(last) {onsuccess(arrweight,lineInfoTopic,nowtestcase);console.log(arrweight);}
          });
        });
    },
    prepareTestcase:function(id,now_submit,nowtopic,success){
       let db=require('./testdatabase.js');
       let builddir=DataFolder+'/'+id+'/topic'+nowtopic+'/submit'+now_submit+'/build';
       fs.mkdirSync(builddir);
       db.getListWeightOfTopic(nowtopic,function(arrweight,lineInfoTopic,nowtestcase){
         let foldernowtopic=CreateTestcaseFolder+'/'+lineInfoTopic[2]+'/'+PrefixOfSetTestcase+nowtestcase;
         for(let i=0;i<arrweight.length;++i){
           let itemp=i+1;
           let testcasetemp=fs.readFileSync(foldernowtopic+'/'+PrefixOfInputFile+itemp+'.txt');
           fs.writeFileSync(builddir+'/'+PrefixOfInputFile+itemp+'.txt',testcasetemp,'utf8');
         }
         success(arrweight,nowtestcase);
      });
    },
    runTestcase:function(id,numtopic,now_submit,arrweight,nowtestcase,success){
      let db=require('./testdatabase.js');
      let builddir=DataFolder+'/'+id+'/topic'+numtopic+'/submit'+now_submit+'/build';
      db.GetaLineInCsvFile(numtopic,TopicFile,function(lineInfoTopic){
        let foldernowresult=RunTestcaseFolder+'/'+lineInfoTopic[4]+'/'+PrefixOfSetResult+nowtestcase;
        for(let i=0;i<arrweight.length;++i){
          let itemp=i+1;
          let resulttemp=fs.readFileSync(foldernowresult+'/'+PrefixOfResultFile+itemp+'.txt');
          fs.writeFileSync(builddir+'/'+PrefixOfResultFile+itemp+'.txt',resulttemp,'utf8');
        }
        success(arrweight);
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
            db.prepareTestcase(id,now_submit,numtopic,function(arrweight,nowtestcase){
              db.runTestcase(id,numtopic,now_submit,arrweight,nowtestcase,function(arrweight){
                  success(arrweight);
                  let now=datetime.create().format('d-m-Y H:M:S');
                db.processProject(id,numtopic,arrweight,now,function(now,point){
                  console.log('Now: '+now);
                  db.editCellInData(id,filetopic,2,point,function(){});
                  let fault;let shortError;
                    if(fs.existsSync(newfolder+'/build/'+StudentErrorFile)){
                      fault=fs.readFileSync(newfolder+'/build/'+StudentErrorFile);
                      shortError=fault.toString('utf8').split('_____')[0];
                    }
                    else {fault='None';shortError=fault;}
                    let infoTimesSubmit=new Array(now,point,shortError);
                    db.AppendFileHistorySubmit(id,numtopic,infoTimesSubmit,function(){
                              });
                            });
                        });
                    });
                 });
              });
            }
        });
    },
  processProject:function(id,numtopic,arrweight,nowtime,result){
      let db=require('./testdatabase.js');let point=0;
      db.createXmlFileFromFolder(id,numtopic,function(times_submit){
        xmlcompile.readXmlAndCompile(id,numtopic,times_submit,function(error,success){
          if(error) db.noteError(id,numtopic,times_submit,'Error in compile_____'+error,function(){result(nowtime,point);});
          else{
            let sourcefolder=DataFolder+'/'+id+'/topic'+numtopic+'/submit'+times_submit+'/build';
            copyandmove.copyFile(__dirname+'/'+LibStdFile,sourcefolder,function(){
              for(let i=0;i<arrweight.length;++i){
                let temp=i+1;
                fs.mkdirSync(sourcefolder+'/testcase'+temp);
                let newsource=sourcefolder+'/testcase'+temp;
                db.copyandrename(sourcefolder,PrefixOfInputFile+temp+'.txt',newsource,PrefixOfInputFile+'.txt');
              }
              setTimeout(function(){
               for(let i=0;i<arrweight.length;++i){
                 let temp=i+1;
                 let pointoftest=xmlcompile.grading(id,numtopic,times_submit,CheckPointFile,temp);
                 point+=Number(pointoftest)*Number(arrweight[i]);
                 if(i==arrweight.length-1) result(nowtime,point);
               }
              },1500);
              for(let i=0;i<arrweight.length;++i){
                let temp=i+1;
                xmlcompile.runExeFile(id,numtopic,times_submit,temp,nowtime);
              }
            });
        }
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
      let data=[];let SetResult=[];
      for(let i=0;i<arrnum.length;++i){
        let result='';let temp=i+1;
        if(fs.existsSync(folderbuild+'/testcase'+temp+'/'+PrefixOfOutputFile+temp+'X.txt')){
          result=fs.readFileSync(folderbuild+'/testcase'+temp+'/'+PrefixOfOutputFile+temp+'X.txt','utf8');
        }
        data.push(result+'.');
      }
      SetResult.push(data);
      if(fs.existsSync(folderbuild+'/'+StudentErrorFile)){
        let err=fs.readFileSync(folderbuild+'/'+StudentErrorFile,'utf8');
        SetResult.push(err.split('_____')[1]);
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
    // let data=fs.readFileSync(TopicFile,'utf8');
    // let seperate=data.split('\r\n');
    // console.log(seperate.length-2);

    // var a=0;
    // console.log('bd: '+a);
    // function testref(inp,success){
    //   inp=10;
    //   success(inp);
    // }
    // testref(a,function(res){
    //   console.log('ls: '+a);
    // });

    // let arr=[];
    // arr.push('a');arr.push('b');arr.push('c');
    // console.log('Array '+arr);
    // let idx=arr.indexOf('a');
    // arr.splice(idx,1);
    // console.log('Now Array '+arr);
    //if(arr.includes('a')===true) console.log('exist !');
    //if(arr.includes('a')===false) console.log('not exist !');
    //console.log('exist '+arr.includes('a'));


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
