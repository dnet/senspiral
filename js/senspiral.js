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

function keyhandler(evt) {
	if (evt.keyCode == 13 && !$('plotbtn').disabled) draw();
}

function init() {
	$$('input[type=text]').each(function (i) {
		Event.observe(i.id, 'keydown', keyhandler);
	});
	buttonstate('Loading history...');
	new Ajax.Request('acd.php', {
		onSuccess: function(response) {
			sense_history = new Array();
			scs = response.responseXML.getElementsByTagName('state_change');
			for (var i = 0; i < scs.length; i++) {
				a = scs[i].attributes;
				when = a.getNamedItem('when').nodeValue;
				what = a.getNamedItem('what').nodeValue;
				whenutc = Date.UTC(
					when.substring(0, 4),
					parseInt(when.substring(5, 7)) - 1,
					when.substring(8, 10),
					when.substring(11, 13),
					when.substring(14, 16),
					when.substring(17, 19)
				);
				sense_history.push([
					whenutc / 1000, // UNIX timestamp
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
	var start = new Date();

	const num360s = parseInt($('numdays').value);
	const openColor = '#' + $('opencolor').value;
	const closedColor = '#' + $('closedcolor').value;

	sd = $('startday').value;
	startDay = Date.UTC(
		sd.substring(0, 4),
		parseInt(sd.substring(5, 7)) - 1,
		sd.substring(8, 10)
	) / 1000;

	var canvas = $('senspiral')
	canvas.width = canvas.height = parseInt($('canvassize').value);
	var context = canvas.getContext('2d');
	var center = canvas.width / 2;

	const spacing = lineWidth = center / num360s / 1.05;

	context.lineWidth = lineWidth;
	history_startpos = 0;

	var prevX = null, prevY = null, prevState = null, i = 0;

	var execdraw = function() {
		for (n = 1000; n > 0 && i < num360s; n-- && (i += second)) {
			var angle = i * 2 * Math.PI;
			var curX = center + spacing * i * Math.sin(angle);
			var curY = center - spacing * i * Math.cos(angle);

			if (prevX != null) {
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

		if (i < num360s) {
			setTimeout(execdraw, 1);
		} else {
			context.stroke();
			buttonstate();
      $('time').innerHTML = (new Date() - start) / 1000 + ' s';
		}
	};
	execdraw();
}

Event.observe(window, 'load', init);
