/**
 * jQuery.calendar
 *
 * @version  0.1-dev
 * @author   rew <rewish.org@gmail.com>
 * @link     http://rewish.org/
 * @license  http://rewish.org/license/mit The MIT License
 */
(function($) {

	$.fn.calendar = function(option) {
		$.calendar(this, option);
	};

	var $c = $.calendar = function(elem, option) {
		$.calendar.elem = elem;
		$.calendar
			.init(option)
			.create()
			.addEvent()
			.show()
		;
	};

	$c.ready = false;
	$c.today = new Date;
	$c.weekDay = {
		name: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
		en  : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		ja  : ['\u65e5', '\u6708', '\u706b', '\u6c34', '\u6728', '\u91d1', '\u571f']
	};

	$c.init = function(option) {
		$c.setOption(option);
		if ($c.ready) {
			return this;
		}
		$c.ready = true;
		if ($c.option.title) {
			$c.createTitle();
		}
		if ($c.option.navi) {
			$c.createNavi();
		}
		$c.createTable();
		return this;
	};

	$c.setOption = function(option) {
		if ($c.option && !option) {
			return this;
		}
		$c.option = $.extend({
			lang  : 'ja',
			year  : $c.today.getFullYear(),
			month : $c.today.getMonth() + 1,
			navi  : {
				en: ['Prev', 'Next'],
				ja: ['\u524d\u306e\u6708', '\u6b21\u306e\u6708']
			},
			title : true,
			events: [],
			eventCallback: $c.callback.event,
			moveCallback : $c.callback.move,
			otherEmpty: false,
		}, option);
		return this;
	};

	$c.createTitle = function() {
		$c.title = $('<div />').addClass('title');
		$c.elem.append($c.title);
	};

	$c.createNavi = function() {
		var
			format = '<a href="javascript:jQuery.calendar.move(\'%s\')">%s</a>',
			text   = $c.option.navi[$c.option.lang];
		$c.elem.append(
			$('<ul />')
				.addClass('moveNavi')
				.html([
					'<li class="prev">', format.replace(/%s/g, text[0]), '</li>',
					'<li class="next">', format.replace(/%s/g, text[1]), '</li>'
				].join(''))
		);
	};

	$c.createTable = function() {
		$c.tbody = $('<tbody />');
		$c.tr = $('<tr />');
		$c.td = $('<td />');
		var week = [];
		for (var i = 0, wd; wd = $c.weekDay[$c.option.lang][i]; i++) {
			week[week.length] = [
				'<th class="', $c.weekDay.name[i], '">', wd , '</td>'
			].join('');
		}
		$c.elem.append(
			$('<table />')
				.addClass('calendar')
				.append(
					$('<thead />')
						.append($c.tr.clone().html(week.join('')))
				)
				.append($c.tbody)
		);
	};

	$c.create = function() {
		$c.tbody.empty();
		$c.view = {};
		$c.prevFill();
		$c.current = new Date($c.option.year, $c.option.month - 1, 1);
		var last = new Date($c.option.year, $c.option.month, 0).getDate();
		for (var day = 1; day <= last; day++) {
			$c.current.setDate(day);
			$c.add($c.current, 'currentMonth')
				.attr('id', ['calendar', $c.getKey($c.current)].join('-'));
		}
		$c.nextFill();
		return this;
	};

	$c.prevFill = function() {
		var
			prev = new Date($c.option.year, $c.option.month - 1, 0),
			last = prev.getDate(),
			day  = last - prev.getDay();
		if (last - day >= 6) return this;
		for (; day <= last; day++) {
			prev.setDate(day);
			$c.add(prev, 'otherMonth', $c.option.otherEmpty);
		}
		return this;
	};

	$c.nextFill = function() {
		var
			next = new Date($c.option.year, $c.option.month, 1),
			last = 7 - next.getDay();
		if (last >= 7) return this;
		for (var day = 1; day <= last; day++) {
			next.setDate(day);
			$c.add(next, 'otherMonth', $c.option.otherEmpty);
		}
		return this;
	};

	$c.add = function(date, className, empty) {
		if (empty) {
			return $c.view[$c.getKey(date)] = $c.td.clone()
				.addClass(className);
		}
		return $c.view[$c.getKey(date)] = $c.td.clone()
			.addClass($c.weekDay.name[date.getDay()])
			.addClass(className)
			.text(date.getDate());
	};

	$c.getKey = function(date) {
		if (typeof date == 'string') {
			date = date.split('-');
		}
		return [
			date[0] || date.getFullYear(),
			('0' + (date[1] || date.getMonth() + 1)).slice(-2),
			('0' + (date[2] || date.getDate())).slice(-2)
		].join('-')
	};

	$c.addEvent = function() {
		$.each($c.option.events, function() {
			var td = $c.view[$c.getKey(this.date)];
			if (typeof td == 'undefined') {
				return;
			}
			if (td.attr('class').match('otherMonth')) {
				return;
			}
			$c.option.eventCallback(td, this);
		});
		return this;
	};

	$c.show = function() {
		var
			today = $c.getKey($c.today),
			tr, count = 0;
		if ($c.title) {
			$c.title.text($c.getKey($c.current).slice(0, 7));
		}
		$.each($c.view, function(key) {
			if (count % 7 == 0 || count == 0) {
				tr = $c.tr.clone();
				$c.tbody.append(tr);
			}
			if (key == today && !this.attr('class').match('otherMonth')) {
				this.addClass('today');
			}
			tr.append(this);
			count++;
		});
		return this;
	};

	$c.move = function(type) {
		switch (type) {
			case $c.option.navi[$c.option.lang][0]:
				$c.option.month--;
				break;
			case $c.option.navi[$c.option.lang][1]:
				$c.option.month++;
				break;
		}
		$c.option.moveCallback($c.elem, $c.option);
	};

	$c.callback = {
		event: function(td, evt) {
			var e = typeof evt.url != 'undefined'
				? $('<a />').attr('href', evt.url)
				: $('<span />');
			if (evt.id) {
				e.attr('id', 'event-' + evt.id);
			}
			e.text(td.text());
			td.text('').append(e).addClass('event');
		},
		move: function(elem) {
			$c(elem);
		}
	};

})(jQuery);
