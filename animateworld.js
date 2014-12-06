// test: no

(function() {
  "use strict";

  var active = null;

  function Animated(world) {
    
    this.world = world;
    
    //create empty world divs first 
    for (var y = 0; y < world.grid.height; y++) {
      for (var x = 0; x < world.grid.width; x++) {

        var id = "pos-" + x + "-" + y;
        $("#container").append("<div class='cell' id=" + id + "></div>");
      }
    }
   
    this.world.toDivs();
 

    var self = this;
    this.disabled = false;
    if (active) active.disable();
    active = this;


    $("#start-stop").on("click", function(event, reset) { 
      self.clicked(reset); 
    });

    
  }

  Animated.prototype.clicked = function(reset) {
    if (this.disabled) return;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      $("#start-stop").text("START");
    } else {
      if (reset) { //if reset is true it means the reset button triggered this so don't start it
        return;
      }
      var self = this;
      this.interval = setInterval(function() { self.tick(); }, 333);
      $("#start-stop").text("STOP");
    }
  };

  Animated.prototype.tick = function() {
    this.world.turn();
    this.world.toDivs();
  };

  Animated.prototype.disable = function() {
    $("#start-stop").disabled = true;
    clearInterval(this.interval);
    $("#start-stop").text("Disabled");
  };

  window.animateWorld = function(world) { new Animated(world); };

})();










