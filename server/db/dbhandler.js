init = function(){ 
  console.log('DB init');
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'database'
  });
  
  connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err);
    return;
  }

  console.log('connected as id #' + connection.threadId);
});
  
  connection.query('SELECT * FROM < table name >', function(err, rows, fields) {
    if (!err)
      console.log('The solution is: ', rows);
    else
      console.log('Error while performing Query.');
  });
  
  connection.end();
}

exports.init = init;