///Moving Birds ////
let Birds = function () {
	let config = {
		number: 13,
	};

	let width;
	let height;

	let canvas;
	let engine;

	let birds;
	let frame = 0;

	let speed = 0.4;
	let birdLineCount = 10;
	let birdLineIndex = -1;

	let bgTop;
	let bgBot;

	let z = {
		current: 1,
		target: 1,
	};

	let mouse = {
		x: 0.5,
		y: 0.5,
		z: 0.5,
	};

	let prepare = function () {
		canvas = document.getElementsByTagName('canvas')[0];
		engine = canvas.getContext('2d');

		width = window.innerWidth;
		height = window.innerHeight;

		canvas.setAttribute('width', width);
		canvas.setAttribute('height', height);

		bgTop = engine.createLinearGradient(0, 0, 0, height / 2);
		bgTop.addColorStop(0, '#000');
		bgTop.addColorStop(1, '#110');

		bgBot = engine.createLinearGradient(0, height / 2, 0, height);
		bgBot.addColorStop(0, '#000');
		bgBot.addColorStop(1, '#001');
	};

	let request = function () {
		window.requestAnimationFrame(tick);
	};

	let solveBirdMove = function (bird) {
		['x', 'y', 'z'].forEach(function (key) {
			if (Math.abs(bird.move[key]) > 0.003) {
				bird.move[key] *= 0.99;
			}
		});

		if (frame % bird.ownMove.t === 0) {
			bird.ownMove.x = (0.5 - Math.random()) / 3;
			bird.ownMove.y = (0.5 - Math.random()) / 3;
		}

		bird.move.x += speed * (mouse.x - bird.pos.x + bird.ownMove.x) * bird.speed;
		bird.move.y += speed * (mouse.y - bird.pos.y + bird.ownMove.y) * bird.speed;
		bird.move.z += speed * (mouse.z - bird.pos.z) * bird.speed;
	};

	let applyPath = function (pathStack) {
		engine.moveTo(pathStack[0].x, pathStack[0].y);

		for (let i = 1; i < pathStack.length; i++) {
			engine.lineTo(pathStack[i].x, pathStack[i].y);
		}
	};

	let drawBird = function (bird) {
		engine.fillStyle = 'hsl(' + (frame % 360) + ', 100%, 90%)';

		let pos = {
			x: bird.pos.x * width,
			y: bird.pos.y * height,
			z: bird.pos.z * 1.5,
		};

		let size = ((width + height) / 200) * pos.z * z.current;
		let atan = Math.atan2(bird.move.y * height, bird.move.x * width);

		engine.lineWidth = 1;

		let p = function (rad, customSize) {
			return {
				x: pos.x + Math.cos(atan + rad * Math.PI * 2) * size * customSize,
				y: pos.y + Math.sin(atan + rad * Math.PI * 2) * size * customSize,
			};
		};

		//addLinePath
		addLinePath(bird, p(0.5, 1.3));

		engine.beginPath();

		//body
		applyPath([
			//spitze
			p(0, 1.2),
			p(0.01, 0.9),
			p(0.05, 0.7),

			//schweif
			p(0.47, 0.9),
			p(0.45, 1.5),
			p(0.47, 1.2),
			p(0.5, 1.5),
			p(0.52, 1.2),
			p(0.55, 1.5),
			p(0.53, 0.9),

			//spitze
			p(-0.25, 0.5),
			p(-0.05, 0.7),
			p(-0.01, 0.9),
			p(0, 1.2),
		]);

		engine.fill();

		let wingWave = Math.sin(bird.wing);
		let wingAdd = wingWave * 0.1;
		let wingPositiveWave = (wingWave + 1) / 2;

		engine.beginPath();

		//wings
		applyPath([
			p(0, 0.5),

			//rauf
			p(-0.15, wingPositiveWave),
			p(-0.25, -1 + 3 * wingPositiveWave),

			//runter
			p(-0.4, 0.5),
			p(0, 0),
		]);

		engine.fill();
	};

	let addLinePath = function (bird, pos) {
		bird.lines[birdLineIndex * 2] = pos.x;
		bird.lines[birdLineIndex * 2 + 1] = pos.y;
	};

	let drawBirdLines = function () {
		for (let i = birdLineCount; i >= 2; i--) {
			engine.beginPath();
			engine.lineWidth = ((i / birdLineCount) * (width + height)) / 1000;
			engine.strokeStyle =
				'hsla(' +
				((frame + i) % 360) +
				', 100%, 50%, ' +
				i / birdLineCount +
				')';
			let currentIndex = (birdLineIndex + i) % birdLineCount;
			let lastIndex = (birdLineIndex + i + birdLineCount - 1) % birdLineCount;

			birds.forEach(function (bird) {
				if (
					bird.lines[lastIndex * 2] !== 0 &&
					bird.lines[currentIndex * 2] !== 0
				) {
					engine.moveTo(
						bird.lines[currentIndex * 2],
						bird.lines[currentIndex * 2 + 1]
					);

					engine.lineTo(
						bird.lines[lastIndex * 2],
						bird.lines[lastIndex * 2 + 1]
					);
				}
			});

			engine.stroke();
		}
	};

	let drawShine = function () {
		engine.fillStyle = 'hsla(' + (frame % 360) + ', 100%, 90%, 0.01)';

		engine.beginPath();
		birds.forEach(function (bird) {
			engine.moveTo(bird.pos.x * width, bird.pos.y * height);
			engine.arc(
				bird.pos.x * width,
				bird.pos.y * height,
				(bird.pos.z * (width + height)) / 30,
				0,
				Math.PI * 2
			);
		});

		engine.fill();
		engine.closePath();

		engine.globalCompositeOperation = 'source-over';
	};

	let renderBirds = function () {
		birds.forEach(function (bird) {
			solveBirdMove(bird);

			bird.wing += 0.1 + bird.wingAdd * 0.3 * speed;

			bird.pos.x += bird.move.x;
			bird.pos.y += bird.move.y;
			bird.pos.z += bird.move.z;
		});

		drawBirdLines();

		birdLineIndex = (birdLineIndex + 1) % birdLineCount;

		birds.forEach(function (bird) {
			drawBird(bird);
		});

		drawShine();
	};

	let clear = function () {
		engine.clearRect(0, 0, width, height);
	};

	let drawBg = function () {
		engine.fillStyle = bgTop;
		engine.fillRect(0, 0, width, height / 2);

		engine.fillStyle = bgBot;
		engine.fillRect(0, height / 2, width, height);
	};

	let tick = function () {
		frame++;

		z.current += (z.target - z.current) / 100;

		clear();
		// drawBg();
		renderBirds();

		request();
	};

	let createBirds = function () {
		birds = [];

		for (let i = 0; i < config.number; i++) {
			birds.push({
				wing: Math.random(),
				wingAdd: Math.random(),
				speed: (0.2 + Math.random() * 0.8) / 2000,
				pos: {
					x: 0.25 + Math.random() * 0.5,
					y: 0.25 + Math.random() * 0.5,
					z: Math.random(),
				},
				move: {
					x: (0.5 - Math.random()) / 100,
					y: (0.5 - Math.random()) / 100,
					z: 0,
				},
				moveCache: {
					//dirty
					x: 0,
					y: 0,
				},
				ownMove: {
					t: (20 + Math.random() * 100) | 0,
					x: 0,
					y: 0,
				},
				tar: {
					x: 0.5,
					y: 0.5,
				},
				lines: new Float32Array(birdLineCount * 2),
			});
		}
	};

	let registerMouse = function () {

		setInterval(function () {
			mouse.x = Math.random();
			mouse.y = Math.random();

			z.target = 0.5 + Math.random();
		}, 1000);
	};

	this.run = function () {
		registerMouse();
		prepare();
		createBirds();

		tick();
	};
};

let b = new Birds();
b.run();

///////////////////////////////////////

