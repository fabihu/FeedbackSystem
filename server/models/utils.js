var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

init = function(){
	console.log("utils init")
}

getDateTime = function(){
	var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
    return dateTime;
}

hashPassword = function(password){      
    return bcrypt.hashSync(password, salt);
}

comparePassword = function(password, hash){
    return bcrypt.compareSync(password, hash);
}

exports.comparePassword = comparePassword;
exports.hashPassword = hashPassword;
exports.getDateTime = getDateTime;
exports.init = init;