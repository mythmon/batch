define('batch', ['canvas'], function() {

    var Canvas = require('canvas');

    // options
    var width = 440;
    var height = 440;
    var gridSize = 40;

    // DOM stuff
    var c = new Canvas(width, height);
    document.body.appendChild(c.el);
    var ctx = c.ctx;

    var buttonSpec = [
        ['<b>Run</b>', run],
        ['Up', addInstruction.bind(null, 'up')],
        ['Down', addInstruction.bind(null, 'down')],
        ['Left', addInstruction.bind(null, 'left')],
        ['Right', addInstruction.bind(null, 'right')],
    ];

    buttonSpec.forEach(function(spec) {
        var label = spec[0];
        var func = spec[1];

        var btn = document.createElement('button');
        btn.innerHTML = label;
        btn.addEventListener('click', func);
        document.body.appendChild(btn);
    });

    var programDisplay = document.createElement('ul');
    document.body.appendChild(programDisplay);

    // game objects
    var robot = {
        x: width / 2 - 10,
        y: height / 2 - 10,
        size: 20
    };

    var animations = [];
    var program = [];
    var running = false;
    var currentInstruction = null;

    // program instructions
    var instructions = {
        up: simpleAnimInstruction(10, 0, -gridSize / 10),
        down: simpleAnimInstruction(10, 0, gridSize / 10),
        left: simpleAnimInstruction(10, -gridSize / 10, 0),
        right: simpleAnimInstruction(10, gridSize / 10, 0),
    }

    // scaffold
    function simpleAnimInstruction(count, dx, dy) {
        return function() {
            animations.push({
                count: count,
                dx: dx,
                dy: dy,
            });
        };
    }

    function run() {
        console.log('running');
        running = true;
    }

    function addInstruction(type) {
        program.push({
            text: type,
            func: instructions[type],
        });
        updateProgramDisplay();
    }

    function nextInstruction() {
        var instruction = program.shift();
        if (!instruction) {
            running = false;
            currentInstruction = null;
            updateProgramDisplay();
            return;
        }
        currentInstruction = instruction;
        instruction.func();
        updateProgramDisplay();
    }

    function updateProgramDisplay() {
        var elem;
        programDisplay.innerHTML = '';
        function instruction_li(parent, text) {
            var elem = document.createElement('li');
            elem.innerHTML = text;
            elem.classList.add('instruction');
            parent.appendChild(elem);
            return elem;
        }

        if (currentInstruction) {
            elem = instruction_li(programDisplay, currentInstruction.text);
            elem.classList.add('current');
        }

        program.forEach(function(instruction) {
            instruction_li(programDisplay, instruction.text);
        });
    }

    function tick() {
        var i;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeWidth = 1;
        for (i = 0.5; i < height; i += gridSize) {
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }

        if (running) {
            if (animations.length) {
                var anim = animations[0];
                robot.x += anim.dx;
                robot.y += anim.dy;
                if (--anim.count <= 0) {
                    animations.shift();
                }
            } else {
                nextInstruction();
            }
        }

        ctx.fillStyle = '#00f';
        ctx.fillRect(robot.x, robot.y, robot.size, robot.size);

        setTimeout(tick, 30);
    }
    tick();
});
