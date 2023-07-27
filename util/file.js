const fs = require('fs');

const fileDelete = (filePath)=>{
    console.log(filePath);
    fs.unlink(filePath,(err)=>{
        if(err){
            throw new Error('filepath not found');
        }
       


    })
}

exports.filedelete = fileDelete;