// Overlaid on faces
var overlay = "💩";

// These will contain our canvas context later
var canvas, ctx;

// We'll populate this later
// clarifaiFaces gives us values between 0 and 1
// realFaces will store the real pixel positioning relative to the image size
var imageDetails = {
  clarifaiFaces: [],
  realFaces: []
};

// Initialize a new Clarifai app
var app = new Clarifai.App(cId, cSec);

// When there's an image in the input, grab the file and do the following: 
// 1. Convert image to Base-64 and store in imageDetails.b64
// 2. Populate the image tag with the Base-64 string
// 3. Create a copy of the Base-64 string which can be sent to Clarifai in imageDetails.b64Clarifai
$("input#image").on("change", function() {
  if(this.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      imageDetails.b64 = e.target.result;
      $("img").attr("src", imageDetails.b64);
      imageDetails.b64Clarifai = imageDetails.b64.replace(/^data:image\/(.*);base64,/, '');
      imageDetails.width = $("img").width();
      imageDetails.height = $("img").height();
      faceDetection(imageDetails.b64Clarifai);
    }
    reader.readAsDataURL(this.files[0]);
  }
});

// This function calls the face detection alpha model and pushes the bounding boxes to imageDetails.clarifaiFaces
function faceDetection(b64Img) {
  app.models.predict("a403429f2ddf4b49b307e318f00e528b", {
    base64: b64Img
  }).then(
    function(res) {
      var data = res.outputs[0].data.regions;
      if (data !== null) {
        for (var i = 0; i < data.length; i++) {
          imageDetails.clarifaiFaces.push(data[i].region_info.bounding_box);
        }
      }
      drawBoxes();
    },
    function(err) {
      console.log(err);
    }
  )
}

// We draw a HTML Canvas and make it the the same size as the image
function drawBoxes() {
  canvas = document.getElementById("canvas");
  $(canvas).attr("width", imageDetails.width).attr("height", imageDetails.height);
  ctx = canvas.getContext("2d");
  ctx.textBaseline = "top";

  // For each bounding box we calculate the 'real' coordinates (x, y, width, height) of the faces and push the overlay emoji on top of it
  for(var i=0; i<imageDetails.clarifaiFaces.length; i++) {
    box = {
      x: imageDetails.clarifaiFaces[i].left_col * imageDetails.width,
      y: imageDetails.clarifaiFaces[i].top_row * imageDetails.height,
      w: (imageDetails.clarifaiFaces[i].right_col * imageDetails.width) - (imageDetails.clarifaiFaces[i].left_col * imageDetails.width),
      h: (imageDetails.clarifaiFaces[i].bottom_row * imageDetails.height) - (imageDetails.clarifaiFaces[i].top_row * imageDetails.height)
    }
    imageDetails.realFaces.push(box);
    ctx.font = (box.w * 1.4) + "px monospace";
    ctx.fillText(overlay, box.x - (box.w / 5), box.y - (box.h/4));
  }
}








