// test: no

(function() {
  "use strict";

  var active = null;

  function Animated(world) {
    this.world = world;
    var outer = document.body;
    var doc = outer.ownerDocument;

    //create empty world divs first 
    for (var y = 0; y < world.grid.height; y++) {
      for (var x = 0; x < world.grid.width; x++) {

        var id = "pos-" + x + "-" + y;
        $("#container").append("<div id=" + id + "></div>");
      }
    }
   
    this.world.toDivs();
 
    var startStop = $("#start-stop");/*redo button so it works next*/
    startStop.text("STOP");
    
    startStop.on("click", function() { 
      self.clicked(); 
    });

    var self = this;
    this.disabled = false;
    if (active) active.disable();
    active = this;

    this.interval = setInterval(function() { self.tick(); }, 333);
  }

  Animated.prototype.clicked = function() {
    if (this.disabled) return;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      $("#start-stop").text("START");
    } else {
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
