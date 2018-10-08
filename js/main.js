// Initialize Firebase
var storage = firebase.storage();

// Create a storage reference from our storage service
var storageRef = storage.ref();

// Create a child reference
var imagesRef = storageRef.child('images');
// imagesRef now points to 'images'

var database = firebase.database();
var usersRegister = []
var idUserActive;

function getUsers() {
    var starCountRef = database.ref('usuarios/');
    starCountRef.once('value', function(snapshot) {
        var dataUsers = snapshot.val()
        $.each(dataUsers, function(indice, valor) {
            usersRegister.push({
                id: indice,
                usuario: valor.correo,
                password: valor.passwordUser
            })
        });
        console.log(usersRegister)
        console.log(usersRegister.length)
    });
}

function login() {
    var emailLogin = $("#login-user").val()
    var passLogin = $("#login-pass").val()
    var i;
    var j = null;
    for (i = 0; i < usersRegister.length; i++) {
        if (usersRegister[i].usuario == emailLogin) {
            j = i;
        }
    }
    if (j == null) {
        alert("El usuario no existe")
    } else {
        if (usersRegister[j].password == passLogin) {
            idUserActive = usersRegister[j].id
            $("#list-settings-list").trigger("click")
        } else {
            alert("El password no es correcto")
        }
    }
}

function changeView(nameView) {
    switch (nameView) {
        case 'login':
            window.location.href = 'index.html';
            console.log("esta habilitado")
            break;
        case 'configuracion.html':
            $("#wrapper-section").load("views/" + nameView)
            getInfoUsers(idUserActive)
            break;
        case 'buscar.html':
            $("#wrapper-section").load("views/" + nameView)
            getListDesarrollos()
            break;
        case 'cotizador.html':
            $("#wrapper-section").load("views/" + nameView)
            break;
    }
}

function readImage(input, images) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $(images).attr('src', e.target.result);
            $(images).removeClass("hidden");
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function addPhoto(idPhoto) {
    $(idPhoto).trigger("click")
}

function updateUser() {
    var idSave = $("#save-edit").attr("value")
    var starCountRef = database.ref('usuarios/' + idSave);
    starCountRef.once('value', function(snapshot) {
        var dataUsers = snapshot.val()
        var nameComplete = $("#nameComplete").val()
        var pass = $("#password").val()
        var email = $("#email").val()
        var phone = $("#phone").val()
        var cellphone = $("#cellphone").val()
        var privilegys;
        var collectionImg = $("#picture").prop("files")[0];
        var imageRefName = storageRef.child(collectionImg.name);
        var imagesRefName = storageRef.child('usersPhoto/' + collectionImg.name);
        var uploadTask = imagesRefName.put(collectionImg);
        uploadTask.on('state_changed', function(snapshot) {
            var progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
            console.log(progress)
        }, function(error) {
            console.log(error)
        }, function() {
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                var userImage = downloadURL;
                if ($("#exampleRadios1").is(":checked")) {
                    privilegys = "S"
                } else {
                    privilegys = "N"
                }
                var newInfo = {
                    nombre: nameComplete,
                    foto: userImage,
                    privilegios: privilegys,
                    correo: email,
                    telefono: phone,
                    celular: cellphone,
                    passwordUser: pass
                };
                firebase.database().ref('usuarios/' + idSave).update(newInfo);
                $(".box-area input").val("")
                $("#img_prev").attr("src", "#")
            });
        });

    });
}

function restrictToNumber(event) {
    event = (event) ? event : window.event
    var charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        event.preventDefault();
    }
    return true
}

function getInfoUsers(idUser) {
    var starCountRef = database.ref('usuarios/' + idUser);
    var key = database.ref('usuarios/' + idUser).key
    starCountRef.once('value', function(snapshot) {
        var dataInfo = snapshot.val()
            //$(".principal-user img").attr("src", dataInfo.foto)
        $(".principal-user p").html("<img src=" + dataInfo.foto + " width='35px' height='33px'>" + dataInfo.nombre + " <span class='edit float-right d-none' onclick=\"edit(\'" + key + "\')\">Editar</span>")
    });

    var starCountRef = database.ref('usuarios/');
    starCountRef.once('value', function(snapshot) {
        var dataInfo2 = snapshot.val()
        var i = 0;
        $.each(dataInfo2, function(indice, valor) {
            if (indice == idUser) {
                console.log("ya existe el usuario")
            } else {
                $(".secondary-users li:eq(" + i + ")").html("<img src=" + valor.foto + " width='35px' height='33px'>" + valor.nombre + " <span class='edit float-right d-none' onclick=\"edit(\'" + indice + "\')\">Editar</span>")
                i = i + 1;
            }
        });
    });
}


function edit(idUser) {
    $(".user-list").hide()
    $(".settings").show()
    var starCountRef = database.ref('usuarios/' + idUser);
    starCountRef.once('value', function(snapshot) {
        var dataInfo = snapshot.val()
        $("#nameComplete").val(dataInfo.nombre)
        $("#password").val(dataInfo.passwordUser)
        $("#email").val(dataInfo.correo)
        $("#phone").val(dataInfo.telefono)
        $("#cellphone").val(dataInfo.celular)
        $("#save-edit").attr("value", idUser)
        if (dataInfo.privilegios == "S") {
            $("#exampleRadios1").prop("checked", true)
        } else {
            $("#exampleRadios2").prop("checked", true)
        }
    });
}


function viewAction(element){
    $(element).find("span").removeClass("d-none")
}

function hideAction(element){
    $(element).find("span").addClass("d-none")
}


function getListDesarrollos(){
    setTimeout(function(){
         $("#list-desarrollos").empty()
         var i=0
        var starCountRef = database.ref('desarrollos/');
        starCountRef.once('value', function(snapshot) {
             var dataUsers = snapshot.val()
             $.each(dataUsers, function(indice, valor) {
                i= i+1;
                var liFill = "<li onmouseover='viewAction(this)' onmouseout='hideAction(this)'><span>"+i+"</span>"
                +valor.nombreTerreno+"<span class='edit float-right d-none' onclick=\"clientsBy(\'"+i+"\', \'"+indice+"\')\">Pagados</span></li>"
                $("#list-desarrollos").append(liFill)
             });
         });
    }, 50)
}


var arrayNameClients = []

function clientsBy(indice, keyDesarrollo) {
    $(".list-view").addClass("d-none")
    $(".search-clients").removeClass("d-none")
    var starClientsRef = database.ref('clientes/');
    starClientsRef.once("value", function(snapshot) {
        var infoClient = snapshot.val()
        $.each(infoClient, function(indice, valor) {
            arrayNameClients.push({
                key: indice,
                name: valor.nombre,
                celular: valor.celular,
                telefono: valor.telefono,
                email: valor.email
            })
        });
    })
    console.log(arrayNameClients)
    var starCountRef = database.ref('desarrollos/' + keyDesarrollo + "/lotes");
    starCountRef.once('value', function(snapshot) {
        var dataInfo = snapshot.val()
        console.log(dataInfo)
        $.each(dataInfo, function(indice, valor) {
            var j = null;
            for (var i = 0; i < arrayNameClients.length; i++) {
                if (arrayNameClients[i].key == valor.propietario) {
                    j = i
                }
            }

            if (j == null) {
                var liAppend = "<li onclick='getInfoLote(this)' value='" + indice + "'>" + valor.clave + " - Sin propietario </li>"
            } else {
                var liAppend = "<li onclick='getInfoLote(this)' value='" + indice + "'>" + valor.clave + " - " + arrayNameClients[j].name + "</li>"
            }
            $("#list-lotes").append(liAppend)
        });
    });
}

function getInfoLote(key){
    //Mostrar informacion en la nueva pantalla
}

/*function altaUser() {
     var nameComplete = $("#nameComplete").val()
     var pass = $("#password").val()
     var email = $("#email").val()
     var phone = $("#phone").val()
     var cellphone = $("#cellphone").val()
     var privilegys;
     var collectionImg = $("#picture").prop("files")[0];
     var imageRefName = storageRef.child(collectionImg.name);
     var imagesRefName = storageRef.child('usersPhoto/' + collectionImg.name);
     var uploadTask = imagesRefName.put(collectionImg);
     uploadTask.on('state_changed', function(snapshot) {
         var progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
         console.log(progress)
     }, function(error) {
         console.log(error)
     }, function() {
         uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
             var userImage = downloadURL;
             if ($("#exampleRadios1").is(":checked")) {
                 privilegys = "S"
             } else {
                 privilegys = "N"
             }
             var userObject = {
                 nombre: nameComplete,
                 foto: userImage,
                 privilegios: privilegys,
                 correo: email,
                 telefono: phone,
                 celular: cellphone,
                 passwordUser: pass
             };
             firebase.database().ref('usuarios/').push(userObject);
             $(".box-area input").val("")
             $("#img_prev").attr("src", "#")
         });
     });
 }


 function addTerreno(){
    var nameTerreno = $("#ejemplo").val()
    firebase.database().ref('desarrollos/').push(nameTerreno);
    $("#ejemplo").val("")
}

function addLote(){
    var nameTerreno = $("#clave").val()
    var lote = $("#lote").val()
    var manzana = $("#manzana").val()
    var calle = $("#calle").val()
    var colonia = $("#colonia").val()
    var delegacion = $("#delegacion").val()

    var arrayLotes = {
        clave: nameTerreno,
        lote: lote,
        manzana: manzana,
        calle: calle,
        colonia: colonia,
        delegacion: delegacion,
        propietario: "s/n"
    }
    firebase.database().ref('desarrollos/-LOAb5EmHo-CLwmRIKHH/lotes').push(arrayLotes);
    $("#clave, #lote, #manzana, #calle, #colonia, #delegacion").val("")
}


function addClientes(){
    var nombreCliente = $("#nombre").val()
    var telefono = $("#telefono").val()
    var celular = $("#celular").val()
    var email = $("#email").val()
    var terreno = $("#terreno").val()

    var arrayCliente = {
        nombre: nombreCliente,
        telefono: telefono,
        celular: celular,
        email: email
    }
    var keyCliente = firebase.database().ref('clientes').push(arrayCliente).key;
    firebase.database().ref('clientes/'+keyCliente+"/terrenos").push(terreno)
    addTerrenoToClient(keyCliente)
    $("#nombre, #telefono, #celular, #email, #terreno").val("")
}

function addTerrenoToClient(key){
    firebase.database().ref('desarrollos/-LOAb5EmHo-CLwmRIKHH/lotes/-LOFix8sKsFqA_dJP1Sm').update({propietario: key})
}*/
