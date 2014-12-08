// test: no

(function() {
  "use strict";

  var active = null;

  function Animated(world) {
    
    this.world = world;
   
    this.world.createDivs();
   
    this.world.drawDivs();
 
    
    var self = this;
    this.disabled = false;
    if (active) active.disable();
    active = this;


    $("#start-stop").on("click", function(event, fromOtherButton) { 
      self.clicked(fromOtherButton, $("#speed").val());
    });

    

  }

  Animated.prototype.clicked = function(fromOtherButton, speed) {
    if (this.disabled) return;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      $("#start-stop").text("START");
    } else {
      if (fromOtherButton) { //reset button and speed slider will stop animation but not start it
        return;
      }
      var self = this;
      this.interval = setInterval(function() { self.tick(); }, 1010 - speed);
      $("#start-stop").text("STOP");
    }
  };

 
  Animated.prototype.tick = function() {
    this.world.turn();
    this.world.drawDivs();
  };

  Animated.prototype.disable = function() {
    $("#start-stop").disabled = true;
    clearInterval(this.interval);
    $("#start-stop").text("Disabled");
  };

  window.animateWorld = function(world) { new Animated(world); };

})();










