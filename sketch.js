var Engine = Matter.Engine,
	Render = Matter.Render,
	Runner = Matter.Runner,
	Composites = Matter.Composites,
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

var runner = Runner.create();
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

contract = function(muscle) {
	console.log("Contract");
	let tmp = muscle.length;
	muscle.length = muscle.extended_length;
	muscle.extended_length = tmp;

	setTimeout(contract, 500);
}

var Creature = function() {
	this.nodes = [];
	this.muscles = [];
	var self = this;

	this.build = function() {
	   this.nodes.length = rnd(3, 6);

		for(let i = 0; i < this.nodes.length; i++) {
			this.nodes[i] = Bodies.circle(rnd(300, 140), rnd(300, 140), 20);
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
				stiffness: 0.05,
				length: rnd(100, 70),
				extended_length : rnd(length, length + 50)
			});
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
	}

	this.interval = setInterval(this.contract, 200);
}

start = function() {
	let c = new Creature();
	c.build();
	c.spawn();
}

start();