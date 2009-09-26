(function($) {

	$.fn.calendar = function(option) {
		$.calendar($.extend({
			object: $(this)
		}, option));
	};

	var $c = $.calendar = function(option) {
		$.calendar
			.setOption(option)
			.create()
			.addEvent()
			.show()
		;
	};

	$c.dayName = [
		'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
	];

	$c.setOption = function(option) {
		var date = new Date;
		$c.option = $.extend({
			year  : date.getFullYear(),
			month : date.getMonth() + 1,
			day   : date.getDate(),
			object: $('#calendar'),
			events: [],
			callback: $c.callback
		}, option);
		return this;
	};

	$c.create = function() {
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
			prevLast = prev.getDate();
		for (var day = prevLast - prev.getDay(); day <= prevLast; day++) {
			prev.setDate(day);
			$c.add(prev, 'otherMonth');
		}
		return this;
	};

	$c.nextFill = function() {
		var
			next = new Date($c.option.year, $c.option.month, 1),
			nextLast = 7 - next.getDay();
		if (nextLast == 7) return this;
		for (var day = 1; day <= nextLast; day++) {
			next.setDate(day);
			$c.add(next, 'otherMonth');
		}
		return this;
	};

	$c.view = {};
	$c.td   = $('<td />');
	$c.add  = function(date, className) {
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
			tbody = $('tbody', $c.option.object),
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
		return this;
	};

})(jQuery);
