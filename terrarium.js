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
World.prototype.toString = function() {   //this would be the main one to refactor into outputing divs eventually
  var output = "";
  for (var y = 0; y < this.grid.height; y++) {
    for (var x = 0; x < this.grid.width; x++) {
      var element = this.grid.get(new Vector(x, y));
      output += charFromElement(element);
    }
    output += "\n";
  }
  return output;
}
World.prototype.toDivs = function() {
  for (var y = 0; y < this.grid.height; y++) {
    for (var x = 0; x < this.grid.width; x++) {
      var element = this.grid.get(new Vector(x, y));
      var character = charFromElement(element);
      var id = "#pos-" + x + "-" + y;
      var div = $(id);

      div.removeClass("empty wall1 wall2 plant smart-plant-eater tiger");
      

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
    critter.energy -= 0.1; //still loses a little energy each turn even if not moving
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
  var baby = elementFromChar(this.legend, critter.originChar);
  var dest = this.checkDestination(action, vector);
  if (dest === null || critter.energy <= 2 * baby.energy || this.grid.get(dest) != null) {
    return false;
  }
  critter.energy -= 2 * baby.energy;
  this.grid.set(dest, baby);
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


//=====================================================================
//THESE CRITTERS WORK WITH ORIGINAL WORLD OBJECT, NOT IN NEW LIFELIKE WORLD OBJECT

function WallFollower() {
  this.direction = "s";
}
WallFollower.prototype.act = function(view) {
  var start = this.direction;
  if (view.look(dirPlus(this.direction, -3)) != " ") {
    start = this.direction = dirPlus(this.direction, -2);
  }
  while (view.look(this.direction) != " ") {
    this.direction = dirPlus(this.direction, 1);
    if (this.direction === start) {
      break;
    }
  }
  return {type: "move", direction: this.direction};
}


function BouncingCritter() {
  this.direction = randomElement(directionNames);
}
BouncingCritter.prototype.act = function(view) {
  if (view.look(this.direction) != " ") {
    this.direction = view.find(" ") || "s";
  }
  return {type: "move", direction: this.direction};
}


//===================================================


//LIFELIKEWORLD CRITTERS

function Wall() {} //does nothing at all  (works in either world object)


function Plant() {
  this.energy = 3 + Math.random() * 4;
  this.color = "rgb(0," + Math.floor(this.energy * 20) + ",0)";
}
Plant.prototype.act = function(context) {
  if (this.energy > 15) {
    var space = context.find(" ");
    if (space) {
      return {type: "reproduce", direction: space};
    }
  }
  if (this.energy < 20) {
    this.color = "rgb(0," + Math.floor(this.energy * 10 + 50) + ",0)";
    return {type: "grow"};
  }
}


function PlantEater() {//currently not used
  this.energy = 20;
}
PlantEater.prototype.act = function(context) {
  var space = context.find(" ");
  if (this.energy > 60 && space) {
    return {type: "reproduce", direction: space};
  }
  var plant = context.find("*");  //plant symbol...put these into an object or something later
  if (plant) {
    return {type: "eat", direction: plant};
  }
  if (space) {
    return {type: "move", direction: space};
  }
}


function SmartPlantEater() {
  this.energy = 20;
  this.direction = randomElement(directionNames);
  this.color = "rgb(" + (180 - Math.floor(this.energy * 2)) + 
                  "," + (180 - Math.floor(this.energy * 2)) + 
                  "," + (180 - Math.floor(this.energy * 2)) + ")";
}
SmartPlantEater.prototype.act = function(context) {
  var space = context.find(" ");
  if (this.energy > 60 && space) {
    return {type: "reproduce", direction: space};
  }
  var plant = context.find("*");
  if (plant && this.energy < 70 &&     //checks if energy levels are below a certain level (only eats when hungry)
        context.findAll("*").length > 1) { //won't eat plant if it's the only one in its view range (to not kill them all off)
    this.color = "rgb(" + (180 - Math.floor(this.energy * 2)) + 
                  "," + (180 - Math.floor(this.energy * 2)) + 
                  "," + (180 - Math.floor(this.energy * 2)) + ")";
    return {type: "eat", direction: plant};
  }
  if (context.look(this.direction) != " " && space) { //goes in straight line until hits something
    this.direction = space;
  }
  return {type: "move", direction: this.direction};
}


function Tiger() {
  this.energy = 100;
  this.direction = randomElement(directionNames);
  this.preySeen = []; //works as queue
  this.color = "rgb(" + Math.floor(this.energy / 2 + 50) + "," + Math.floor(this.energy / 4) + ", 0";
}
Tiger.prototype.act = function(context) {
  // Average number of prey seen per turn
  var seenPerTurn = this.preySeen.reduce(function(a, b) {
    return a + b;
  }, 0) / this.preySeen.length;
  var prey = context.findAll("O");
  this.preySeen.push(prey.length);
  // Drop the first element from the array when it is longer than 6
  if (this.preySeen.length > 6) {
    this.preySeen.shift();
  }
  // Only eat if the predator saw more than ¼ prey animal per turn
  if (prey.length && seenPerTurn > 0.25) {
    this.color = "rgb(" + Math.floor(this.energy / 2 + 50) + "," + Math.floor(this.energy / 4) + ", 0";
    return {type: "eat", direction: randomElement(prey)};
  }
 
  var space = context.find(" ");
  if (this.energy > 400 && space) {
    return {type: "reproduce", direction: space};
  }
  if (context.look(this.direction) != " " && space) {
    this.direction = space;
  }
  return {type: "move", direction: this.direction};
}






var defaultWorld = 
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
              "*": Plant};

var world = new LifelikeWorld(defaultWorld, legend);

$(document).ready(function() {

  animateWorld(world);

  $("#reset").on("click", function() {
    location.reload();  //will have to find a better way to do this eventually
  });

  $("#clear").on("click", function() {
    
  })

});