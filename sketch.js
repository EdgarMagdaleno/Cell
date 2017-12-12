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
		height: 600
	}
});

Render.run(render);

var runner = Runner.create({
	isFixed: false,
    enabled: true
});
Runner.run(runner, engine);

World.add(world, [
	Bodies.rectangle(400, 0, 3000, 50, {
		collisionFilter : {
			group : 1
		},
		isStatic: true
	}),
	Bodies.rectangle(400, 600, 3000, 50, {
		collisionFilter : {
			group : 1
		},
		isStatic: true
	}),
	Bodies.rectangle(1900, 300, 50, 600, {
		collisionFilter : {
			group : 1
		},
		isStatic: true
	}),
	Bodies.rectangle(0, 300, 50, 600, {
		collisionFilter : {
			group : 1
		},
		isStatic: true
	}),
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

rnd = function(max, min) {
	return Math.floor((Math.random() * (max - min)) + min);
}

rnd_float = function(max, min) {
	return (Math.random() * (max - min)) + min;
}

function deepClone(obj, hash = new WeakMap()) {
    // Do not try to clone primitives or functions
    if (Object(obj) !== obj || obj instanceof Function) return obj;
    if (hash.has(obj)) return hash.get(obj); // Cyclic reference
    try { // Try to run constructor (without arguments, as we don't know them)
        var result = new obj.constructor();
    } catch(e) { // Constructor failed, create object without running the constructor
        result = Object.create(Object.getPrototypeOf(obj));
    }
    // Optional: support for some standard constructors (extend as desired)
    if (obj instanceof Map)
        Array.from(obj, ([key, val]) => result.set(deepClone(key, hash), 
                                                   deepClone(val, hash)) );
    else if (obj instanceof Set)
        Array.from(obj, (key) => result.add(deepClone(key, hash)) );
    // Register in hash    
    hash.set(obj, result);
    // Clone and assign enumerable own properties recursively
    return Object.assign(result, ...Object.keys(obj).map (
        key => ({ [key]: deepClone(obj[key], hash) }) ));
}

var Creature = function() {
	this.nodes = [];
	this.initial_position = [];
	this.muscles = [];
	var self = this;

	this.reset_position = function() {
		this.nodes.forEach(function(element, i) {
			Matter.Body.setPosition(element, {
				x: self.initial_position[i].x,
				y: self.initial_position[i].y
			});
		});
	}

	this.build = function() {
	    this.nodes.length = rnd(4, 6);

		for(let i = 0; i < this.nodes.length; i++) {
			this.nodes[i] = Bodies.circle(rnd(300, 140), rnd(300, 140), 20, {
                collisionFilter: {
                	group : -1
                },
                render: {
                    strokeStyle: 'red',
                    fillStyle: 'transparent',
                    lineWidth: 1
                }
            });

			this.initial_position[i] = {};
            this.initial_position[i].x = this.nodes[i].position.x;
            this.initial_position[i].y = this.nodes[i].position.y;
			this.nodes[i].friction = rnd_float(0.99, 0.01);
			this.nodes[i].inertia = Infinity;
			this.nodes[i].groupId = 1;
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

	this.spawn = function(generation) {
		this.generation = generation;
		for(let i = 0; i < this.nodes.length; i++) {
			World.add(world, this.nodes[i]);
		}

		for(let i = 0; i < this.muscles.length; i++) {
			World.add(world, this.muscles[i]);
		}

		var start = engine.timing.timestamp;
	}

	this.fitness = -1;

	this.mutate = function(){
		console.log("Mutate");
		var chance = rnd(3, 0);
		var increment;
		//cambiar el stiffness
		if(chance == 0){
			chance = rnd(this.muscles.length - 1, 0);
			this.muscles[chance].stiffness = this.muscles[chance].stiffness - 0.05 + 0.1*Math.random();
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
	}

	this.calculate_fitness = function() {
		let n = this.nodes.length;
		let sum = 0;
		self.nodes.forEach(function(element) {
			sum += element.position.x;
		});
		
		this.fitness = sum / n;
	}

	this.interval = setInterval(this.contract, 200);

	this.despawn = function() {
		self.reset_position();
		self.nodes.forEach(function(element) {
			Composite.remove(world, element);
		});

		self.muscles.forEach(function(element) {
			Composite.remove(world, element);
		});
	}
}

var generation = [];

new_generation = function(size) {
	for(let i = 0; i < size; i++) {
		generation.push(create_creature());
	}
}

run_generation = function(time, done) {
	console.log("Run");
	for(let i = 0; i < generation.length; i++) {
		generation[i].spawn();
	}

	let start = engine.timing.timestamp;
	Matter.Events.on(engine, "afterUpdate", function() {
		if(engine.timing.timestamp - start > time) {
			console.log("Despawn");
			for(let i = 0; i < generation.length; i++) {
				generation[i].calculate_fitness();
				generation[i].despawn();
			}

			engine.events = {};
			return done();
		}
	});
}

create_creature = function() {
	var c = new Creature();
	c.build();
	return c;
}

mutate_generation = function(time) {
	generation.sort(function(a, b) {
		return b.fitness - a.fitness;
	});

	for(let i = 25; i < generation.length; i++) {
		generation[i].mutate();
	}

	run_generation(time, function() {
		mutate_generation(time);
	})
}

start = function() {
	let size = 50;
	let time = 5000;
	new_generation(size);

	run_generation(time, function() {
		mutate_generation(time);
	})
}

start();