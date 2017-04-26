var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
var firebase = require("firebase");

firebase.initializeApp({
  serviceAccount: "PetragramRCENodejs-6812688ab89d.json",
  databaseURL: "https://petragramrcenodejs.firebaseio.com"
});
*/

var firebase = require("firebase-admin");
var serviceAccount = require("./PetragramRCENodejs-6812688ab89d.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://petragramrcenodejs.firebaseio.com"
});


//var FCM = require('fcm-push');  //habilitar el FireBase Cloud Messagging push notification.

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



//POST para registrar un like desde el TimeLine de la aplicacion (manda id owner, id media y id sender).
// el owner es el id de instagram del dueño de la cuenta de instagram donde pertenece la media.
// el id media es el identificador de isntagram para la media a la que se le dio like en el TimeLine.
// el id sender es el id de instagram definido como principal en la aplicacion.
// este id owner debe estar registrado en registrar-usuario para poder enviar notificacion.

//https://whispering-cliffs-37590.herokuapp.com/registrar-like
//id_owner_instagram, id_media_instagram,id_sender_instagram

//IMPORTANTE:
// dentro de este codigo se hace una llamada a un GET de Firebase que regresa el nodo completo
// de registrar-usuario. A traves de parser de JSON se revisa si existe un dispositivo registrado
// para el id_owner_instagram.
// en caso de existir se regresa este valor en la respuesta del POST en el campo id_dispositivo.
var registrarlikeURI = "registrar-like";
app.post("/" + registrarlikeURI, function(request,response) {
	var id_owner_instagram  	= request.body.id_owner_instagram;
	var id_media_instagram  	= request.body.id_media_instagram;
	var id_sender_instagram 	= request.body.id_sender_instagram;



	//tratando de obtener registrar-usuario con un GET finalizado en .json desde aca.
	var URL_usuarios = "https://petragramrcenodejs.firebaseio.com/registrar-usuario.json";
	//'use strict';
	var registrados = require('request');
	var id_dispositivo_recuperado= null;
	var get_finalizado = 0;
	registrados.get({
    	url: URL_usuarios,
    	json: true,
    	headers: {'User-Agent': 'request'}
  	}, (err, res, data) => {
    	if (err) {
      		console.log('Error:', err);
    	} else if (res.statusCode !== 200) {
      		console.log('Status:', res.statusCode);
    	} else {
      		// data is already parsed as JSON:
    		console.log("dentro de sin error ni codigo != 200");
      		//console.log("Body: ",data); //aca venia el Json
      		console.log("vamos a recorrer cada nodo que regreso el GET");
      		for (var dato_actual in data) {
      			var id_dispositivo_actual = data[dato_actual]["id_dispositivo"];
      			var id_usuario_instagram_actual = data[dato_actual]["id_usuario_instagram"]
      			console.log(id_dispositivo_actual);
      			console.log(id_usuario_instagram_actual);
      			if (!id_dispositivo_recuperado || id_dispositivo_recuperado.length===0) {
      				console.log("Vamos a comparar "+id_usuario_instagram_actual+" con "+id_owner_instagram);
      				if (id_usuario_instagram_actual===id_owner_instagram) {
      					console.log("Eran iguales");
      					id_dispositivo_recuperado = id_dispositivo_actual;
      				}
      			}
      		}
    	}
    	console.log("registrados.");
    	get_finalizado = 1;
	});


	//insertando en FireBase el Like.
	var db = firebase.database();
	console.log("Vamos a tener acceso a "+db.ref());
	while (!id_dispositivo_recuperado && get_finalizado===0) { //esperar a tener un valor o salir GET.

	}
	var registro = db.ref(registrarlikeURI).push();
	console.log("A obtener la llave");
	llave = registro.key;
	console.log("Antes del set de registrar-like");
	registro.set({
		id_owner_instagram  : id_owner_instagram,
		id_media_instagram  : id_media_instagram,
		id_sender_instagram : id_sender_instagram
	});	
	console.log("Se empujo la llave "+llave);
	//enviando respuesta
	var respuesta = {};
	var usuario = "";
	var ref1 = db.ref(registrarlikeURI);
	ref1.on("child_added", function(snapshot, prevChildKey) {
		usuario = snapshot.val();
		respuesta = {
			id: llave,
			id_dispositivo : id_dispositivo_recuperado,
			id_owner_instagram : usuario.id_owner_instagram,
			id_media_instagram : usuario.id_media_instagram,
			id_sender_instagram : id_sender_instagram
		};

	}); 
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(respuesta));
	}
);



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


