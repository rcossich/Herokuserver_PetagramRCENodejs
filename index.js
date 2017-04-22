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
var registrarlikeURI = "registrar-like";
app.post("/" + registrarlikeURI, function(request,response) {
	var id_owner_instagram  	= request.body.id_owner_instagram;
	var id_media_instagram  	= request.body.id_media_instagram;
	var id_sender_instagram 	= request.body.id_sender_instagram;
	var existia_like = false;
	var mensaje = null;

//verificar si existe otro like con (id_owner_instagram,id_media_instagram,id_sender_instagram), sino hay codigo es porque no se decidio implementar.
//insertando en FireBase el Like.
	var db = firebase.database();
	var registro = db.ref(registrarlikeURI).push();
	registro.set({
		id_owner_instagram : id_owner_instagram,
		id_media_instagram : id_media_instagram,
		id_sender_instagram : id_sender_instagram
	});	
	
	//verificando si existe registrado como usuario el id del owner de la media.
	var busqueda = db.ref(registrarUsuarioURI);
	var variable_busqueda = "id_usuario_instagram";
	console.log("Vamos a ordenar por "+variable_busqueda+", y a filtrar "+id_owner_instagram);
	conjunto1 = busqueda.orderByChild(variable_busqueda).equalTo(id_owner_instagram);
	console.log("Se asigno a conjunto1 ordenar por hijo y filtrar"); 
	conjunto1.on("child_added", function(snapshot){
		console.log("Registros filtrados "+snapshot.numChildren());
		snapshot.forEach(function(registro) {
			console.log(registro.key+" con "+registro.val().id_usuario_instagram+" dispositivo "+registro.val().id_dispositivo);
		})
	}, function(errorObject){
		console.log("Hubo un error: "+errorObject.code);
	});
}
);



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


