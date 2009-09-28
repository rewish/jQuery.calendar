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

	$c.dayName  = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
	$c.moveLink = '<a href="javascript:jQuery.calendar.move(\'%s\')">%s</a>';
	$c.today = new Date;
	$c.ready = false;
	$c.title;
	$c.current;
	$c.view;
	$c.tr = $('<tr />');
	$c.td = $('<td />');

	$c.init = function(option) {
		$c.setOption(option);
		if ($c.ready) {
			return this;
		}
		$c.title = $('<div />').addClass('title');
		$c.elem.find('table')
			.before($c.title)
			.before(
				$('<ul />').html([
					'<li>', $c.moveLink.replace(/%s/g, 'Prev'), '</li>',
					'<li>', $c.moveLink.replace(/%s/g, 'Next'), '</li>'
				].join(''))
			)
		;
		$c.ready = true;
		return this;
	};

	$c.setOption = function(option) {
		$c.option = $.extend({
			year  : $c.today.getFullYear(),
			month : $c.today.getMonth() + 1,
			day   : $c.today.getDate(),
			events: [],
			callback: {
				event: $c.callback.event,
				move : $c.callback.move
			}
		}, option);
		return this;
	};

	$c.create = function() {
		$('tbody', $c.elem).empty();
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
			$c.add(prev, 'otherMonth');
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
			$c.add(next, 'otherMonth');
		}
		return this;
	};

	$c.add = function(date, className) {
		return $c.view[$c.getKey(date)] = $c.td.clone()
			.addClass($c.dayName[date.getDay()])
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
			$c.option.callback.event(td, this);
		});
		return this;
	};

	$c.show = function() {
		var
			today = $c.getKey($c.today),
			tbody = $('tbody', $c.elem),
			tr, count = 0;
		$c.title.text($c.getKey($c.current).slice(0, 7));
		$.each($c.view, function(key) {
			if (count % 7 == 0 || count == 0) {
				tr = $c.tr.clone();
				tbody.append(tr);
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
		$c.option.month
			= type == 'Prev' ? --$c.option.month
			: type == 'Next' ? ++$c.option.month
			: $c.option.month;
		$c.option.callback.move($c.elem, $c.option);
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
		move: function(elem, option) {
			$c(elem, option);
		}
	};

})(jQuery);
