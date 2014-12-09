$(document).ready(function() {

  animateWorld(world);

  //start-stop handler is in animateworld function -- can i get it out and put it here??

  $("#speed").on("input", function() {
    var speedString;
    switch ($(this).val()) {
      case "1000":
        speedString = "FAST!!!";
        break;
      case "900":
        speedString = "FAST!";
        break;
      case "800":
        speedString = "fast!";
        break;
      case "700":
        speedString = "fast";
        break;
      case "600":
        speedString = "normal";
        break;
      case "500":
        speedString = "slow";
        break;
      case "400":
        speedString = "sloow";
        break;
      case "300":
        speedString = "slooow";
        break;
      case "200":
        speedString = "sloooow";
        break;
      case "100":
        speedString = "zzz...";
        break;
    }
    $("#speed-label").text("Speed: " + speedString);
    $("#start-stop").trigger("click", true);
  });


  var selectedElement = " ";  

  $("#edit-menu").on("change", function() {
    selectedElement = $(this).val();
  });

  $("#container").on("click", ".cell", function() {
    world.editCell($(this), selectedElement);
    world.drawDivs();
  });

  $("#fill-all").on("click", function() {
    world.fillAll(selectedElement);
    world.drawDivs();
  });

  $("#fill-empty").on("click", function() {
    world.fillEmpty(selectedElement);
    world.drawDivs();
  });

  $("#random").on("click", function() {
    world.randomize(selectedElement);
    world.drawDivs();
  });
   
  $("#reset").on("click", function() { 
    $("#start-stop").trigger("click", true);
    world.resetWorld(defaultWorld, legend);
    world.drawDivs();
  });


  $("#help-button").on("click", function() {
    $("#help").toggle();
    $("#about").toggle();
  });

  $("#help").on("click", function() {
    $(this).toggle();
    $("#about").toggle();
  });

  $("#about").on("click", function() {
    $(this).toggle();
    $("#help").toggle();
  });

});
