/**
 * jQuery.calendar
 *
 * @version  0.4
 * @author   rew <rewish.org@gmail.com>
 * @link     http://rewish.org/
 * @license  http://rewish.org/license/mit The MIT License
 */
(function($) {

jQuery.fn.calendar = function(option, callback) {
	return this.each(function() {
		new Calendar($(this), option, callback);
	});
};

var Calendar = function(elem, option, callback) {
	this.init(elem, option, callback).build().show();
};

Calendar.prototype = {
	weekName: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],

	init: function(elem, option, callback) {
		this.today = new Date;
		this.setOption(option, callback)
		this.elem = $('<div />')
			.addClass(this.option.namespace)
			.html(elem.html());
		this.elem.css('z-index', 2);
		this.wrap = $('<div />').append(this.elem);
		this.wrap.css({
			position: 'relative',
			overflow: 'hidden'
		});
		elem.html('').append(this.wrap);
		this.view  = {};
		return this
			.createNavi()
			.createTable()
			.createCaption()
			.createTodayLink();
	},

	setOption: function(option, callback) {
		if (this.option && !option) {
			return this;
		}
		if (this.option) {
			$.extend(this.option, option);
			return this;
		}
		this.option = $.extend({
			lang: 'ja',
			week: {
				en  : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
				ja  : ['\u65e5', '\u6708', '\u706b', '\u6c34', '\u6728', '\u91d1', '\u571f']
			},
			caption: {
				en: '%Y-%M',
				ja: '%Y\u5e74%M\u6708'
			},
			navi: {
				en: ['<<Prev', 'Next>>'],
				ja: ['<<\u524d\u306e\u6708', '\u6b21\u306e\u6708>>']
			},
			year : this.today.getFullYear(),
			month: this.today.getMonth() + 1,
			moveTime: 700,
			events: [],
			callback: callback || this.callback,
			otherMonth: false,
			namespace: 'jqueryCalendar'
		}, option);
		return this;
	},

	createNavi: function() {
		if (!this.option.navi) {
			return this;
		}
		var self = this;
		var list = function(className, number, text) {
			var date = new Date(self.option.year, (self.option.month + number) - 1, 1);
			var link = $('<a />')
				.text(text)
				.attr('href', 'javascript:void(0)')
				.click(function() {
					self.move(number);
					return false;
				});
			return $('<li />').addClass(className).append(link);
		};
		var text = typeof this.option.navi === 'object'
			? this.option.navi[this.option.lang] : this.option.navi;
		this.elem.append(
			$('<ul />')
				.addClass('navi')
				.append(list('prev', -1, text[0]))
				.append(list('next',  1, text[1]))
		);
		return this;
	},

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
			var weekName = typeof this.option.week === 'object'
				? this.option.week[this.option.lang] : this.option.week;
			for (var i = 0, wd; wd = weekName[i]; i++) {
				week[week.length] = [
					'<th class="', this.weekName[i], '">', wd , '</td>'
				].join('');
			}
			this.thead = $('<thead />').append(this.tr.clone().html(week.join('')))
		}
		// tbody
		this.tbody = $('tbody:first', this.table);
		this.tbody = (this.tbody.size() > 0 ? this.tbody : $('<tbody />')).empty();
		this.elem.append(
			$('<div />')
				.addClass('main')
				.append(
					this.table
						.addClass('calendar')
						.append(this.thead)
						.append(this.tbody)
				)
		);
		return this;
	},

	createCaption: function() {
		if (this.option.caption && !this.caption) {
			this.caption = $('<div />').addClass('caption');
			this.table.before(this.caption);
		}
		return this;
	},

	createTodayLink: function() {
		var self = this;
		this.table.after(
			$('<div />').addClass('todayLink').append(
				$('<a />')
					.text(['Today [', self.getKey(self.today), ']'].join(''))
					.attr('href', 'javascript:void(0)')
					.click(function() {
						self.option.month = self.today.getMonth() + 1;
						self.rebuild().show();
					})
			)
		);
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
			this.addDay(prev, 'otherMonth', this.option.hideOtherMonth);
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
			this.addDay(next, 'otherMonth', this.option.hideOtherMonth);
		}
		return this;
	},

	addDay: function(date, className, hide) {
		var key = className === 'otherMonth'
		        ? className + this.getKey(date)
		        : this.getKey(date);
		this.view[key] = this.td.clone()
			.addClass(className)
			.addClass(this.weekName[date.getDay()]);
		// White space for (IE <= 7) "empty-cells" fix
		return this.view[key].text(hide ? ' ' : date.getDate());
	},

	getKey: function(date) {
		if (typeof date === 'string') {
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
			if (typeof td !== 'undefined') {
				self.option.callback(td, this);
			}
		});
		return this;
	},

	show: function() {
		var today = this.getKey(this.today), tr, count = 0, self = this;
		$.each(self.view, function(key) {
			if (count % 7 === 0 || count === 0) {
				tr = count % 2 == 0
				   ? self.tr.clone().addClass('even')
				   : self.tr.clone().addClass('odd');
				self.tbody.append(tr);
			}
			if (key === today && !key.match('otherMonth')) {
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
		this.caption.text(this.getCaption(this.current));
		return this;
	},

	getCaption: function(date) {
		date = this.getKey(date).split('-');
		var caption = typeof this.option.caption === 'object'
			? this.option.caption[this.option.lang] : this.option.caption;
		return caption
			.replace(/%Y/i, date[0])
			.replace(/%M/i, date[1])
	},

	move: function(number) {
		var self  = this;
		var width = self.elem.innerWidth();
		var pos   = self.elem.position();
		var clone = self.elem.clone().css({
			position: 'absolute',
			top: pos.top + 'px',
			left: pos.left + 'px',
			zIndex: 1
		});
		self.wrap.append(clone).css({
			width: width + 'px',
			height: self.elem.innerHeight()
		});
		// Month change
		self.option.month = self.option.month + number;
		self.rebuild().show();
		// Moving animation
		var time = self.option.moveTime;
		self.wrap.animate({height: self.elem.innerHeight()}, time);
		// Next moving
		if ((number + '').charAt(0) !== '-') {
			clone.animate({marginLeft: '-' + width + 'px'}, time, function() {
				clone.remove();
			});
			return;
		}
		// Prev moving
		self.elem.css({
			position: 'absolute',
			marginLeft: '-' + width + 'px'
		});
		self.elem.animate({marginLeft: 0}, time, function() {
			clone.remove();
			self.elem.css('position', 'static');
		});
	},

	callback: function(td, evt) {
		var e = typeof evt.url != 'undefined'
			? $('<a />').attr('href', evt.url)
			: $('<span />');
		if (evt.id) {
			e.attr('id', 'event-' + evt.id);
		}
		if (evt.title) {
			e.attr('title', evt.title);
		}
		e.text(td.text());
		td.text('').append(e).addClass('event');
	}
};

})(jQuery);
