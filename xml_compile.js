module.exports={
readxml_and_compile:function(id,times_submit,onsuccess){
let fs=require('fs');
let xml_reader=require('xml2js');
let xml_parser=new xml_reader.Parser();
let source_cpp =__dirname+'/Data/'+id+'/submit'+times_submit+'/';
fs.readFile(source_cpp+'project.xml','utf8',function(err,data){
  if(err) throw err;
  let str_sumfile='';
  xml_parser.parseString(data,function(err,result){
    if(err) throw err;
    result.project.header_files.forEach(function(i){
      str_sumfile+=i+' ';
    });
    result.project.source_files.forEach(function(i){
      str_sumfile+=i+' ';
    });
    result.project.main.forEach(function(i){
      str_sumfile+=i+' ';
    });
    str_sumfile+='-o '+id;
    let child_process  = require('child_process');
    child_process.exec('g++ '+str_sumfile,{cwd:source_cpp}, (error, stdout, stderr) => {
    if (error) {
	    console.log(error);
    }
    console.log(stdout);
    console.log("Read xml file successfully !");
    onsuccess();
          });
        });
      });
    },
run_exe_file:function(id,times_submit,onsuccess){
   let source_cpp =__dirname+'/Data/'+id+'/submit'+times_submit+'/';
   let child_process  = require('child_process');
   child_process.exec(id+'.exe',{cwd:source_cpp}, (error, stdout, stderr) => {
   if (error) {
     console.log(error);
   }
   console.log(stdout);
   onsuccess();
 });
 }
}
