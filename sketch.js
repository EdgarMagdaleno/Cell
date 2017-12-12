var Engine = Matter.Engine,
	Render = Matter.Render,
	Runner = Matter.Runner,
	Composite = Matter.Composite,
	Common = Matter.Common,
	Constraint = Matter,
	MouseConstraint = Matter.MouseConstraint,
	Mouse = Matter.Mouse,
	World = Matter.World,
	Bodies = Matter.Bodies;

var engine = Engine.create(),
	world = engine.world;

var render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		width: 2000,
		height: 600,
		showAngleIndicator: true
	}
});

Render.run(render);

var runner = Runner.create({
	delta: 0.01,
	isFixed: false,
    enabled: true
});
Runner.run(runner, engine);

World.add(world, [
	Bodies.rectangle(400, 0, 3000, 50, { isStatic: true }),
	Bodies.rectangle(400, 600, 3000, 50, { isStatic: true }),
	Bodies.rectangle(1900, 300, 50, 600, { isStatic: true }),
	Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
]);

var mouse = Mouse.create(render.canvas),
	mouseConstraint = MouseConstraint.create(engine, {
		mouse: mouse,
		constraint: {
			angularStiffness: 0,
			render: {
				visible: false
			}
		}
	});

World.add(world, mouseConstraint);

render.mouse = mouse;

Render.lookAt(render, {
	min: { x: 0, y: 0 },
	max: { x: 2000, y: 600 }
});

rnd = function(max, min) {
	return Math.floor((Math.random() * (max - min)) + min);
}

rnd_float = function(max, min) {
	return (Math.random() * (max - min)) + min;
}

var Creature = function() {
	this.nodes = [];
	this.muscles = [];
	var self = this;

	this.build = function() {
	    this.nodes.length = rnd(4, 6);

		for(let i = 0; i < this.nodes.length; i++) {
			this.nodes[i] = Bodies.circle(rnd(300, 140), rnd(300, 140), 20);
			this.nodes[i].friction = rnd_float(0.99, 0.01);
			Matter.Body.setMass(this.nodes[i], 0.5);
		}

		for(let i = 0; i < this.nodes.length - 1; i++) {
			this.muscles[i] =  Matter.Constraint.create({
				pointA: {
					x : 0,
					y : 0
				},
				pointB: {
					x : 0,
					y : 0 
				},
				bodyA: this.nodes[i],
				bodyB: this.nodes[i + 1],
				stiffness: rnd_float(0.2, 0.01),
				length: rnd(100, 70),
				extended_length : rnd(length, length + 50)
			});
		}

		let n = rnd(this.nodes.length - 1, 1);
		for(let i = 0; i < n; i++) {
			let index = rnd(this.nodes.length, 0);
			let index2 = 0;

			let correct = false;
			count = 0;
			do {
				index2 = rnd(this.nodes.length, 0);
				count++;

				if(count > 100) {
					while(true) {}
				}
			} while(index2 == index || index2 == index - 1 || index2 == index + 1);

			this.muscles.push(Matter.Constraint.create({
				pointA: {
					x : 0,
					y : 0
				},
				pointB: {
					x : 0,
					y : 0 
				},
				bodyA: this.nodes[index],
				bodyB: this.nodes[index2],
				stiffness: rnd_float(0.2, 0.01),
				length: rnd(100, 70),
				extended_length : rnd(length, length + 50)
			}));
		}
	}

	this.contract = function() {
		for(let i = 0; i < self.muscles.length; i++) {
			let tmp = self.muscles[i].length;
			self.muscles[i].length = self.muscles[i].extended_length;
			self.muscles[i].extended_length = tmp;
		}
	}

	this.spawn = function() {
		for(let i = 0; i < this.nodes.length; i++) {
			World.add(world, this.nodes[i]);
		}

		for(let i = 0; i < this.muscles.length; i++) {
			World.add(world, this.muscles[i]);
		}

		var start = engine.timing.timestamp;
		Matter.Events.on(engine, "afterUpdate", function() {
			if(engine.timing.timestamp - start > 5000) {
				self.despawn();
				engine.events = {};
			}
		});
	}

	this.fitness = -1;

	this.mutate = function(){
		console.log("Mutate");
		var chance = rnd(3, 0);
		var increment;
		//cambiar el stiffness
		if(chance == 0){
			chance = rnd(this.muscles.length - 1, 0);
			this.muscles[chance].stiffness = this.muscles[chance].stiffness - 0.05 + 0.1*Math.Random();
		}
		//cambiar el length
		else if(chance == 1){
			chance = rnd(this.muscles.length -1, 0);
			increment = rnd(0, 20);
			this.muscles[chance].length = this.muscles[chance].length - 10 + increment;
			if(this.muscles[chance].length >= this.muscles[chance].extended_length)
				this.muscles[chance].extended_length = this.muscles[chance].extended_length - 10 + increment;
		}
		//cambiar el ext length
		else if(chance == 2){
			chance = rnd(this.muscles.length - 1, 0);
			increment = rnd(30, 0);
			this.muscles[chance].extended_length = this.muscles[chance].extended_length - 15 + increment;
			if(this.muscles[chance].extended_length <= this.muscles[chance].length)
				this.muscles[chance].length = this.muscles[chance].length - 15 + increment;
		}
		else{
			chance = rnd(0, nodes.length-1);
			nodes[chance].position.x = nodes[chance].position.x - 15 + rnd(30, 0);
			nodes[chance].position.y = nodes[chance].position.y - 15 + rnd(30, 0);
		}
	}

	this.calculate_fitness = function(callback) {
		let n = this.nodes.length;
		let sum = 0;
		self.nodes.forEach(function(element) {
			sum += element.position.x;
		});
	
		return callback(sum / n);
	}

	this.interval = setInterval(this.contract, 200);

	this.despawn = function() {
		self.calculate_fitness(function(fitness) {
			self.nodes.forEach(function(element) {
				Composite.remove(world, element);
			});

			self.muscles.forEach(function(element) {
				Composite.remove(world, element);
			});

			self.fitness = fitness;
		});
	}
}

start = function() {
	engine.timing.timeScale = 1;
	let c = new Creature();
	c.build();
	c.spawn();
}

start();