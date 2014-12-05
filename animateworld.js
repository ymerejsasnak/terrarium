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

 
   /*redo button so it works next*/

    //this.button = node.appendChild(doc.createElement("div"));
    //this.button.style.cssText = "color: white; font-family: tahoma, arial; " +
    //  "background: #4ab; cursor: pointer; border-radius: 18px; font-size: 70%; width: 3.5em; text-align: center;";
    //this.button.innerHTML = "stop";
    var self = this;
    //this.button.addEventListener("click", function() { self.clicked(); });
    //this.disabled = false;
    //if (active) active.disable();
    active = this;
    
    this.interval = setInterval(function() { self.tick(); }, 333);
  }

  

  Animated.prototype.clicked = function() {
    if (this.disabled) return;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.button.innerHTML = "start";
    } else {
      var self = this;
      this.interval = setInterval(function() { self.tick(); }, 333);
      this.button.innerHTML = "stop";
    }
  };

  Animated.prototype.tick = function() {
    this.world.turn();
    this.world.toDivs();
  };

  Animated.prototype.disable = function() {
    this.disabled = true;
    clearInterval(this.interval);
    this.button.innerHTML = "Disabled";
    this.button.style.color = "red";
  };

  window.animateWorld = function(world) { new Animated(world); };
})();
