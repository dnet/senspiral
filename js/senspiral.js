const second = 1 / (24 * 60 * 60);
var startDay;
var sense_history = null;
var history_startpos;

function state4pos(pos) {
	var utc = pos / second + startDay;
	var retval = false;
	for (var i = history_startpos; i < sense_history.length - 1; i++) {
		he = sense_history[i];
		if (he[0] > utc) break;
		history_startpos = i;
		retval = he[1];
	}
	return retval;
}

function fetch_sense_history() {
	new Ajax.Request('acd.php', {
		onSuccess: function(response) {
			sense_history = new Array();
			scs = response.responseXML.getElementsByTagName('state_change');
			for (var i = 0; i < scs.length; i++) {
				a = scs[i].attributes;
				when = a.getNamedItem('when').nodeValue;
				what = a.getNamedItem('what').nodeValue;
				sense_history.push([
					new Date(when).valueOf() / 1000, // UNIX timestamp
					what != '0' // boolean
				]);
			};
			$('plotbtn').enable().value = 'Refresh';
			Event.observe('plotbtn', 'click', draw);
		}
	});
}

function init() {
	$('plotbtn').disable().value = 'Loading history...';
	fetch_sense_history();
}

function draw() {
	const num360s = parseInt($('numdays').value);
	const openColor = 'rgb(0, 255, 0)';
	const closedColor = 'rgb(255, 0, 0)';

	startDay = new Date($('startday').value).valueOf() / 1000;

	var canvas = $('senspiral')
	var context = canvas.getContext('2d');
	var centerX = canvas.width / 2;
	var centerY = canvas.height / 2;

	const spacing = lineWidth = centerX / num360s / 1.05;

	context.lineWidth = lineWidth;
	history_startpos = 0;

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
