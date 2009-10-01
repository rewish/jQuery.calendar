/**
 * jQuery.calendar
 *
 * @version  0.2-dev
 * @author   rew <rewish.org@gmail.com>
 * @link     http://rewish.org/
 * @license  http://rewish.org/license/mit The MIT License
 *
 * @TODO Refactoring
 */
(function($) {

$.fn.calendar = function(option) {
	return $.calendar(this, option);
};

$.calendar = function(elem, option) {
	return $.extend(true, {}, $.calendar._private)
		.init(elem, option).build().show();
};

$.calendar._private = {

	weekDay: {
		name: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
		en  : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		ja  : ['\u65e5', '\u6708', '\u706b', '\u6c34', '\u6728', '\u91d1', '\u571f']
	},

	init: function(elem, option) {
		this.elem  = elem;
		this.today = new Date;
		this.view  = {};
		return this
			.setOption(option)
			.createNavi()
			.createTable()
			.createCaption();
	},

	setOption: function(option) {
		if (this.option && !option) {
			return this;
		}
		this.option = $.extend({
			lang  : 'ja',
			year  : this.today.getFullYear(),
			month : this.today.getMonth() + 1,
			caption : '%Y-%M',
			navi : {
				en: ['<<Prev', 'Next>>'],
				ja: ['<<\u524d\u306e\u6708', '\u6b21\u306e\u6708>>']
			},
			fadeTime : 300,
			events : [],
			eventCallback : this.callback.event,
			moveCallback  : this.callback.move,
			otherHide : false
		}, option);
		return this;
	},

	createNavi: function() {
		if (!this.option.navi) {
			return this;
		}
		var self = this;
		var list = function(className, number, text) {
			var a = $('<a />').text(text);
			a.attr('href', 'javascript:void(0)');
			a.click(function() {
				self.move(number);
				return false;
			});
			return $('<li />').addClass(className).append(a);
		};
		var text = this.option.navi[this.option.lang];
		this.elem.append(
			$('<ul />')
				.addClass('moveNavi')
				.append(list('prev', -1, text[0]))
				.append(list('next',  1, text[1]))
		);
		return this;
	},

	// Chaos!!
	createTable: function() {
		this.tr = $('<tr />');
		this.td = $('<td />');
		// table
		this.table = $('table:first', this.elem);
		this.table = this.table.size() > 0 ? this.table : $('<table />');
		// thead
		this.thead = $('thead:first', this.table);
		if (this.thead.size() < 1 || $('th', this.thead).size() < 1) {
			var week = [];
			for (var i = 0, wd; wd = this.weekDay[this.option.lang][i]; i++) {
				week[week.length] = [
					'<th class="', this.weekDay.name[i], '">', wd , '</td>'
				].join('');
			}
			this.thead = $('<thead />').append(this.tr.clone().html(week.join('')))
		}
		// tbody
		this.tbody = $('tbody:first', this.table);
		this.tbody = (this.tbody.size() > 0 ? this.tbody : $('<tbody />')).empty();
		this.elem.append(
			this.table
				.addClass('calendar')
				.append(this.thead)
				.append(this.tbody)
		);
		return this;
	},

	createCaption: function() {
		if (this.option.caption) {
			this.caption = $('<caption />');
			this.table.prepend(this.caption);
		}
		return this;
	},

	build: function() {
		this.prevFill();
		this.current = new Date(this.option.year, this.option.month - 1, 1);
		var last = new Date(this.option.year, this.option.month, 0).getDate();
		for (var day = 1; day <= last; day++) {
			this.current.setDate(day);
			this.addDay(this.current, 'currentMonth')
				.attr('id', ['calendar', this.getKey(this.current)].join('-'));
		}
		this.nextFill();
		this.addEvent();
		return this;
	},

	rebuild: function() {
		this.tbody.empty();
		this.view = {};
		return this.build();
	},

	prevFill: function() {
		var
			prev = new Date(this.option.year, this.option.month - 1, 0),
			last = prev.getDate(),
			day  = last - prev.getDay();
		if (last - day >= 6) return this;
		for (; day <= last; day++) {
			prev.setDate(day);
			this.addDay(prev, 'otherMonth', this.option.otherHide);
		}
		return this;
	},

	nextFill: function() {
		var
			next = new Date(this.option.year, this.option.month, 1),
			last = 7 - next.getDay();
		if (last >= 7) return this;
		for (var day = 1; day <= last; day++) {
			next.setDate(day);
			this.addDay(next, 'otherMonth', this.option.otherHide);
		}
		return this;
	},

	addDay: function(date, className, hide) {
		if (hide) {
			return this.view[this.getKey(date)] = this.td.clone()
				.addClass(className)
				.text(' '); // IE <= 7 "empty-cells" fix;
		}
		return this.view[this.getKey(date)] = this.td.clone()
			.addClass(this.weekDay.name[date.getDay()])
			.addClass(className)
			.text(date.getDate());
	},

	getKey: function(date) {
		if (typeof date == 'string') {
			date = date.split('-');
		}
		return [
			date[0] || date.getFullYear(),
			('0' + (date[1] || date.getMonth() + 1)).slice(-2),
			('0' + (date[2] || date.getDate())).slice(-2)
		].join('-')
	},

	addEvent: function() {
		var self = this;
		$.each(self.option.events, function() {
			var td = self.view[self.getKey(this.date)];
			if (typeof td == 'undefined') {
				return;
			}
			if (td.attr('class').match('otherMonth')) {
				return;
			}
			self.option.eventCallback(td, this);
		});
		return this;
	},

	show: function() {
		var today = this.getKey(this.today), tr, count = 0, self = this;
		$.each(self.view, function(key) {
			if (count % 7 == 0 || count == 0) {
				tr = self.tr.clone();
				self.tbody.append(tr);
			}
			if (key == today && !this.attr('class').match('otherMonth')) {
				this.addClass('today');
			}
			tr.append(this);
			count++;
		});
		return this.setCaption();
	},

	setCaption: function() {
		if (!this.option.caption) {
			return this;
		}
		var date = this.getKey(this.current).split('-');
		this.caption.text(
			this.option.caption
				.replace(/%Y/i, date[0])
				.replace(/%M/i, date[1])
		);
		return this;
	},

	move: function(number) {
		var self = this;
		var moveAction = function() {
			self.option.month = self.option.month + number;
			self.option.moveCallback(self.elem, self.option);
			self.rebuild().show();
		};
		if (this.option.fadeTime <= 0) {
			return moveAction();
		}
		// IE <= 7 ClearType fix
		var fixFilter = function(e) {
			if (!window.opera && typeof e.style.filter != 'undefined') {
				e.style.removeAttribute('filter');
			}
		};
		// caption fadeIn & fadeOut for Firefox fix
		this.caption.fadeOut(this.option.fadeTime);
		this.table.fadeOut(this.option.fadeTime, moveAction);
		this.caption.fadeIn(this.option.fadeTime, function() {
			fixFilter(this);
		});
		this.table.fadeIn(this.option.fadeTime, function() {
			fixFilter(this);
		});
		return this;
	},

	callback: {
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
			return;
		}
	}

};

})(jQuery);
