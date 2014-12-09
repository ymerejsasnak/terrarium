
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
    if (context.look(this.direction) === " " && (context.look(dirPlus(this.direction, 4)) === "~" &&
        context.findAll("~").length < 5 || context.findAll("~").length === 0)) { 
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



function Turtle() { //slower herbivore, but no carnivores can eat it, and it can eat flytraps!
  this.energy = 25;
  this.direction = randomElement(directionNames);
  this.color = "rgb(200," + (Math.floor(this.energy * 5)) + ",100)";
  this.moveCount = 0;
}
Turtle.prototype.act = function(context) {
  this.color = "rgb(200," + (Math.floor(this.energy * 5)) + ",100)";

  var space = context.find(" ");
  if (this.energy > 70 && space) {
    return {type: "reproduce", direction: space};
  }
  //checks if energy levels are below a certain level (only eats when hungry)
    //won't eat plant if it's the only one in its view range (to not kill them all off) 
  var plant = context.find("*");
  if (plant && this.energy < 60 && context.findAll("*").length > 1) {
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
  var flytrap = context.find("V");
  if (flytrap && this.energy < 60 && context.findAll("V").length > 1) {
    return {type: "eat", direction: flytrap};
  }
  
  if (context.look(this.direction) != " " && space) {
    this.direction = space;
  }
  this.moveCount += 1;
  if (this.moveCount % 2 === 0) { //moves every 2 turns
    return {type: "move", direction: this.direction};
  }
  
}


function Tiger() { 
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
  var prey = context.findAll("O").concat(context.findAll("2"));
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
  var carrier = context.find("&");
  if (carrier) {
    return {type: "infect", direction: carrier}
  }
  var turtle = context.find("T");
  if (turtle) {
    return {type: "infect", direction: turtle}
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
  plant = context.find("~"); //resorts to vines if no plants to eat
  if (plant && this.energy < 100 && context.findAll("~").length > 1) {
    return {type: "eat", direction: plant};  
  }
  plant = context.find("1"); //resorts to evolver1
  if (plant && this.energy < 100 && context.findAll("1").length > 1) {
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
  var prey = context.findAll("O").concat(context.findAll("2")); //eats herbivore and evolver2
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



function Carrier() { //mostly same as carnivore but randomly spawns virus upon death
  this.energy = 50;
  this.direction = randomElement(directionNames);
  this.preySeen = []; //works as queue
  this.color = "rgb(200,150,100)";
}
Carrier.prototype.act = function(context) {
  var surroundings = context.findAll("*").concat(context.findAll("~")).concat(context.findAll("V")).concat(context.findAll("O"));
  surroundings = surroundings.concat(context.findAll("@")).concat(context.findAll("1")).concat(context.findAll("2"));
  surroundings = surroundings.concat(context.findAll("3")).concat(context.findAll("&")).concat(context.findAll("T"));
  if (this.energy < 10 && surroundings.length > 0) {
    this.energy = 1;
    return {type: "infect", direction: randomElement(surroundings)}; //puts a virus randomly next to it on death
  }
  // Average number of prey seen per turn
  var seenPerTurn = this.preySeen.reduce(function(a, b) {
    return a + b;
  }, 0) / this.preySeen.length;
  var prey = context.findAll("O").concat(context.findAll("2"));
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
  if (this.energy > 120 && space) {
    return {type: "reproduce", direction: space};
  }
  if (context.look(this.direction) != " " && space) {
    this.direction = space;
  }
  return {type: "move", direction: this.direction};
}




function Spawner() { //not a lifeform, doesn't interact with others, just makes random other lifeform periodically
  this.energy = 1000;
  this.color = "white";
  this.moveCount = 0;   
}
Spawner.prototype.act = function(context) {
  this.energy = 1000; //never dies
  this.color = "rgb(" + (Math.floor(Math.random() * 255)) + 
                  "," + (Math.floor(Math.random() * 255)) + 
                  "," + (Math.floor(Math.random() * 255)) + ")";
  
  this.moveCount += 1;
  var space = context.find(" ");
  
  if (this.moveCount % 5 === 0 && space) { //every 5 moves is good??
    return {type: "reproduce", direction: space}
  }
}