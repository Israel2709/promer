// Initialize Firebase
var storage = firebase.storage();

// Create a storage reference from our storage service
var storageRef = storage.ref();

// Create a child reference
var imagesRef = storageRef.child('images');
// imagesRef now points to 'images'

var database = firebase.database();
var usersRegister = []
var arrayDesarrollos = []
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
            $("#left-nav a").removeClass("no-pointer")
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
            break;
        case 'configuracion.html':
            $("#wrapper-section").load("views/" + nameView)
            setTimeout(function() {
                getInfoUsers(idUserActive)
            }, 100)
            break;
        case 'buscar.html':
            $("#wrapper-section").load("views/" + nameView)
                /*getListDesarrollos()*/
            break;
        case 'cotizador.html':
            $("#wrapper-section").load("views/" + nameView)
            $(".user-data").removeClass("d-none")
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
        console.log(collectionImg)
        if (collectionImg == undefined) {
            if ($("#exampleRadios1").is(":checked")) {
                privilegys = "S"
            } else {
                privilegys = "N"
            }
            var newInfo = {
                nombre: nameComplete,
                privilegios: privilegys,
                correo: email,
                telefono: phone,
                celular: cellphone,
                passwordUser: pass
            };
            firebase.database().ref('usuarios/' + idSave).update(newInfo);
            $(".edit-name").text(nameComplete)
            $(".box-area input").val("")
            $("#img_prev").attr("src", "img/icon-camera.png")
            $(".user-list").show()
            $(".settings").hide()
            $("#alert-edit").removeClass("d-none")
            setTimeout( function(){
                $("#alert-edit").addClass("d-none")
            },3000)
        } else {
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
                    $("#img_prev").attr("src", "img/icon-camera.png")
                    $(".user-list").show()
                    $(".settings").hide()
                });
            });
        }
    });
}

function restrictToNumber(event) {
    event = (event) ? event : window.event
    var charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46) {
        event.preventDefault();
    }
    return true
}

function getInfoUsers(idUser) {
    var starCountRef = database.ref('usuarios/' + idUser);
    var key = database.ref('usuarios/' + idUser).key
    starCountRef.on('value', function(snapshot) {
        var dataInfo = snapshot.val()
        $(".img-user").css('background-image', 'url(' + dataInfo.foto + ')');
        $(".name-login").html("<b>" + dataInfo.nombre + "</b>")
        $(".user-data").removeClass("d-none")
        $(".principal-user p").html("<img src=" + dataInfo.foto + " width='30px' height='30px'>" + dataInfo.nombre + " <span class='edit float-right d-none' onclick=\"edit(\'" + key + "\')\">Editar</span>")
    });

    var starCountRef = database.ref('usuarios/');
    starCountRef.on('value', function(snapshot) {
        $(".secondary-users").empty()
        var dataInfo2 = snapshot.val()
        var i = 0;
        $.each(dataInfo2, function(indice, valor) {
            if (indice == idUser) {
                console.log("ya existe el usuario")
            } else {
                $(".secondary-users").append("<li class='secondary-list' onmouseover='viewAction(this)' onmouseout='hideAction(this)'><img src=" +
                    valor.foto + " width='30px' height='30px'>" +
                    valor.nombre + " <span class='edit float-right d-none' onclick=\"edit(\'" + indice + "\')\">Editar</span></li>")
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
            $("#exampleRadios2").prop("checked", false)
        } else {
            $("#exampleRadios2").prop("checked", true)
            $("#exampleRadios1").prop("checked", false)
        }
    });
}


function viewAction(element){
    $(element).find(".edit").removeClass("d-none")
}

function hideAction(element){
    $(element).find(".edit").addClass("d-none")
}

function getListDesarrollos() {
    arrayDesarrollos = []
    $(".user-data").addClass("d-none")
    $("#list-desarrollos").empty()
    var i = 0
    var starCountRef = database.ref('desarrollos/');
    starCountRef.once('value', function(snapshot) {
        var dataUsers = snapshot.val()
        $.each(dataUsers, function(indice, valor) {
            i = i + 1;
            arrayDesarrollos.push({
                id: i,
                indice: indice,
                nombre: valor.nombreTerreno
            });
            var liFill = "<li class='name-terreno' onmouseover='viewAction(this)' onmouseout='hideAction(this)'><span class='number-principal' >" + i + "</span><span class='titulo-des' onclick=\"clientsBy(\'" + i + "\', \'" + indice + "\', \'" + valor.nombreTerreno + "\')\">" +
                valor.nombreTerreno + "</span><span class='edit float-right d-none' onclick=\"clientsSold(\'" + i + "\', \'" + indice + "\', \'" + valor.nombreTerreno + "\')\">Pagados</span></li>"
            $("#list-desarrollos").append(liFill)
        });
    });
}

var arrayNameClients = []
var globalKeyDesarrollo = null;
var pays = []

function clientsBy(indice, keyDesarrollo, nameDesarrollo) {
    $(".list-view, .no-properties2").addClass("d-none")
    $(".search-clients, .user-data, .modal-backdrop, .button-new-pago").removeClass("d-none")
    $(".number-desarrollo").text(indice)
    $(".name-desarrollo").text(nameDesarrollo)
    globalKeyDesarrollo = keyDesarrollo;
    var starCountRef = database.ref('desarrollos/' + keyDesarrollo + "/lotes");
    starCountRef.on('value', function(snapshot) {
        var dataInfo = snapshot.val()
        var arrayLotesFrom = []
        getClients()  
        appendIDPays()            
        if (dataInfo == null) {
            $(".error-lotes").removeClass("d-none")
        } else {
            $.each(dataInfo, function(indice2, valor2) {
                arrayLotesFrom.push(valor2)
            });
            var lotesRef = database.ref('lotes/')
            lotesRef.on('value', function(snapshot) {
                var dataLotes = snapshot.val()
                $("#list-lotes").empty()
                var valorPagoM = null;
                $.each(dataLotes, function(indice3, valor3) {
                    var nameCliente = null;
                    var claveLote;
                    var lengthPagados = 0;
                    var indiceActual = null;
                    for (var i = 0; i < arrayLotesFrom.length; i++) {
                        if (arrayLotesFrom[i] == indice3) {
                            claveLote = valor3.clave
                            valorPagoM = valor3.pagosMensuales
                            indiceActual = indice3
                        }
                    }
                    for (var j = 0; j < arrayNameClients.length; j++) {
                        if (arrayNameClients[j].key == valor3.propietario) {
                            nameCliente = arrayNameClients[j].name
                        }
                    }
                    for (var k=0; k < pays.length; k++){
                        if(indiceActual == pays[k]){
                            lengthPagados = lengthPagados + 1
                        }
                    }
                     if (nameCliente != null && claveLote != null && valorPagoM != lengthPagados) {
                            var liAppend = "<li class=\"client-account\" onclick=\"getInfoLote(\'" + indice3 + "\', \'" + valor3.propietario + "\', this)\">" + claveLote + " - " + nameCliente + "</li>"
                        }
                    $("#list-lotes").append(liAppend)
                    
                });
                if($("#list-lotes li").length == 0){
                    $(".no-properties").removeClass("d-none")
                }
                else{
                    $(".no-properties").addClass("d-none")
                }
            })
        }
    });
}



function appendIDPays(){
    pays = []
    var knowPagos = database.ref('pagos/');
    knowPagos.on('value', function(snapshot) {
        var pagosInfo = snapshot.val()
        $.each(pagosInfo, function(indice, valor) {
            pays.push(valor.idLote)
        });
                       
    });
}

function getClients() {
    var starClientsRef = database.ref('clientes/');
    starClientsRef.on("value", function(snapshot) {
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

function clientsSold(indice, keyDesarrollo, nameDesarrollo) {
    appendIDPays()
    $(".list-view").addClass("d-none")
    $(".search-clients, .user-data, .modal-backdrop").removeClass("d-none")
    $(".number-desarrollo").text(indice)
    $(".name-desarrollo").text(nameDesarrollo)
    globalKeyDesarrollo = keyDesarrollo;
    var starCountRef = database.ref('desarrollos/' + keyDesarrollo + "/lotes");
    starCountRef.on('value', function(snapshot) {
        var dataInfo = snapshot.val()
        var arrayLotesFrom = []
        getClients()              
        if (dataInfo == null) {
            $(".error-lotes").removeClass("d-none")
        } else {
            $.each(dataInfo, function(indice2, valor2) {
                arrayLotesFrom.push(valor2)
            });
            var lotesRef = database.ref('lotes/')
            lotesRef.on('value', function(snapshot) {
                var dataLotes = snapshot.val()
                $("#list-lotes").empty()
                var valorPagoM = null;
                $.each(dataLotes, function(indice3, valor3) {
                    var nameCliente = null;
                    var claveLote;
                    var lengthPagados = 0;
                    var indiceActual
                    for (var i = 0; i < arrayLotesFrom.length; i++) {
                        if (arrayLotesFrom[i] == indice3) {
                            claveLote = valor3.clave
                            valorPagoM = valor3.pagosMensuales
                            indiceActual = indice3
                        }
                    }
                    for (var i = 0; i < arrayNameClients.length; i++) {
                        if (arrayNameClients[i].key == valor3.propietario) {
                            nameCliente = arrayNameClients[i].name
                        }
                    }
                    for (var i=0; i<pays.length; i++){
                        if(indiceActual == pays[i]){
                            lengthPagados = lengthPagados + 1
                        }
                    }
                    if (nameCliente != null && claveLote != null && valorPagoM == lengthPagados) {
                        var liAppend = "<li class=\"client-account\" onclick=\"getInfoLote(\'" + indice3 + "\', \'" + valor3.propietario + "\', this)\">" + claveLote + " - " + nameCliente + "</li>"
                    }
                    $("#list-lotes").append(liAppend)
                });
                if($("#list-lotes li").length == 0){
                    $(".no-properties2").removeClass("d-none")
                }
                else{
                    $(".no-properties2, .button-new-pago").addClass("d-none")
                }
            })
        }
    });
}

var globalKeyLote = null;

function getInfoLote(keyLote, keyPropietario, valueLi) {
    var i;
    var textLi = $(valueLi).text()
    globalKeyLote = keyLote;
    $(".box-area").addClass("big-box")
    $(".detail-develop").removeClass("d-none")
    $(".search-clients, .modal-backdrop").addClass("d-none")
    $(".lote-selected").text(textLi)
    for (i = 0; i < arrayNameClients.length; i++) {
        if (arrayNameClients[i].key == keyPropietario) {
            var numero = arrayNameClients[i].telefono
            var primeraParte = numero.substr(0, 4)
            var segundaParte = numero.substr(4, 8)
            var celular = arrayNameClients[i].celular
            var clave = celular.substr(0, 2)
            var primeraCel = celular.substr(2, 4)
            var segundaCel = celular.substr(6, 10)
            $(".phone").html("<img src='img/icon-phone.png' class='icon'>" + primeraParte + " " + segundaParte)
            $(".cellphone").html("<img src='img/icon-cellphone.png' class='icon'>" + clave + " " + primeraCel + " " + segundaCel)
            $(".email").html("<img src='img/icon-email.png' class='icon'>" + arrayNameClients[i].email)
        }
    }
    var starCountRef = database.ref('lotes/' + keyLote);
    starCountRef.once('value', function(snapshot) {
        var dataInfo = snapshot.val()
        $(".lote-manzana").text("Lote " + dataInfo.lote + " Manzana " + dataInfo.manzana)
        var allDireccion = dataInfo.calle + " COL. " + dataInfo.colonia + ", " + dataInfo.delegacion
        $(".direccion").text(allDireccion.toUpperCase())
        $("#enganche-lote").val('$' + parseFloat(dataInfo.enganche, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $("#costo-mt").val('$' + parseFloat(dataInfo.costoMetro, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $("#mts-lote").val(dataInfo.metros)
        $("#pagos-lote").val(dataInfo.pagosMensuales)
        $("#reg-lote").val('$' + parseFloat(dataInfo.regulacion, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $("#fecha-compra").val(dataInfo.fechaCompra)
        var adeudoTotal = dataInfo.metros * dataInfo.costoMetro;
        $("#adeudo-lote").val('$' + parseFloat(adeudoTotal, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        $(".total-letras").text(dataInfo.pagosMensuales)
        viewPagos(adeudoTotal)
    });
}
   
function cotizar() {
    var metros = $("#metros").val()
    var costoMetro = $("#costo-metro").val()
    var numeroPagos = $("#numero-pagos").val()
    var enganche = $("#enganche").val()

    if (metros.length == 0 || costoMetro.length == 0 || numeroPagos.length == 0 || enganche.length == 0) {
        alert("LLenar todos los campos")
    } else {
        var metroWithin = costoMetro.replace(/\$|\,/g, "");
        var totalCosto = metros * metroWithin;
        $("#total-metros").val('$' + parseFloat(totalCosto, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        var mensualidades = totalCosto / numeroPagos;
        $("#mensual-pagos").val('$' + parseFloat(mensualidades, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        var engancheWithin = enganche.replace(/\$|\,/g, "");
        var totalEnganche = totalCosto - engancheWithin;
        $("#total-adeudo").val('$' + parseFloat(totalEnganche, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
    }
}

function changeToCurrency(input) {
    var imports = $(input).val()
    var changes = imports.substr(0, imports.length - 3)
    var lastPart = imports.substr(imports.length - 3)
    if (lastPart == ".00") {
        var changeWithin = changes.replace(/\$|\,/g, "");
        $(input).val('$' + parseFloat(changeWithin, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString());
        //$(input).addClass("text-right")
    } else {
        var changeWithin2s = imports.replace(/\$|\,/g, "");
        if (changeWithin2s.length == 0) {
            $(input).val("")
            //$(input).removeClass("text-right")
        } else {
            $(input).val('$' + parseFloat(changeWithin2s, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString());
            //$(input).addClass("text-right")
        }
    }
}

function viewPagos(adeudo) {
    var knowPagos = database.ref('pagos/');
    knowPagos.on('value', function(snapshot) {
        var totalPagado = 0;
        var lengthPagados = 0;
        $("#pagos-lotes2, #pagos-lotes").empty()
        var dataInfo = snapshot.val()
        $.each(dataInfo, function(indice, valor) {
            var addRow;
            if (valor.idLote == globalKeyLote) {
                lengthPagados = lengthPagados + 1;
                var formatCurrency = '$' + parseFloat(valor.monto, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString()
                totalPagado = totalPagado + parseInt(valor.monto)
                addRow = "<tr><td>" + valor.numero + "</td>" +
                    "<td>" + valor.fecha + "</td>" +
                    "<td>" + formatCurrency + "</td></tr>"
            }
            $("#pagos-lotes-export").append(addRow)
            if (lengthPagados <= 12) {
                $("#pagos-lotes").append(addRow)
            } else {
                $(".second-table").removeClass("d-none")
                $("#pagos-lotes2").append(addRow)
            }
        });
        $("#letters-payments").val(lengthPagados)
        $("#total-pagado").val('$' + parseFloat(totalPagado, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        var adeudoRestante = adeudo - totalPagado;
        $("#total-adeudo").val('$' + parseFloat(adeudoRestante, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString())
        var porcentPagado = (totalPagado * 100) / (adeudo)
        var porcentAdeudo = 100 - porcentPagado
        var oilCanvas = document.getElementById("myChart");
        var oilData = {
            labels: [
                "Pagado",
                "Adeudo"
            ],
            datasets: [{
                data: [porcentPagado.toFixed(), porcentAdeudo.toFixed()],
                backgroundColor: [
                    "#8FAC19",
                    "#D8D9DA"
                ]
            }]
        };
        var chartOptions = {
            title: {
                display: false,
                text: porcentPagado.toFixed() + "%",
                fontSize: 22,
                position: 'top'
            },
            legend: {
                display: false,
            },
            borderColor: '#c6c6c6'
        };
        var pieChart = new Chart(oilCanvas, {
            type: 'pie',
            data: oilData,
            options: chartOptions
        });
        $(".label-porcent").text(porcentPagado.toFixed() + "%")
    });
}

function viewList(){
    $(".info-detail-lote").toggleClass("d-none")
    $(".payment-list").toggleClass("d-none")
    $(".ico-general, .ico-list").toggleClass("active")
}

/*Funciones para agregar a base de datos*/
function viewAlta(){
    $(".user-list").hide()
    $(".settings").hide()
    $(".add-user").show()
}

function altaUser() {
    var nameComplete = $("#nameCompleteAdd").val()
    var pass = $("#passwordAdd").val()
    var email = $("#emailAdd").val()
    var phone = $("#phoneAdd").val()
    var cellphone = $("#cellphoneAdd").val()
    var privilegys;
    var collectionImg = $("#picture2").prop("files")[0];

    if (nameComplete.length == 0 || pass.length == 0 || email.length == 0 || phone.length == 0 || cellphone.length == 0 || collectionImg == undefined) {
        alert("Llenar todos los campos o agregar imagen al usuario")
    } else {
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
                if ($("#exampleRadios3").is(":checked")) {
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
                $("#img_prev2").attr("src", "img/icon-camera.png")
                $(".user-list").show()
                $(".settings").hide()
                $(".add-user").hide()
                $("#alert-new").removeClass("d-none");
                setTimeout(function() {
                    $("#alert-new").addClass("d-none");
                }, 3000);
            });
        });
    }

}
function addTerreno() {
    var nameTerreno = $("#desarrollo").val()
    var lis = $("#list-lotes li")
    if(nameTerreno.length == 0 || lis.length == 0){
        alert("Ingrese nombre de desarrollo y al menos un lote")
    }
    else{
        var keyNew = firebase.database().ref('desarrollos/').push({
            nombreTerreno: nameTerreno
        }).key
        for(var i=0; i<lotesOn.length; i++){
            addLote(keyNew, i)
        }
        $("#desarrollo").val("")
        lotesOn = []
        getListDesarrollos()
        changeViewsAll('buscar.html')
        $("#alert-desarrollo").removeClass("d-none")
        setTimeout(function(){
            $("#alert-desarrollo").addClass("d-none")
        },3000)
    }
}

function addLote(idNewDesarrollo, i) {
    var arrayLotes = {
        clave: "L"+lotesOn[i].lote+"M"+lotesOn[i].manzana,
        lote: lotesOn[i].lote,
        manzana: lotesOn[i].manzana,
        calle: lotesOn[i].calle,
        colonia: lotesOn[i].colonia,
        delegacion: lotesOn[i].delegacion,
        propietario: "S/N",
        metros: lotesOn[i].metros,
        costoMetro: lotesOn[i].costoMetro,
        enganche: "S/N",
        fechaCompra: "S/N",
        pagosMensuales: "S/N"

    }
    var lotesKey = firebase.database().ref('lotes/').push(arrayLotes).key;
    firebase.database().ref('desarrollos/' + idNewDesarrollo + "/lotes").push(lotesKey)
}

function changeViewsAll(nameView){
    $("#wrapper-section").load("views/" + nameView)
}

function toggleView(vista1, vista2){
    $(vista1).addClass("d-none")
    $(vista2).removeClass("d-none")
}

var lotesOn = []

function addOnArray(){
    var lote = $("#lote").val()
    var manzana = $("#manzana").val()
    var calle = $("#calle").val()
    var colonia = $("#colonia").val()
    var delegacion = $("#delegacion").val()
    var metros = $("#metros").val()
    var costoMetro = $("#costo-metro").val()

    lotesOn.push({
        lote: lote,
        manzana: manzana,
        calle: calle,
        colonia: colonia,
        delegacion: delegacion,
        metros: metros,
        costoMetro: costoMetro
    })

    console.log(lotesOn)
    $("#list-lotes").append("<li>L"+lote+"M"+manzana+"</li>")
    toggleView('.add-lotes', '.new-desarrollo')
    $(".add-lotes input").val("")
}



function addClientes() {
    var nombreCliente = $("#nombre").val()
    var telefono = $("#telefono").val()
    var celular = $("#celular").val()
    var email = $("#email").val()
    var lotes = $("#lotes-by option:selected").attr("value")

    if (nombreCliente.length == 0 || telefono.length == 0 || celular.length == 0 || email.length == 0) {
        alert("Llenar todos los campos")
    } else {
        var arrayCliente = {
            nombre: nombreCliente,
            telefono: telefono,
            celular: celular,
            email: email
        }
        var keyCliente = firebase.database().ref('clientes').push(arrayCliente).key;
        firebase.database().ref('clientes/' + keyCliente + "/lotes").push(lotes)
        addLoteToClient(keyCliente, lotes)
        $("#nombre, #telefono, #celular, #email, #terreno").val("")
        toggleView('.new-client', '.view-client')
    }
}

function addLoteToClient(keyClient, lote) {
    firebase.database().ref('lotes/' + lote).update({
        propietario: keyClient
    })
}

function appendDesarrollos() {
    //Esta funcion es para seleccionar el Desarrollo al dar de alta un lote
    var starCountRef = database.ref('desarrollos/');
    starCountRef.once('value', function(snapshot) {
        var dataInfo = snapshot.val()
        $.each(dataInfo, function(indice, valor) {
            var selectOption = "<option value='" + indice + "'>" + valor.nombreTerreno + "</option>"
            $("#inlineFormCustomSelect").append(selectOption)
        });
    });
}

function appendClientes() {
    $("#lotes-by").empty()
    var arrayLotesBy = []
    var numLotesAdd = 0;
    var starCountRef = database.ref('desarrollos/'+globalKeyDesarrollo+'/lotes');
    starCountRef.once('value', function(snapshot) {
        var dataInfo = snapshot.val()
         $.each(dataInfo, function(indice, valor) {
           arrayLotesBy.push(valor)
        });
         console.log(arrayLotesBy)
        var lotesCountRef = database.ref('lotes/');
        lotesCountRef.once('value', function(snapshot) {
            var dataInfo2 = snapshot.val()
            $.each(dataInfo2, function(indice2, valor2) {
                for(var i=0; i<arrayLotesBy.length; i++){
                    if(arrayLotesBy[i] == indice2 && valor2.propietario == "S/N"){
                        numLotesAdd = numLotesAdd + 1;
                        var selectOption = "<option value='" + indice2 + "'>" + valor2.clave + "</option>"
                        $("#lotes-by").append(selectOption)
                    }
                }
            });
            if(numLotesAdd == 0){
                toggleView('.view-client', '.no-lotes')
            }
            else{
                toggleView('.view-client', '.new-client')
            }
        });
    });
}

function NosePorqueLoHiceAsi(keyClient, lote) {
    var starCountRef = database.ref('desarrollos/');
    var keyFromDesarrollo;
    starCountRef.once('value', function(snapshot) {
        var dataInfo = snapshot.val()
        $.each(dataInfo, function(indice, valor) {
            var lotesFromDesarrollo = valor.lotes
            $.each(lotesFromDesarrollo, function(indice2, valor2) {
                if (valor2 == lote) {
                    keyDesarrollo = indice
                }
            });
        });
    });
    firebase.database().ref('').update({
        propietario: key
    })
}

function addPago() {
    console.log(globalKeyLote)
    var fechaPago = $("#fecha").val()
    var montoPago = $("#monto").val()

    if (montoPago.length == 0) {
        alert("Llenar todos los campos")
    } else {
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
            $("#pagosModal").modal("hide")
            $("#monto").val("")
        });
    }
}

$.fn.sortMe = function(type, options) {
    var defaults = {
        reverse: false
    }
    var options = $.extend(defaults, options);
    var row = new Array();
    this.each(function(i) {
        row[i] = $(this).text();
    });
    if (type == "number") {
        row.sort(function(a, b) {
            return a - b;
        });
    } else if (type == "letter") {
        function case_insensitive_comp(strA, strB) {
            return strA.toLowerCase().localeCompare(strB.toLowerCase());
        }
        row.sort(case_insensitive_comp);
    } else if (type == "both") {
        function natSort(as, bs) {
            var a, b, a1, b1, i = 0,
                L, rx = /(\d+)|(\D+)/g,
                rd = /\d/;
            if (isFinite(as) && isFinite(bs)) return as - bs;
            a = String(as).toLowerCase();
            b = String(bs).toLowerCase();
            if (a === b) return 0;
            if (!(rd.test(a) && rd.test(b))) return a > b ? 1 : -1;
            a = a.match(rx);
            b = b.match(rx);
            L = a.length > b.length ? b.length : a.length;
            while (i < L) {
                a1 = a[i];
                b1 = b[i++];
                if (a1 !== b1) {
                    if (isFinite(a1) && isFinite(b1)) {
                        if (a1.charAt(0) === "0") a1 = "." + a1;
                        if (b1.charAt(0) === "0") b1 = "." + b1;
                        return a1 - b1;
                    } else return a1 > b1 ? 1 : -1;
                }
            }
            return a.length - b.length;
        }
        row.sort(natSort);
    } else {
        row.sort();
    }
    if (defaults.reverse == true) {
        row.reverse();
    }
    this.each(function(index) {
        console.log(row[index])
        for (var i = 0; i < arrayDesarrollos.length; i++) {
            if (row[index] == arrayDesarrollos[i].nombre || row[index] == arrayDesarrollos[i].id) {
                $(this).closest("li").html("<span class='number-principal' >" + arrayDesarrollos[i].id + "</span><span class='titulo-des' " +
                    " onclick=\"clientsBy(\'" + arrayDesarrollos[i].id + "\', \'" + arrayDesarrollos[i].indice + "\', \'" + arrayDesarrollos[i].nombre + "\')\">" +
                    arrayDesarrollos[i].nombre + "</span><span class='edit float-right d-none'>Pagados</span>");
            }
        }
    });
};

function ascendingOrderNumberPres(btn) {
    if ($(btn).hasClass("title")) {
        $("#list-desarrollos .titulo-des").sortMe("both", {
            reverse: false
        });
    } else {
        $("#list-desarrollos .number-principal").sortMe("number", {
            reverse: false
        });
    }
}

function searchClients() {
    var input, filter, ul, li, a, i;
    input = $("#search");
    filter = input.val().toUpperCase();
    ul = $("#list-lotes");
    li = $("li.client-account");
    for (i = 0; i < li.length; i++) {
        a = li[i];
        if ($(a).html().toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}


function exportToExcel() {
    var loteName = $(".lote-selected").text()
    $("#table-export").tableExport({
        headings: true,
        footers: true,
        formats: ["csv"],
        fileName: loteName + "_Pagos",
        bootstrap: false,
        position: "well",
        ignoreRows: null,
        ignoreCols: null
    });
    $(".tableexport-caption").addClass("hidden")
    $(".csv").trigger("click")
    $(".tableexport-caption").remove()
}

function sendEmail(){
    setTimeout(function(){
        alert("Su mensaje se envió con éxito.")
    },1300)
}

function printSheet(){
    window.print();
}

function cleanInputs(patern){
    $(patern).find("input").each(function(){
        if($(this).is('[readonly]')){
            return true;
        }
        else{
            $(this).val("")
        }
    })
}

function getFormatDate(){
    var meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
    var f = new Date();
    $("#fecha").val(meses[f.getMonth()]+"-"+f.getFullYear())
}