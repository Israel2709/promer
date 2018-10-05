/*Firebase controllers*/

var storage = firebase.storage();
var storageRef = storage.ref();

// Create a child reference
var imagesRef = storageRef.child('images');
// imagesRef now points to 'images'

var database = firebase.database();