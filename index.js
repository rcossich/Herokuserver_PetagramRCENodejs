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
// La aplicacion Android en el POST debe enviar el valor de id_dispositivo que corresponde a
//id_owner_instagram, si viene nulo no envia la notificacion.
//https://whispering-cliffs-37590.herokuapp.com/registrar-like
//id_owner_instagram, id_media_instagram,id_sender_instagram, id_dispositivo

//IMPORTANTE: se queria verificar si en el nodeo de firebase registrar-usuario existia
//un nodo donde id_usuario_instagram fuera giaul que id_owner_instagram para recuperar
//el id_dispositivo al cual debemos enviar la notificacion.
//nunca se logro hacer correr el codigo, por lo que se decidio que en la aplicacion de Android
//se va a buscar dicho id_dispositivo con un GET directo al nodo registrar-usuario.json
//eso explica que se agregue al POST el id_dispositivo (solamente se permite uno)
//y con esto queda resuelto el envio de notificacions desde Heroku.




var registrarlikeURI = "registrar-like";
app.post("/" + registrarlikeURI, function(request,response) {
	var id_owner_instagram  	= request.body.id_owner_instagram;
	var id_media_instagram  	= request.body.id_media_instagram;
	var id_sender_instagram 	= request.body.id_sender_instagram;
	var id_dispositivo          = request.body.id_dispositivo;

	/*      *************************************************
			ACA VAMOS A PROBAR DE NUEVO OBTENER SI ESTA REGISTRADO
			ALGUN DISPOSITIVO DEL id_owner_instagran en el nodo
			/registrar-usuario

            ************************************************ */

    var db1 = firebase.database();
    var arbol = db1.ref(registrarUsuarioURI);
    var id_dispositivo = null;
    console.log("previo a tratar de recuperar id de dispositivo");
    //arbol.orderByChild('id_usuario_instagram').on(
    arbol.orderByKey().once(
    	"value",function(snapshot){
    		console.log("Entrando a"+snapshot.key);
    	});
    console.log("posterior a tratar de recuperar id de dispositivo");


	//insertando en FireBase el Like.
	var db = firebase.database();
	console.log("Vamos a tener acceso a "+db.ref());
	var registro = db.ref(registrarlikeURI).push();
	llave = registro.key;
	registro.set({
		id_owner_instagram  : id_owner_instagram,
		id_media_instagram  : id_media_instagram,
		id_sender_instagram : id_sender_instagram,
		id_dispositivo      : id_dispositivo
	});	
	console.log("Se empujo la llave "+llave);
	//enviando respuesta
	var respuesta = {};
	var usuario = "";
	var ref = db.ref(registrarlikeURI);
	ref.on("child_added", function(snapshot, prevChildKey) {
		usuario = snapshot.val();
		respuesta = {
			id: llave,
			id_dispositivo : id_dispositivo,
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


