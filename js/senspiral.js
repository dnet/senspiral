function init() {
	const num360s = 10;
	const second = 1 / (24 * 60);

	var canvas = $('senspiral')
	var context = canvas.getContext('2d');
	var centerX = canvas.width / 2;
	var centerY = canvas.height / 2;

	const spacing = lineWidth = centerX / num360s / 1.05;

	context.lineWidth = lineWidth;

	var curX, curY, prevX = NaN, prevY = NaN;

	for (i = 0; i < num360s; i += second) {
		var angle = i * 2 * Math.PI;
		curX = centerX + spacing * i * Math.sin(angle);
		curY = centerY - spacing * i * Math.cos(angle);

		if (prevX != NaN) {
			v = Math.floor(i * 255 / num360s);
			context.strokeStyle = 'rgb(0, 0, ' + v + ')';
			context.beginPath();
			context.moveTo(prevX, prevY);
			context.lineTo(curX, curY);
			context.stroke();
		}
		prevX = curX;
		prevY = curY;
	}
}

Event.observe(window, 'load', init);
