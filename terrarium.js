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

      div.removeClass("empty wall1 wall2 plant vine smart-plant-eater tiger virus conway flytrap evolver1 evolver2 evolver3");
      

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
        div.text(character);
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
      case "C":
        div.addClass("conway");
        div.text("=");
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
    character = "1"
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
  var baby = elementFromChar(this.legend, critter.originChar);
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






















//LIFELIKEWORLD CRITTERS

function Wall() {} //does nothing at all  (works in either world object)


function Plant() {
  this.energy = 3 + Math.random() * 4;
  this.color = "rgb(0," + Math.floor(this.energy * 10 + 50) + ",0)";
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


function Vine() { //wall hugging plant()
  this.energy = 2 + Math.random() * 2;
  this.direction = randomElement(directionNames);
  this.color = "rgb(0," + Math.floor(this.energy * 10) + ",99)";
}
Vine.prototype.act = function(context) {
  if (this.energy > 5) {
    var start = this.direction;
    //reproduces in more line-like patterns
    if (context.look(this.direction) === " " && context.look(dirPlus(this.direction, 4)) === "~" &&
        context.findAll("~").length < 5 || context.findAll("~").length === 0) { 
      return {type: "reproduce", direction: this.direction};
    } else {
      this.direction = dirPlus(this.direction, 1);
    }
    
  }
  if (this.energy < 15) {

    this.color = "rgb(0," + Math.floor(this.energy * 10) + ",99)";
    return {type: "grow"};
  }
}


function SmartPlantEater() {
  this.energy = 20;
  this.direction = randomElement(directionNames);
  this.color = "rgb(" + (Math.floor(this.energy * 3)) + 
                  "," + (Math.floor(this.energy * 3)) + 
                  "," + (Math.floor(this.energy * 3)) + ")";
}
SmartPlantEater.prototype.act = function(context) {
  this.color = "rgb(" + (Math.floor(this.energy * 3)) + 
                  "," + (Math.floor(this.energy * 3)) + 
                  "," + (Math.floor(this.energy * 3)) + ")";

  var space = context.find(" ");
  if (this.energy > 60 && space) {
    return {type: "reproduce", direction: space};
  }
  //checks if energy levels are below a certain level (only eats when hungry)
    //won't eat plant if it's the only one in its view range (to not kill them all off) 
  var plant = context.find("*");
  if (plant && this.energy < 70 && context.findAll("*").length > 1) {
    return {type: "eat", direction: plant};
  }
  var plant = context.find("~"); //resorts to vines if no plants to eat
  if (plant && this.energy < 60 && context.findAll("~").length > 1) {
    return {type: "eat", direction: plant};  
  }
  var evolverPlant = context.find("1"); //lastly will eat an evolvers in plant form
  if (evolverPlant && this.energy < 60 && context.findAll("1").length > 1) {
    return {type: "eat", direction: evolverPlant};  
  }
  if (context.look(this.direction) != " " && space) { //goes in straight line until hits something
    this.direction = space;
  }
  return {type: "move", direction: this.direction};
}


function Tiger() { //!!!!need to add code so it will eat herbivore evolver too!!!!!!!!!!!!!!!!!!!
  this.energy = 100;
  this.direction = randomElement(directionNames);
  this.preySeen = []; //works as queue
  this.color = "rgb(" + Math.floor(this.energy / 2 + 50) + "," + Math.floor(this.energy / 4) + ", 0";
}
Tiger.prototype.act = function(context) {
  this.color = "rgb(" + Math.floor(this.energy / 2 + 50) + "," + Math.floor(this.energy / 4) + ", 0";
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


function Virus() {
  this.energy = 2;
  this.direction = randomElement(directionNames);
  this.color = "rgb(0,0,0)";
}
Virus.prototype.act = function(context) {
  
  //attacks top of food chain first...energy level doesn't matter
  var carnivore = context.find("@");
  if (carnivore) {
    return {type: "infect", direction: carnivore};
  }
  var herbivore = context.find("O");
  if (herbivore) {
    return {type: "infect", direction: herbivore};
  }
  var flytrap = context.find("V");
  if (flytrap) {
    return {type: "infect", direction: flytrap};
  }
  var plant = context.find("*");
  if (plant) {
    return {type: "infect", direction: plant};
  }
  var vine = context.find("~");
  if (vine) {
    return {type: "infect", direction: vine};
  }
  var evolver1 = context.find("1");
  if (evolver1) {
    return {type: "infect", direction: evolver1}
  }
  var evolver2 = context.find("2");
  if (evolver2) {
    return {type: "infect", direction: evolver2}
  }
  var evolver3 = context.find("3");
  if (evolver3) {
    return {type: "infect", direction: evolver3}
  }

  var space = context.find(" "); //random movement
  if (space) {
    return {type: "move", direction: space};
  }
}


function Flytrap() { //carnivorous plant, doesn't move, eats animals to grow/reproduce
  this.energy = Math.random() * 10 + 10;
  this.color = "rgb(" + Math.floor(this.energy * 2 + 50) + "," + Math.floor(this.energy * 5 + 50) + ", 50";
}
Flytrap.prototype.act = function(context) {
  if (this.energy > 40){
    this.energy = 40; //reset energy so it doesn't reproduce too much when eating animals with lots of energy;
  }

  this.color =  "rgb(" + Math.floor(this.energy * 2 + 50) + "," + Math.floor(this.energy * 5 + 50) + ", 50";
  var herbivore = context.find("O");
  if (herbivore) {
    return {type: "eat", direction: herbivore};
  }
  var evolver2 = context.find("2");
  if (evolver2) {
    return {type: "eat", direction: evolver2};
  }
  var carnivore = context.find("@");
  if (carnivore) {
    return {type: "eat", direction: carnivore};
  }
  var evolver3 = context.find("3");
  if (evolver3) {
    return {type: "eat", direction: evolver3};
  }
  var space = context.find(" ");
  if (space && this.energy > 30) {
    return {type: "reproduce", direction: space};
  }
}


function EvolverPlant() {
  this.energy = 3 + Math.random() * 3;
  this.color = "blue";
}
EvolverPlant.prototype.act = function(context) {
  if (this.energy >= 16) {
    return {type: "evolve"};
  }
  if (this.energy < 16) {
    return {type: "grow"};
  }
}

function EvolverHerbivore() {
  this.energy = 20;
  this.direction = randomElement(directionNames);
  this.color = "blue";
}
EvolverHerbivore.prototype.act = function(context) {
  if (this.energy > 100) {
    return {type: "evolve"};
  }
  var plant = context.find("*");
  if (plant && this.energy < 100 && context.findAll("*").length > 1) {
    return {type: "eat", direction: plant};
  }
  var plant = context.find("~"); //resorts to vines if no plants to eat
  if (plant && this.energy < 100 && context.findAll("~").length > 1) {
    return {type: "eat", direction: plant};  
  }
  var space = context.find(" ");
  if (context.look(this.direction) != " " && space) { //goes in straight line until hits something
    this.direction = space;
  }
  return {type: "move", direction: this.direction};
}

function EvolverCarnivore() {
  this.energy = 100;
  this.direction = randomElement(directionNames);
  this.preySeen = []; //works as queue just like carnivore
  this.color = "blue";
}
EvolverCarnivore.prototype.act = function(context) {
  var seenPerTurn = this.preySeen.reduce(function(a, b) {
    return a + b;
  }, 0) / this.preySeen.length;
  var prey = context.findAll("O");
  this.preySeen.push(prey.length);
  if (this.preySeen.length > 6) {
    this.preySeen.shift();
  }
  if (prey.length && seenPerTurn > 0.25) {
    return {type: "eat", direction: randomElement(prey)};
  }

  var space = context.find(" ");
  if (this.energy > 150 && space) {
    this.energy = 100; //cut energy when reproducing otherwise will reproduce too much
    return {type: "reproduce", direction: space};
  }
  if (context.look(this.direction) != " " && space) {
    this.direction = space;
  }
  return {type: "move", direction: this.direction};
}




  

  
function ConwayCell() { //doesn't interact with other elements other than blocking them...just spreads around and looks cool
  this.energy = 1;
  var grayness = Math.floor(Math.random() * 255);
  this.color = "rgb(" + grayness + "," + grayness + "," + grayness + ")";
}
ConwayCell.prototype.act = function(context) {
  var neighbors = context.findAll("C");
  if (neighbors.length < 2 || neighbors.length > 3) {
    this.energy = 0;
    return;
  }
  //can't implement this properly unless I make empty cells check for conway cells and turn into it if rule applies....so random:
  var space = context.find(" ");
  if (space) {
    this.energy = 3;
    return {type: "reproduce", direction: space};
  } 
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
              "C": ConwayCell,
              "V": Flytrap,
              "1": EvolverPlant,
              "2": EvolverHerbivore,
              "3": EvolverCarnivore};

var world = new LifelikeWorld(defaultWorld, legend);






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


  $("#clear").on("click", function() {
    world.clearWorld();
    world.drawDivs();
  });
  

  var selectedElement = " ";  

  $("#edit-menu").on("change", function() {
    selectedElement = $(this).val();
  });

  $("#container").on("click", ".cell", function() {
    world.editCell($(this), selectedElement);
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

});









//=====================================================================
//THESE CRITTERS WORK WITH ORIGINAL WORLD OBJECT, NOT IN NEW LIFELIKE WORLD OBJECT
//saved for the wall following code to use in future critter

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

