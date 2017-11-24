module.exports.copyFile = (file, dir2, onsuccess) => {
    let fs = require('fs');
    let path = require('path');
    let f = path.basename(file);
    let source = fs.createReadStream(file);
    let dest = fs.createWriteStream(path.resolve(dir2, f));
    source.pipe(dest);
    source.on('end', function() {
        console.log("Successful Copy !");
        onsuccess();
    });
    source.on('error', function(err) {
        console.log(err);
    });
};
module.exports.moveFile = (oldpath, newpath, onsuccess) => {
    let fs = require('fs');
    fs.rename(oldpath, newpath, function(err) {
        if (err) return console.log(err);
        console.log("Successful movement !");
        onsuccess();
    });
};