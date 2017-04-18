var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

//POST para registrar usuario (manda id del dispositivo y el id de usuario de instragram.)
//https://whispering-cliffs-37590.herokuapp.com/registrar-usuario
//id_dispositivo,id_usuario_instagram
app.post("/registrar-usuario", function(request,response) {
	response.send(request.body.id_dispositivo,'\n',request.body.id_usuario_instagram);
}
);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


