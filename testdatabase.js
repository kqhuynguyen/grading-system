function return_timesubmit(times_submit){
  return times_submit;
}
function get_timessubmit_of_student(username,onsuccess)
{
  let line_reader=require('line-reader');
  let file_data=__dirname+"/DataStudent/Danhsachsinhvien.csv";
  line_reader.eachLine(file_data,function(line,last)
  {
      let seperate=line.split(',');
      if(seperate[0]==username) onsuccess(seperate[2]);
  });
}
module.exports = {
    check_login_csv: function(username, password) {
        return new Promise((resolve, reject) => {
            let line_reader = require('line-reader');
            let file_data = __dirname + "/DataStudent/Account.csv";
            line_reader.eachLine(file_data, function(line, last) {
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
    wait_for_second: function(ms, after_wait) {
        let start = new Date().getTime();
        let end = start;
        while (end < start + ms) {
            end = new Date().getTime();
        }
        after_wait();
    },
    Get_timessubmit_of_student:function(username,onsuccess){
    get_timessubmit_of_student(username,function(times_submit){
      onsuccess(times_submit);
        });
    },
    add_new_account: function(data){
      let append=require('fs');
      console.log('in function '+data);
      let account_source=__dirname+'/DataStudent/Account.csv';
      append.appendFile(account_source,data,function(err,success){
        if(err) console.log(err);
      });
   },
   check_account_existence:function(data,exist){
     let line_reader=require('line-reader');
     let file_data=__dirname+"/DataStudent/Account.csv";
     line_reader.eachLine(file_data,function(line,last)
     {
         let seperate=line.split(',');
         if(seperate[0]==data) exist(seperate[0]);
         if(last) {
           if(seperate[0]==data) exist(seperate[0]);
           else exist(null);
         }
     });
   }
}
