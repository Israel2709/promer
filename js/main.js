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
     });c
 }

 function changeView(nameView) {
     var nameViews = $(nameView).text()
     if (nameViews == "Login") {
         /*window.location.href = 'index.html';*/
         console.log("incio")
     } else {
         $("#wrapper-section").load("views/" + nameViews + ".html")
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
     debugger
     var nameComplete = $("#nameComplete").val()
     var pass = $("#password").val()
     var email = $("#email").val()
     var phone = $("#phone").val()
     var cellphone = $("#cellphone").val()
     var privilegys;
     var collectionImg = $("#img_prev").prop("files")[0];
     var imagesRefName = storageRef.child('usersPhoto/' + nameComplete);
     var uploadTask = imagesRefName.put(collectionImg);
     uploadTask.on('state_changed', function(snapshot) {
         var progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
         console.log(progress)
     }, function(error) {
         console.log("error")
     }, function() {
         uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
             var collectionCover = downloadURL;
             if ($("#exampleRadios1").is(":checked")) {
                 privilegys = "S"
             } else {
                 privilegys = "N"
             }
             var collectionObject = {
                 nombre: nameComplete,
                 foto: collectionCover,
                 privilegios: privilegys,
                 correo: email,
                 telefono: phone,
                 celular: cellphone,
                 passwordUser: pass
             };
             firebase.database().ref('usuarios/').push(collectionObject);
         });
     });
 }