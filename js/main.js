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
     console.log("entra a la funcion")
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
            /*$(".principal-user img").attr("src", dataInfo.foto)*/
        $(".principal-user span").html("<img id='img_prev' src='img/mini-user-2.png' onclick=\"edit(\'" + key + "\')\">" + dataInfo.nombre)
    });
    var starCountRef = database.ref('usuarios/');
    starCountRef.once('value', function(snapshot) {
        var dataInfo2 = snapshot.val()
        var i = 0;
        $.each(dataInfo2, function(indice, valor) {
            if (indice == idUser) {
                console.log("jiji")
            } else {
                $(".secondary-users li:eq(" + i + ")").html("<img src='img/mini-user-2.png' onclick=\"edit(\'" + indice + "\')\">" + valor.nombre)
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
 }*/
