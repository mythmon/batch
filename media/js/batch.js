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

    var grid = [];
    var i, x, y;
    var gWidth = width /gridSize;
    var gHeight = height / gridSize;
    for (x = 0; x < gWidth; x++) {
        grid[x] = [];
        for (y = 0; y < gHeight; y++) {
            grid[x][y] = 0;
        }
    }

    for (i = 0; i < 20; i++) {
        x = Math.floor(Math.random() * gWidth);
        y = Math.floor(Math.random() * gHeight);
        grid[x][y] = 1;
    }
    grid[gWidth - 1][0] = 2;

    var animations = [];
    var program = [];
    var running = false;
    var currentInstruction = null;

    // program instructions
    var animFrames = 5;
    var instructions = {
        up: simpleAnimInstruction(animFrames, 0, -gridSize / animFrames),
        down: simpleAnimInstruction(animFrames, 0, gridSize / animFrames),
        left: simpleAnimInstruction(animFrames, -gridSize / animFrames, 0),
        right: simpleAnimInstruction(animFrames, gridSize / animFrames, 0),
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
        } else {
            currentInstruction = instruction;
            instruction.func();
            updateProgramDisplay();
        }
        if (currentInstruction) {
            if (currentInstruction.after) {
                currentInstruction.after();
            }
        }
        afterEveryInstruction();
    }

    function afterEveryInstruction() {
        var gx = Math.floor(robot.x / gridSize);
        var gy = Math.floor(robot.y / gridSize);

        if (!currentInstruction && grid[gx][gy] == 2) {
            alert('winner!');
            running = false;
        }
        if (grid[gx][gy] == 1) {
            alert('loser');
            running = false;
        }
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
        var i, x, y;

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

        ctx.fillStyle = '#0f0';
        ctx.fillRect(width - gridSize, 0, gridSize, gridSize);

        colors = ['#000', '#f00', '#0f0'];
        for (x = 0; x < gWidth; x++) {
            for (y = 0; y < gWidth; y++) {
                ctx.fillStyle = colors[grid[x][y]];
                ctx.fillRect(x * gridSize + 1, y * gridSize + 1,
                             gridSize - 1, gridSize - 1);
            }
        }

        ctx.fillStyle = '#00f';
        ctx.fillRect(robot.x, robot.y, robot.size, robot.size);

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

        setTimeout(tick, 30);
    }
    tick();
});
