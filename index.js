var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var firebase = require("firebase");

firebase.initializeApp({
  serviceAccount: "PetragramRCENodejs-6812688ab89d.json",
  databaseURL: "https://petragramrcenodejs.firebaseio.com"
});

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
var registrarUsuarioURI = "registrar-usuario";
app.post("/" + registrarUsuarioURI, function(request,response) {
	var id_dispositivo 	= request.body.id_dispositivo;
	var id_usuario_instagram 	= request.body.id_usuario_instagram;
	var db = firebase.database();
	var registro = db.ref(registrarUsuarioURI).push();
	registro.set({
		id_dispositivo : id_dispositivo,
		id_usuario_instagram : id_usuario_instagram
	});	


	var path = registro.toString(); 
	var pathSplit = path.split(registrarUsuarioURI + "/");
	var idAutoGenerado = pathSplit[1];
	var respuesta = generarRespuestaAToken(db, idAutoGenerado);
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(respuesta));
}
);

function generarRespuestaAToken(db, idAutoGenerado) {
	var respuesta = {};
	var usuario = "";
	var ref = db.ref(registrarUsuarioURI);
	ref.on("child_added", function(snapshot, prevChildKey) {
		usuario = snapshot.val();
		respuesta = {
			id: idAutoGenerado,
			id_dispositivo : usuario.id_dispositivo,
			id_usuario_instagram : usuario.id_usuario_instagram
		};

	});
	return respuesta;
}


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


