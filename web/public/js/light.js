var lightbutton = document.getElementById("lightbtn");
var lights = 0;
$('#lightbtn').click(function() {toggleLights()});

function toggleLights() { 
  if (lights == 0){
    //lightson
    lights = 1;
    lightbutton.style.color = "#F2FF00";
    console.log("lights on")
  }
  else{
    //lightsoff
    lights = 0;
    lightbutton.style.color = "#BBBBBB";
  }
}