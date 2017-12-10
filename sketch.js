var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    Common = Matter.Common,
    Constraint = Matter.Constraint,
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

start = function() {
    setTimeout(start, 1000);
}

rnd = function(max, min, not, also_not) {
    let output;
    do {
        output = Math.floor((Math.random() * (max - min)) + min);
    } while(output === not || output === also_not);
    return output;
}

var constraints = [];
var extensions = [];

create_body = function() {
    var bodies = [];
    var n = rnd(6, 3);
    console.log("Bodies: " + n);
    for(i = 0; i < n; i++) {
        bodies[i] = Bodies.circle(rnd(300, 140), rnd(300, 140), 20);
    }

    for(i = 0; i < n; i++) {
        var index2 = rnd(n - 1, 0, i, bodies[i].connection);
        bodies[i].connection = index2;
        constraints[i] = Matter.Constraint.create({
            pointA: {x:0, y:0},
            pointB: {x:0, y:0},
            bodyA: bodies[i],
            bodyB: bodies[index2],
            stiffness: 0.05,
            length: rnd(140, 50)
        });

        extensions[i] = rnd(constraints[i].length + 150, constraints[i].length);
        console.log(extensions[i]);
    }

    for(i = 0; i < n; i++) {
        World.add(world, bodies[i]);
    }

    for(i = 0; i < n; i++) {
        World.add(world, constraints[i]);
    }
}

start = function() {
    for(i = 0; i < constraints.length; i++) {
        console.log("Before: " + constraints[i].length);
        let tmp = extensions[i];
        extensions[i] = constraints[i].length;
        constraints[i].length = tmp;

        console.log("After: " + constraints[i].length);
    }

    setTimeout(start, 500);
}

create_body();
start();