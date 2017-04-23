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
	var llave = null;

//verificar si existe otro like con (id_owner_instagram,id_media_instagram,id_sender_instagram), sino hay codigo es porque no se decidio implementar.
//insertando en FireBase el Like.
	/*var db = firebase.database();
	console.log("Vamos a tener acceso a "+db.ref());
	var registro = db.ref(registrarlikeURI).push();
	llave = registro.key;
	registro.set({
		id_owner_instagram : id_owner_instagram,
		id_media_instagram : id_media_instagram,
		id_sender_instagram : id_sender_instagram
	});	
	console.log("Se empujo la llave "+llave);
	//verificando si existe registrado como usuario el id del owner de la media.*/
	//var busqueda = db.ref("/"+registrarUsuarioURI); //quiero el nodo de registrar-usuario
	

	/*var db2 = firebase.database();
	var busqueda = db2.ref("/registrar-usuario");
	var variable_busqueda = "id_usuario_instagram";
	var llaves_recorridas = 0;
	var usuarios_recorridos = 0;
	
	// Attach an asynchronous callback to read the data at our posts reference
	console.log("Probando un sencillo once-value recorrido a "+busqueda);
	busqueda.once("value", function(snapshot) {
  		console.log(snapshot.val());
	}, function (errorObject) {
  		console.log("The read failed: " + errorObject.code);
	});
	console.log("Final del recorrido con once-value.");*/


	/*conjunto1.on("value", function(snapshot){
		console.log("Registros primer bucle "+snapshot.numChildren());
		snapshot.forEach(function(registro) {
			console.log("Estoy viendo el registro "+ snapshot.key);
			llaves_recorridas = llaves_recorridas + 1;
			var usuario_instagram = registro.child(variable_busqueda).val();
			console.log("Recupero para "+variable_busqueda+" el valor "+usuario_instagram);
			var dispositivo = registro.child("id_dispositivo").val();
			console.log("Recupero el Id de dispositivo "+dispositivo);
			usuarios_recorridos = usuarios_recorridos + 1;
		})
	}, function(errorObject){
		console.log("Hubo un error: "+errorObject.code);
	});*/

	
	/*var respuesta = "Se inserto el comando"+llave+", y se trato de recorrer "+registrarUsuarioURI;
	response.send(respuesta);*/

	var db = firebase.database();
	var ref = db.ref("/user_data");  //Set the current directory you are working in

	/**
	* Setting Data Object Value
	*/
	ref.set([
	{
    	id:20,
    	name:"Jane Doe",
    	email:"jane@doe.com",
    	website:"https://jane.foo.bar"
	},
	{
    	id:21,
    	name:"John doe",
   	 	email:"john@doe.com",
    	website:"https://foo.bar"
	}
	]);

	/**
	* Pushing New Value
	* in the Database Object
	*/
	ref.push({
    	id:22,
    	name:"Jane Doe",
    	email:"jane@doe.com",
   	 website:"https://jane.foo.bar"
	});

	/**
	* Reading Value from
	* Firebase Data Object
	*/
	ref.once("value", function(snapshot) {
  	var data = snapshot.val();   //Data is in JSON format.
  	console.log(data);
	});
}
);



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


