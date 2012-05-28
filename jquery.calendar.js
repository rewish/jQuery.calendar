/**
 * jQuery.calendar
 *
 * @version  1.0.4
 * @author   rew <rewish.org@gmail.com>
 * @link     http://rewish.org/javascript/jquery_calendar
 * @license  http://rewish.org/license/mit The MIT License
 */
(function($) {

$.fn.calendar = function(option) {
	return this.each(function() {
		(new Calendar).init($(this), option).build().show();
	});
};

var _weekName = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
var _today = new Date;

function Calendar() {}

Calendar.prototype = $.extend({
	init: function(elem, option) {
		this.setOption(option);
		this.elem = $('<div/>')
			.addClass(this.option.cssClass)
			.css('z-index', 2);
		this.wrap = $('<div/>')
			.append(this.elem)
			.css({
				position: 'relative',
				overflow: 'hidden'
			});
		elem.append(this.wrap);
		this.view = {};
		this.preloadEvents = {};
		return this
			.buildNavi()
			.buildTable()
			.buildCaption()
			.buildTodayLink();
	},

	setOption: function(option) {
		if (this.option && !option) {
			return this;
		}
		if (this.option) {
			$.extend(this.option, option);
			return this;
		}
		this.option = $.extend({
			lang : 'ja',
			year : _today.getFullYear(),
			month: _today.getMonth() + 1,
			week: {
				en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
				ja: ['\u65e5', '\u6708', '\u706b', '\u6c34', '\u6728', '\u91d1', '\u571f']
			},
			caption: {
				en: '%Y-%M',
				ja: '%Y\u5e74%M\u6708'
			},
			navi: {
				en: ['Prev', 'Next'],
				ja: ['\u524d\u306e\u6708', '\u6b21\u306e\u6708']
			},
			todayLink: {
				en: 'Today [%Y-%M-%D]',
				ja: '\u4eca\u65e5 [%Y\u5e74%M\u6708%D\u65e5]'
			},
			moveTime : 700,
			events   : {},
			hideOther: false,
			cssClass : 'jqueryCalendar',
			// Callback functions
			addDay  : function() {},
			addEvent: function(td, evt) {
				var elem = typeof evt.url !== 'undefined'
					? $('<a/>').attr('href', evt.url) : $('<span/>');
				if (evt.id) {
					elem.attr('id', 'event-' + evt.id);
				}
				if (evt.title) {
					elem.attr('title', evt.title);
				}
				elem.text(td.text());
				td.text('').append(elem).addClass('event');
			},
			beforeMove  : function() {},
			afterMove   : function() {},
			preloadEvent: function() {}
		}, option);
		return this;
	},

	buildNavi: function() {
		if (!this.option.navi) {
			return this;
		}
		var self = this;
		var list = function(className, number, text) {
			var date = new Date(self.option.year, (self.option.month + number) - 1, 1);
			var link = $('<a/>')
				.text(text)
				.attr('href', 'javascript:void(0)')
				.click(function() {
					self.move(number);
					return false;
				});
			return $('<li/>').addClass(className).append(link);
		};
		var text = typeof this.option.navi === 'object'
			? this.option.navi[this.option.lang] : this.option.navi;
		this.elem.append(
			$('<ul/>')
				.addClass('navi')
				.append(list('prev', -1, text[0]),
				        list('next',  1, text[1]))
		);
		return this;
	},

	buildTable: function() {
		this.tr = $('<tr/>');
		this.td = $('<td/>');
		// table
		this.table = $('<table/>');
		// thead
		var week = [];
		var weekName = this.option.week[this.option.lang] || this.option.week;
		for (var i = 0, w; w = weekName[i]; i++) {
			week[week.length] = '<th class="'+ _weekName[i] +'">'+ w +'</th>';
		}
		this.thead = $('<thead/>').append(this.tr.clone().html(week.join('')))
		// tbody
		this.tbody = $('<tbody/>');
		this.elem.append(
			$('<div/>')
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

	buildCaption: function() {
		if (this.option.caption && !this.caption) {
			this.caption = $('<div/>').addClass('caption');
			this.table.before(this.caption);
		}
		return this;
	},

	buildTodayLink: function() {
		var date = this.getKey(_today).split('-');
		var linkText = typeof this.option.todayLink === 'object'
			? this.option.todayLink[this.option.lang] : this.option.todayLink;
		var self = this;
		this.table.after(
			$('<div/>').addClass('todayLink').append(
				$('<a/>')
					.text(
						linkText
							.replace(/%Y/i, date[0])
							.replace(/%M/i, date[1])
							.replace(/%D/i, date[2])
					)
					.attr('href', 'javascript:void(0)')
					.click(function() {
						self.option.year  = _today.getFullYear();
						self.option.month = _today.getMonth() + 1;
						self.rebuild().show().resetWrap();
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
			this.option.day = day;
			this.option.addDay(this.addDay(this.current, 'currentMonth'));
		}
		this.option.day = null;
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
			this.addDay(prev, 'otherMonth', this.option.hideOther);
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
			this.addDay(next, 'otherMonth', this.option.hideOther);
		}
		return this;
	},

	addDay: function(date, className, hide) {
		var key = className === 'otherMonth'
		        ? className + this.getKey(date)
		        : this.getKey(date);
		this.view[key] = this.td.clone()
			.addClass(className)
			.addClass(_weekName[date.getDay()]);
		// White space for (IE <= 7) "empty-cells" fix
		this.view[key].text(hide ? ' ' : date.getDate());
		if (key !== 'otherMonth') {
			this.view[key].attr('id', ['calendar', this.getKey(date)].join('-'));
		}
		return this.view[key];
	},

	getKey: function(date, returnArray) {
		if (typeof date === 'string') {
			date = date.split('-');
		}
		var key = [
			date[0] || date.getFullYear(),
			('0' + (date[1] || date.getMonth() + 1)).slice(-2),
			('0' + (date[2] || date.getDate())).slice(-2)
		];
		if (returnArray === true) {
			return key;
		}
		return key.join('-')
	},

	addEvent: function() {
		var self = this;
		$.each(self.option.events, function(date, event) {
			var td = self.view[self.getKey(date)];
			try {
				self.option.addEvent(td, event);
			} catch(e) {}
		});
		return this;
	},

	show: function() {
		var today = this.getKey(_today), tr, count = 0, self = this;
		$.each(self.view, function(key) {
			if (count % 7 === 0 || count === 0) {
				tr = count % 2 === 0
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
		this.setCaption();
		try {
			var date = this.getKey(this.current).split('-');
			this.preloadEvents = this.option.preloadEvent(date[0], date[1]);
		} catch(e) {}
		return this;
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
		var width = this.elem.innerWidth();
		var pos   = this.elem.position();
		var clone = this.elem.clone().css({
			position: 'absolute',
			top: pos.top + 'px',
			left: pos.left + 'px',
			zIndex: 1
		});
		this.resetWrap();
		this.wrap.append(clone);

		// Changing month
		this.option.month = this.option.month + number;

		// Before callback
		var date = new Date(this.option.year, this.option.month - 1, 1);
		date = this.getKey(date, true);
		this.option.beforeMove(this.option, date[0], date[1]);

		// Set Event
		this.setPreloadEvent(number);
		this.rebuild().show();

		// Moving animation
		var time = this.option.moveTime;
		this.wrap.animate({height: this.elem.innerHeight()}, time);

		// Next moving
		if ((number + '').charAt(0) !== '-') {
			clone.animate({marginLeft: '-' + width + 'px'}, time, function() {
				clone.remove();
			});

		// Prev moving
		} else {
			this.elem.css({
				position: 'absolute',
				marginLeft: '-' + width + 'px'
			});
			var self = this;
			this.elem.animate({marginLeft: 0}, time, function() {
				clone.remove();
				self.elem.css('position', 'static');
			});
		}
		this.option.afterMove(this.option, date[0], date[1]); // Callback
	},

	resetWrap: function() {
		this.wrap.css({
			width : this.elem.innerWidth()  + 'px',
			height: this.elem.innerHeight() + 'px'
		});
		return this;
	},

	setPreloadEvent: function(number) {
		var type = number === 1 ? 'next' : 'prev';
		try {
			if (typeof this.preloadEvents[type] === 'object') {
				return this.option.events = this.preloadEvents[type];
			}
			if (typeof this.preloadEvents === 'object') {
				return this.option.events = this.preloadEvents;
			}
		} catch(e) {}
	}

}, Calendar.prototype);

})(jQuery);
