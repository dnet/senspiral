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

function init() {
	buttonstate('Loading history...');
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
			buttonstate();
			Event.observe('plotbtn', 'click', draw);
		}
	});
}

function buttonstate(txt) {
	if (txt) {
		$('plotbtn').disable().value = txt;
	} else {
		$('plotbtn').enable().value = 'Refresh';
	}
}

function draw() {
	buttonstate('Drawing...');
	setTimeout(execdraw, 1);
}

function execdraw() {
	const num360s = parseInt($('numdays').value);
	const openColor = $('opencolor').value;
	const closedColor = $('closedcolor').value;

	startDay = new Date($('startday').value).valueOf() / 1000;

	var canvas = $('senspiral')
	canvas.width = canvas.height = parseInt($('canvassize').value);
	var context = canvas.getContext('2d');
	var center = canvas.width / 2;

	const spacing = lineWidth = center / num360s / 1.05;

	context.lineWidth = lineWidth;
	history_startpos = 0;

	var curX, curY, prevX = NaN, prevY = NaN, prevState = null;

	for (i = 0; i < num360s; i += second) {
		var angle = i * 2 * Math.PI;
		curX = center + spacing * i * Math.sin(angle);
		curY = center - spacing * i * Math.cos(angle);

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
	buttonstate();
}

Event.observe(window, 'load', init);
