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
			.init()
			.setOption(option)
			.create()
			.addEvent()
			.show()
		;
	};

	$c.dayName = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

	$c.ready = false;
	$c.init  = function() {
		if ($.calendar.ready) {
			return this;
		}
		$c.title = $('<div />');
		var link = '<a href="javascript:jQuery.calendar.move(\'%s\')">%s</a>';
		$c.elem.find('table')
			.before($c.title)
			.before(
				$('<ul />').html([
					'<li>', link.replace(/%s/g, 'Prev'), '</li>',
					'<li>', link.replace(/%s/g, 'Next'), '</li>'
				].join(''))
			)
		;
		$c.ready = true;
		return this;
	};

	$c.setOption = function(option) {
		var date = new Date;
		$c.option = $.extend({
			year  : date.getFullYear(),
			month : date.getMonth() + 1,
			day   : date.getDate(),
			events: [],
			callback: $c.callback
		}, option);
		return this;
	};

	$c.create = function() {
		$('tbody', $c.elem).empty();
		$c.view = {};
		$c.prevFill();
		var
			current = new Date($c.option.year, $c.option.month - 1, 1),
			last = new Date($c.option.year, $c.option.month, 0).getDate();
		for (var day = 1; day <= last; day++) {
			current.setDate(day);
			$c.add(current, 'currentMonth')
				.attr('id', ['calendar', $c.getKey(current)].join('-'));
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

	$c.td  = $('<td />');
	$c.add = function(date, className) {
		return $c.view[$c.getKey(date)] = $c.td.clone()
			.addClass($c.dayName[date.getDay()])
			.addClass(className)
			.text(date.getDate());
	};

	$c.getKey = function(date) {
		return [
			date.getFullYear(),
			('0' + (date.getMonth() + 1)).slice(-2),
			('0' + (date.getDate())).slice(-2)
		].join('-')
	};

	$c.addEvent = function() {
		$.each($c.option.events, function() {
			if (typeof $c.view[this.date] == 'undefined') {
				return;
			}
			var td = $c.view[this.date];
			if (td.attr('class').match('otherMonth')) {
				return;
			}
			$c.option.callback(td, this);
		});
		return this;
	};

	$c.callback = function(td, evt) {
		var event = evt.url ? $('<a />').attr('href', evt.url) : $('<span />');
		if (evt.id) {
			event.attr('id', 'event-' + evt.id);
		}
		event.text(td.text());
		td.text('').append(event).addClass('event');
	};

	$c.tr = $('<tr />');
	$c.show = function() {
		var
			tbody = $('tbody', $c.elem),
			tr,
			count = 0;
		$.each($c.view, function() {
			if (count % 7 == 0 || count == 0) {
				tr = $c.tr.clone();
				tbody.append(tr);
			}
			tr.append(this);
			count++;
		});
		$c.title.text($c.getKey(
			new Date($c.option.year, $c.option.month - 1, $c.option.day)
		).slice(0, 7));
		return this;
	};

	$c.move = function(type) {
		$c.option.month = type == 'Prev'
		                ? --$c.option.month
		                : ++$c.option.month;
		$c($c.elem, $c.option);
	};

})(jQuery);
