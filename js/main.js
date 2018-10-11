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
            /*getListDesarrollos()*/
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
    $(element).find(".edit").removeClass("d-none")
}

function hideAction(element){
    $(element).find(".edit").addClass("d-none")
}


function getListDesarrollos(){
         $("#list-desarrollos").empty()
         var i=0
        var starCountRef = database.ref('desarrollos/');
        starCountRef.once('value', function(snapshot) {
             var dataUsers = snapshot.val()
             $.each(dataUsers, function(indice, valor) {
                i= i+1;
                var liFill = "<li class='name-terreno' onmouseover='viewAction(this)' onmouseout='hideAction(this)'><span class='number-principal' >"+i+"</span>"
                +valor.nombreTerreno+"<span class='edit float-right d-none' onclick=\"clientsBy(\'"+i+"\', \'"+indice+"\', \'"+valor.nombreTerreno+"\')\">Pagados</span></li>"
                $("#list-desarrollos").append(liFill)
             });
         });
}


var arrayNameClients = []
var globalKeyDesarrollo = null;

function clientsBy(indice, keyDesarrollo, nameDesarrollo) {
    $(".list-view").addClass("d-none")
    $(".search-clients").removeClass("d-none")
    $(".number-desarrollo").text(indice)
    $(".name-desarrollo").text(nameDesarrollo)
    globalKeyDesarrollo = keyDesarrollo;
    getClients()
    var arrayLotesFrom = []
    var starCountRef = database.ref('desarrollos/' + keyDesarrollo + "/lotes");
    starCountRef.once('value', function(snapshot) {
        var dataInfo = snapshot.val()
        if (dataInfo == null) {
            $(".error-lotes").removeClass("d-none")
        } else {
            $.each(dataInfo, function(indice2, valor2) {
                arrayLotesFrom.push(valor2)
            });
            var lotesRef = database.ref('lotes/')
            lotesRef.once('value', function(snapshot) {
                var dataLotes = snapshot.val()
                $.each(dataLotes, function(indice3, valor3) {
                    var nameCliente = null;
                    var claveLote;
                    for (var i = 0; i < arrayLotesFrom.length; i++) {
                        if (arrayLotesFrom[i] == indice3) {
                            claveLote = valor3.clave
                        }
                    }
                    for (var i = 0; i < arrayNameClients.length; i++) {
                        if (arrayNameClients[i].key == valor3.propietario) {
                            nameCliente = arrayNameClients[i].name
                        }
                    }

                    if (nameCliente == null && claveLote != null) {
                        var liAppend = "<li onclick=\"getInfoLote(\'" + indice3 + "\', \'" + valor3.propietario + "\', this)\">" + claveLote + " - Sin propietario </li>"
                    } else if(nameCliente != null && claveLote != null){
                        var liAppend = "<li onclick=\"getInfoLote(\'" + indice3 + "\', \'" + valor3.propietario + "\', this)\">" + claveLote + " - " + nameCliente + "</li>"
                    }
                    $("#list-lotes").append(liAppend)
                });
            })
        }
    });
}

function getClients(){
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
}

var globalKeyLote = null;

function getInfoLote(keyLote, keyPropietario, valueLi){
    var i;
    var textLi = $(valueLi).text()
    globalKeyLote = keyLote;
    $(".box-area").addClass("big-box")
    $(".detail-develop").removeClass("d-none")
    $(".search-clients").addClass("d-none")
    $(".lote-selected").text(textLi)
    for(i=0; i<arrayNameClients.length; i++){
        if(arrayNameClients[i].key == keyPropietario){
            $(".phone").text(arrayNameClients[i].telefono)
            $(".cellphone").text(arrayNameClients[i].celular)
            $(".email").text(arrayNameClients[i].email)
        }
    }
    var starCountRef = database.ref('lotes/' + keyLote);
    starCountRef.once('value', function(snapshot) {
        var dataInfo = snapshot.val()
        $(".lote-manzana").text("Lote "+dataInfo.lote+" Manzana "+dataInfo.manzana)
        var allDireccion = dataInfo.calle+" COL. "+dataInfo.colonia+", "+dataInfo.delegacion
        $(".direccion").text(allDireccion.toUpperCase())
        $("#enganche-lote").val('$' + parseFloat(dataInfo.enganche, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString()) 
        $("#costo-mt").val('$' + parseFloat(dataInfo.costoMetro, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $("#mts-lote").val(dataInfo.metros)   
        $("#pagos-lote").val(dataInfo.pagosMensuales)
        $("#reg-lote").val('$' + parseFloat(dataInfo.regulacion, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $("#fecha-compra").val(dataInfo.fechaCompra)
        var adeudoTotal = dataInfo.metros * dataInfo.costoMetro;
        $("#adeudo-lote").val('$' + parseFloat(adeudoTotal, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())    
        viewPagos(adeudoTotal)   
    });
}
   
function cotizar(){
    var metros = $("#metros").val()
    var costoMetro = $("#costo-metro").val()
    var metroWithin = costoMetro.replace(/\$|\,/g, "");
    var totalCosto = metros * metroWithin;
    $("#total-metros").val('$' + parseFloat(totalCosto, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())

    var numeroPagos = $("#numero-pagos").val()
    var mensualidades = totalCosto/numeroPagos;
    $("#mensual-pagos").val('$' + parseFloat(mensualidades, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())

    var enganche = $("#enganche").val()
    var engancheWithin = enganche.replace(/\$|\,/g, "");
    var totalEnganche = totalCosto - engancheWithin;
    $("#total-adeudo").val('$' + parseFloat(totalEnganche, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())

}



function changeToCurrency(input) {
    var imports = $(input).val()
    var changes = imports.substr(0, imports.length-3)
    var lastPart = imports.substr(imports.length - 3)
    if (lastPart == ".00") {
        var changeWithin = changes.replace(/\$|\,/g, "");
        $(input).val('$' + parseFloat(changeWithin, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString());
        $(input).addClass("text-right")
    } else {
        var changeWithin2s =  imports.replace(/\$|\,/g, "");
        if(changeWithin2s.length == 0){
            $(input).val("")
            $(input).removeClass("text-right")
        }
        else{
            $(input).val('$' + parseFloat(changeWithin2s, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString());
            $(input).addClass("text-right")
        }
    }
}

function viewPagos(adeudo) {
    var totalPagado = 0;
    var knowPagos = database.ref('pagos/');
    knowPagos.on('value', function(snapshot) {
        var dataInfo = snapshot.val()
        $.each(dataInfo, function(indice, valor) {
             var addRow;
            if (valor.idLote == globalKeyLote) {
                totalPagado = totalPagado + parseInt(valor.monto)
                addRow = "<tr><td>"+valor.numero+"</td>"+
                "<td>"+valor.fecha+"</td>"+
                "<td>"+valor.monto+"</td></tr>"
            }
            $("#pagos-lotes").append(addRow)
        });
        $("#total-pagado").val('$' + parseFloat(totalPagado, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        var adeudoRestante = adeudo - totalPagado;
        $("#total-adeudo").val('$' + parseFloat(adeudoRestante, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
    });
}





/*Funciones para agregar a base de datos*/

function altaUser() {
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
    var nameTerreno = $("#desarrollo").val()
    firebase.database().ref('desarrollos/').push({nombreTerreno: nameTerreno});
    $("#desarrollo").val("")
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
    var lotesKey = firebase.database().ref('lotes/').push(arrayLotes).key;
    firebase.database().ref('desarrollos/'+globalKeyDesarrollo+"/lotes").push(lotesKey)
    $("#clave, #lote, #manzana, #calle, #colonia, #delegacion").val("")
}

function addClientes(){
    var nombreCliente = $("#nombre").val()
    var telefono = $("#telefono").val()
    var celular = $("#celular").val()
    var email = $("#email").val()
    var lotes = $("#inlineFormCustomSelect option:selected").attr("value")

    var arrayCliente = {
        nombre: nombreCliente,
        telefono: telefono,
        celular: celular,
        email: email
    }
    var keyCliente = firebase.database().ref('clientes').push(arrayCliente).key;
    firebase.database().ref('clientes/'+keyCliente+"/lotes").push(lotes)
    addLoteToClient(keyCliente, lotes)
    $("#nombre, #telefono, #celular, #email, #terreno").val("")
}

function addLoteToClient(keyClient, lote){
    firebase.database().ref('lotes/'+lote).update({propietario: keyClient})
}



function appendDesarrollos(){
    //Esta funcion es para seleccionar el Desarrollo al dar de alta un lote
    var starCountRef = database.ref('desarrollos/');
    starCountRef.once('value', function(snapshot) {
        var dataInfo = snapshot.val()
        $.each(dataInfo, function(indice, valor) {
           var selectOption = "<option value='"+indice+"'>"+valor.nombreTerreno+"</option>"
           $("#inlineFormCustomSelect").append(selectOption)
       });
    });
}

function appendClientes(){
    //Esta funcion es para seleccionar el terreno al dar de alta un cliente
    var starCountRef = database.ref('lotes/');
    starCountRef.once('value', function(snapshot) {
        var dataInfo = snapshot.val()
        $.each(dataInfo, function(indice, valor) {
           var selectOption = "<option value='"+indice+"'>"+valor.clave+"</option>"
           $("#inlineFormCustomSelect").append(selectOption)
       });
    });
}

function NosePorqueLoHiceAsi(keyClient, lote){
    var starCountRef = database.ref('desarrollos/');
    var keyFromDesarrollo;
    starCountRef.once('value', function(snapshot) {
        var dataInfo = snapshot.val()
        $.each(dataInfo, function(indice, valor) {
            var lotesFromDesarrollo = valor.lotes
           $.each(lotesFromDesarrollo, function(indice2, valor2) {
               if(valor2 == lote){
                 keyDesarrollo = indice
               }
           });
       });
    });
    firebase.database().ref('').update({propietario: key})
}

function addPago() {
    console.log(globalKeyLote)
    var fechaPago = $("#fecha").val()
    var montoPago = $("#monto").val()
    var numeroPago = 1;

    var knowPagos = database.ref('pagos/');
    knowPagos.once('value', function(snapshot) {
        var dataInfo = snapshot.val()
        var lengthInfo = snapshot.numChildren();
        if (lengthInfo == 0) {
            numeroPago = "0" + numeroPago

        } else {
            $.each(dataInfo, function(indice, valor) {
                if (valor.idLote == globalKeyLote) {
                    numeroPago = numeroPago + 1
                }
            });
        }
        if (numeroPago <= 9) {
            numeroPago = "0" + numeroPago;
        }
        firebase.database().ref('pagos/').push({
            idLote: globalKeyLote,
            fecha: fechaPago,
            monto: montoPago,
            numero: numeroPago
        });
        $(".box-area input").val("")
    });
}
