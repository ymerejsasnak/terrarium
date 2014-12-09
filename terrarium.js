function Vector(x,y) {
  this.x = x;
  this.y = y;
}
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
}


function Grid(width, height) {
  this.space = new Array(width * height);
  this.width = width;
  this.height = height;
}
Grid.prototype.isInside = function(vector) {
  return vector.x >= 0 && vector.x < this.width &&
         vector.y >= 0 && vector.y < this.height;
}
Grid.prototype.forEach = function(f, context) {
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var value = this.space[x + y * this.width];
      if (value != null)
        f.call(context, value, new Vector(x , y));
    }
  }
}
Grid.prototype.get = function(vector) {
  return this.space[vector.x + this.width * vector.y]; //formula for reaching proper vector since not using multi-dimensional array
                                                       //multiply y value times width to go down that many rows, then add x to go over
}
Grid.prototype.set = function(vector, value) {
  this.space[vector.x + this.width * vector.y] = value;
}


function World(map, legend) {
  var grid = new Grid(map[0].length, map.length);
  this.grid = grid;
  this.legend = legend;
  
  map.forEach(function(line, y) {
    for (var x = 0; x < line.length; x++) {
      grid.set(new Vector(x, y), elementFromChar(legend, line[x]));
    }
  });
}
World.prototype.turn = function() {
  var acted = [];
  this.grid.forEach(function(critter, vector) {
    if (critter.act && acted.indexOf(critter) === -1) {
      acted.push(critter);
      this.letAct(critter, vector);
    }
  }, this);
}
World.prototype.letAct = function(critter, vector) {
  var action = critter.act(new View(this, vector));
  if (action && action.type == "move") {
    var dest = this.checkDestination(action, vector);
    if (dest && this.grid.get(dest) === null) {
      this.grid.set(vector, null);
      this.grid.set(dest, critter);
    }
  }
}
World.prototype.checkDestination = function(action, vector) {
  if (directions.hasOwnProperty(action.direction)) {
    var dest = vector.plus(directions[action.direction]);
    if (this.grid.isInside(dest)) {
      return dest;
    }
  }
}
World.prototype.createDivs = function() {
    for (var y = 0; y < world.grid.height; y++) {
      for (var x = 0; x < world.grid.width; x++) {
        var id = "pos-" + x + "-" + y;
        $("#container").append("<div class='cell' id=" + id + "></div>");
      }
    }
}
World.prototype.drawDivs = function() {
  for (var y = 0; y < this.grid.height; y++) {
    for (var x = 0; x < this.grid.width; x++) {
      var element = this.grid.get(new Vector(x, y));
      var character = charFromElement(element);
      var id = "#pos-" + x + "-" + y;
      var div = $(id);

      div.removeClass("empty wall1 wall2 plant vine smart-plant-eater tiger virus flytrap evolver1 evolver2 evolver3 carrier");
      //probably delete the class change...only class used is wall1 and wall2

      switch (character) {
      case " ":
        div.addClass("empty");
        div.text(" ");
        break;
      case "#":
        if (y % 2 === 0) {
          div.addClass("wall1");
        } else {
          div.addClass("wall2");
        }
        div.text(" "); //wall is just background color
        break;
      case "*":
        div.addClass("plant");
        div.text("\u00A5"); //yen symbol looks like a plant!! :)
        div.css("color", element.color);
        break;
      case "O":
        div.addClass("smart-plant-eater");
        div.text("\u0264"); //'ram's horns' looks like rabbit
        div.css("color", element.color);
        break;
      case "@":
        div.addClass("tiger");
        div.text("\u0434");
        div.css("color", element.color);
        break;
      case "~":
        div.addClass("vine");
        div.text(character);
        div.css("color", element.color);
        break;
      case "x":
        div.addClass("virus");
        div.text(character);
        div.css("color", element.color);
        break;
      case "V":
        div.addClass("flytrap");
        div.text("v");
        div.css("color", element.color);
        break;
      case "1":
        div.addClass("evolver1");
        div.text("\u00A5"); //like plant
        div.css("color", element.color);
        break;
      case "2":
        div.addClass("evolver2");
        div.text("\u0264"); //like herbivore
        div.css("color", element.color);
        break;
      case "3":
      div.addClass("evolver3");
        div.text("\u0434"); //like carnivore
        div.css("color", element.color);
        break;
      case "&":
      div.addClass("carrier");
        div.text("\u0434"); //like carnivore
        div.css("color", element.color);
        break;
      }
    }
  }
}
World.prototype.resetWorld = function(map, legend) {
  var grid = new Grid(map[0].length, map.length);
  this.grid = grid;
  this.legend = legend;

  map.forEach(function(line, y) {
    for (var x = 0; x < line.length; x++) {
      grid.set(new Vector(x, y), elementFromChar(legend, line[x]));
    }
  });
}
World.prototype.clearWorld = function() {
  for (var y = 1; y < this.grid.height - 1; y++) {
    for (var x = 1; x < this.grid.width - 1; x++) {
      this.grid.set(new Vector(x, y), null);
    }
  }      
}
World.prototype.editCell = function(cell, character) {
  var id = cell.attr("id")           //format:  "#pos-" + x + "-" + y;
  var x = parseInt(id.slice(id.indexOf("-") + 1, id.lastIndexOf("-"))); 
  var y = parseInt(id.slice(id.lastIndexOf("-") + 1));
  if (x === 0 || y === 0 || x === this.grid.width - 1 || y === this.grid.height - 1) { //can't edit outer walls
    return;
  }
  var position = new Vector(x, y);
  var element = elementFromChar(this.legend, character);

  //revert to empty cell if it's already the selected type
  if (element && this.grid.get(position) && this.grid.get(position).originChar === element.originChar) {
    this.grid.set(position, null);
  } else {
    this.grid.set(position, element);
  }
}
World.prototype.randomize = function(character) {
  for (var y = 1; y < this.grid.height - 1; y++) {
    for (var x = 1; x < this.grid.width - 1; x++) {
      if (Math.floor(Math.random() * 200) === 0) {  //.5% chance good?
        this.grid.set(new Vector(x, y), elementFromChar(this.legend, character));
      }
    }
  }
}



function LifelikeWorld(map, legend) {
  World.call(this, map, legend);
}
LifelikeWorld.prototype = Object.create(World.prototype);

LifelikeWorld.prototype.letAct = function(critter, vector) {
  var action = critter.act(new View(this, vector));
  var handled = action && action.type in actionTypes && 
                actionTypes[action.type].call(this, critter, vector, action);
  if (!handled) {
    critter.energy -= 0.2;
    if (critter.energy <= 0) {
      this.grid.set(vector, null);
    }
  }
}







var actionTypes = Object.create(null);

actionTypes.grow = function(critter) {
  critter.energy += 0.5;
  return true;
}

actionTypes.move = function(critter, vector, action) {
  var dest = this.checkDestination(action, vector);
  if (dest === null || critter.energy <= 1 || this.grid.get(dest) != null) {
    critter.energy -= 0.1; //still loses a little energy each turn even if not moving (carnivores stuck in plants may die)
    return false;
  }
  critter.energy -= 1;
  this.grid.set(vector, null);
  this.grid.set(dest, critter);
  return true;
}

actionTypes.eat = function(critter, vector, action) {
  var dest = this.checkDestination(action, vector);
  var atDest = dest != null && this.grid.get(dest);
  if (!atDest || atDest.energy === null) {
    return false;
  }
  critter.energy += atDest.energy;
  this.grid.set(dest, null);
  return true;
}

actionTypes.reproduce = function(critter, vector, action) {
  var character = critter.originChar;
  if (critter.originChar === "3") { //evolver3 makes evolver1
    character = "1";
  }
  var baby = elementFromChar(this.legend, character);
  var dest = this.checkDestination(action, vector);
  if (dest === null || critter.energy <= 2 * baby.energy || this.grid.get(dest) != null) {
    return false;
  }
  critter.energy -= 2 * baby.energy;
  this.grid.set(dest, baby);
  return true;
}

actionTypes.infect = function(critter, vector, action) {
  var baby = elementFromChar(this.legend, "x");
  var dest = this.checkDestination(action, vector);
  //baby energy not subtracted, just straight value
  critter.energy -= 1;
  this.grid.set(dest, baby);
  return true;
}

actionTypes.evolve = function(critter, vector, action) {
  var form = critter.originChar;
  if (form === "1") {
    form = "2";
  } else if (form === "2") {
    form = "3";
  }
  this.grid.set(vector, elementFromChar(this.legend, form));
  return true;
}





function elementFromChar(legend, ch) {
  if (ch === " ") {
    return null;
  }
  var element = new legend[ch]();
  element.originChar = ch;
  return element;
}

function charFromElement(element) {
  if (element === null) {
    return " ";
  } else {
    return element.originChar;
  }
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}


function View(world, vector) {
  this.world = world;
  this.vector = vector;
}
View.prototype.look = function(dir) {
  var target = this.vector.plus(directions[dir]);
  if (this.world.grid.isInside(target)) {
    return charFromElement(this.world.grid.get(target));
  } else {
    return "#";
  }
}
View.prototype.findAll = function(ch) {
  var found = [];
  for (var dir in directions) {
    if (this.look(dir) == ch) {
      found.push(dir);
    }
  }
  return found;
}
View.prototype.find = function(ch) {
  var found = this.findAll(ch);
  if (found.length == 0) {
    return null;
  }
  return randomElement(found);
}


var directions = {
  "n":  new Vector( 0, -1),
  "ne": new Vector( 1, -1),
  "e":  new Vector( 1,  0),
  "se": new Vector( 1,  1),
  "s":  new Vector( 0,  1),
  "sw": new Vector(-1,  1),
  "w":  new Vector(-1,  0),
  "nw": new Vector(-1, -1)
}

var directionNames = "n ne e se s sw w nw".split(" ");


function dirPlus(dir, n) { //direction is from above list, n is number of 45degree turns from that direction
  var index = directionNames.indexOf(dir);
  return directionNames[(index + n + 8) % 8];
}
















var defaultWorld =  //fairly balanced world that only uses 3 of the lifeforms
  ["##############################################################",
   "#  @             ###   ####            ##****              ###",
   "#   *     ##                           ##    ##       OO    ##",
   "#   *    ##        O O                       ##  ****       *#",
   "#       ##*                            ***** ##########     *#",
   "#      ##***  *         ****  @                            **#",
   "#* **  #  *  ***      #########        @                   **#",
   "#* **  #           *          O O      *                   **#",
   "#          ##                              ***          ######",
   "#*         ###   @           @     O O      *        O  #    #",
   "#*                         #####     ####                 ** #",
   "###          ****               ***  **                   ** #",
   "#       O   ###                                      O       #",
   "#   *     ####### ##  ##                 O       ###      *  #",
   "#   **         ####           *          O  O   #####  O     #",
   "##  **  O   O  ####    ***  ***                  ###      ** #",
   "###            ####   *****                              ****#",
   "##############################################################"];   //size: 62 width, 18 height

var legend = {"#": Wall,
              "@": Tiger,
              "O": SmartPlantEater,
              "*": Plant,
              "~": Vine,
              "x": Virus,
              "V": Flytrap,
              "1": EvolverPlant,
              "2": EvolverHerbivore,
              "3": EvolverCarnivore,
              "&": Carrier};

var world = new LifelikeWorld(defaultWorld, legend);









