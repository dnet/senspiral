function state4pos(pos) {
	return (pos - Math.floor(pos)) < 0.5;
}

function init() {
	const num360s = 10;
	const second = 1 / (24 * 60);
	const openColor = 'rgb(0, 255, 0)';
	const closedColor = 'rgb(255, 0, 0)';

	var canvas = $('senspiral')
	var context = canvas.getContext('2d');
	var centerX = canvas.width / 2;
	var centerY = canvas.height / 2;

	const spacing = lineWidth = centerX / num360s / 1.05;

	context.lineWidth = lineWidth;

	var curX, curY, prevX = NaN, prevY = NaN, prevState = null;

	for (i = 0; i < num360s; i += second) {
		var angle = i * 2 * Math.PI;
		curX = centerX + spacing * i * Math.sin(angle);
		curY = centerY - spacing * i * Math.cos(angle);

		if (prevX != NaN) {
			v = Math.floor(i * 255 / num360s);
			curState = state4pos(i);
			if (curState != prevState) {
				if (prevState != null) {
					context.stroke();
				}
				context.strokeStyle = curState ? openColor : closedColor;
				context.beginPath();
				context.moveTo(prevX, prevY);
				prevState = curState;
			}
			context.lineTo(curX, curY);
		}
		prevX = curX;
		prevY = curY;
	}

	context.stroke();
}

Event.observe(window, 'load', init);
