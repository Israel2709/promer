 // Initialize Firebase


 var storage = firebase.storage();

 // Create a storage reference from our storage service
 var storageRef = storage.ref();

 // Create a child reference
 var imagesRef = storageRef.child('images');
 // imagesRef now points to 'images'

 var database = firebase.database();


 function getUsers() {
     var starCountRef = database.ref('Usuarios/');
     starCountRef.once('value', function(snapshot) {
         console.log(snapshot)
     });
 }

 function changeView(nameView) {
     var nameViews = $(nameView).text()
     if (nameViews == "login") {
        window.location.href = 'index.html';
     } else {
         $("#wrapper-section").load("views/" + nameViews)
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

 function updateUser(idUser) {
     var starCountRef = database.ref('usuarios/' + idUser);
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
                 firebase.database().ref('usuarios/' + idUser).update(newInfo);
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
