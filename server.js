// подключение express
var express = require("express");

var app = express();

app.use('/', express.static(__dirname));

app.listen(8080, () => {
	console.log('Server running on 8080');
});