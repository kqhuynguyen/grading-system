module.exports={
compile_cpp_file:function(id,after_compile)
{
    let child_process  = require('child_process');
    let source_cpp =__dirname+'/Data/execute_exe/';
    let exe_name =id;
    let execute;
    child_process.execFile('g++', [source_cpp+exe_name+'.cpp','-o',exe_name], (error, stdout, stderr) => {
    if (error) {
	    console.log(error);
    }
    console.log(stdout);
    setTimeout(function(){child_process.exec('taskkill /F /IM '+exe_name+'.exe',{cwd:source_cpp},function(err,stdout,stderr){
          if(err) console.log(err);
          let fs=require('fs');
          let path=__dirname+'/Data/execute_exe/output.txt';
          if(fs.existsSync(path))
           {
             move_file.moveFile(path,__dirname+'/Data/'+exe_name+'/output.txt',function(){});
           }
          after_compile();
        });
    },3000);
    let move_file = require('./copymove.js');
    console.log(exe_name);
    move_file.moveFile(__dirname+'/'+exe_name+'.exe',__dirname+'/Data/execute_exe/'+exe_name+'.exe',function(){
      execute=child_process.exec(exe_name+'.exe',{cwd:source_cpp}, (error, stdout, stderr) => {
          if (error) {
              console.log(error);
          }
          console.log(stdout);

        });
      });
    });
  }
}
