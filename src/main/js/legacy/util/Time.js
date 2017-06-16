const Ext = require('extjs');
const {DateTime} = require('nti-web-commons');
const moment = require('moment');

global.TimeUtils =
module.exports = exports = Ext.define('NextThought.util.Time', {

	DIVISORS: {
		WEEKS: 7 * 24 * 60 * 60 * 1000, //millis / 1000 = seconds / 60 = minutes / 60 = hours / 24 = days / 7 = weeks
		DAYS: 24 * 60 * 60 * 1000, //millis / 1000 = seconds / 60 = minutes / 60 = hours / 24 = days
		HOURS: 60 * 60 * 1000, //millis / 1000 = seconds / 60 = minutes / 60 = hours
		MINUTES: 60 * 1000, // millis / 1000 = seconds / 60 = minutes
		SECONDS: 1000 //millis / 1000 = seconds
	},


	getTimeGroupHeader: function (time) {
		var now = new Date(), t = time.getTime(),
			oneDayAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
			twoDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
			oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1 * 7);

		function between (start, end) {
			return start.getTime() < t && t <= end.getTime();
		}

		if (between(oneDayAgo, now)) {
			return 'Today';
		}

		if (between(twoDaysAgo, oneDayAgo)) {
			return 'Yesterday';
		}

		if (between(oneWeekAgo, twoDaysAgo)) {
			return Ext.Date.format(time, ' l');
		}

		return DateTime.fromNow(time);
	},

	//yanked & modifed from: http://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time-eg-2-seconds-ago-one-week-ago-etc-best
	timeDifference: function (current, previous) {

		if (!previous) {
			previous = current;
			current = new Date();
		}

		var msPerMinute = 60 * 1000,
			msPerHour = msPerMinute * 60,
			msPerDay = msPerHour * 24,
			msPerMonth = msPerDay * 30,
			elapsed = current - previous,
			result;

		// We are interested in the time interval.
		if (elapsed < 0) {
			elapsed = Math.abs(elapsed);
		}

		if (elapsed < msPerMinute) {
			result = Math.round(elapsed / 1000) + ' seconds ago';
		}

		else if (elapsed < msPerHour) {
			result = Math.round(elapsed / msPerMinute) + ' minutes ago';
		}

		else if (elapsed < msPerDay) {
			result = Math.round(elapsed / msPerHour) + ' hours ago';
		}

		else if (elapsed < msPerMonth) {
			result = Math.round(elapsed / msPerDay) + ' days ago';
		}

		if (!result) {
			return Ext.Date.format(previous, 'M j, Y, g:i a');
		}

		if (/^1\s/.test(result)) {
			result = result.replace('s ago', ' ago');
		}
		return result;
	},



	getDurationText: function (started, ended) {
		var milli = ended - started,
			seconds = milli / 1000,
			minutes = seconds / 60,
			hours = minutes / 60,
			days = hours / 24,
			str = '';

		seconds = seconds % 60;
		minutes = minutes % 60;
		hours = hours % 24;


		if (days >= 1) {
			str = Math.floor(days) + 'd ' + Math.ceil(hours) + 'h';
		}else if (hours >= 1) {
			str = Math.floor(hours) + 'h ' + Math.ceil(minutes) + 'm';
		}else {
			str = Math.floor(minutes) + 'm ' + Math.ceil(seconds) + 's';
		}

		return str;
	},


	getTimer: function () {
		return new this._timer();
	},


	/**
	 * Takes two dates and returns true if they are on the same day
	 * @param  {Date}  a date to compare
	 * @param  {Date}  b the other date to compare
	 * @return {Boolean}   if they are on the same day
	 */
	isSameDay: function (a, b) {
		//clone the dates so we don't affect what we were passed
		a = new Date(a);
		b = new Date(b);

		//set the hours to 0 so they will both be at 12:00:00 at the start of the day
		a.setHours(0, 0, 0, 0);
		b.setHours(0, 0, 0, 0);

		return a.getTime() === b.getTime();
	},

	getDays: function (time) {
		return time / (24 * 60 * 60 * 1000); // milli / 1000 = seconds / 60	 = minutes / 60 = hours / 24 = days
	},

	getHours: function getRemainingHours (time) {
		return (time / (60 * 60 * 1000)) % 24;//milli / 1000 = seconds, seconds / 60 = minutes, minutes / 60 = hours
	},

	getMinutes: function (time) {
		return (time / (60 * 1000)) % 60;//milli / 10000 = seconds, seconds / 60 = minutes
	},

	getSeconds: function (time) {
		return (time / 1000) % 60;//milli / 1000 = seconds
	},

	getMilliSeconds: function (time) {
		return time % 1000;
	},

	getTimePartsFromTime: function (time) {
		return {
			days: this.getDays(time),
			hours: this.getHours(time),
			minutes: this.getMinutes(time),
			seconds: this.getSeconds(time)
		};
	},

	/**
	 * Takes a number of milliseconds and returns a string that is more similar
	 * to how a human would say it (hopefully)
	 *
	 * ex. 2 weeks, 2 days, and 2 hours
	 *
	 * @param  {Number} millis		   millis to convert
	 * @param  {Number} numberOfUnits  How many units (weeks, days, hours, etc.) to include
	 * @param  {Boolean} doNotPluralize whether or not to pluralize the units
	 * @param  {Object} overrides Strings to use instead of the defaults
	 * @return {String}				   the parsed string
	 */
	getNaturalDuration: function (millis, numberOfUnits, doNotPluralize, overrides) {
		var units = [], lastItem, s,
			weeks = Math.floor(parseInt(millis, 10) / this.DIVISORS.WEEKS),
			days =	Math.floor(parseInt(millis, 10) / this.DIVISORS.DAYS % 7),
			hours =	 Math.floor(parseInt(millis, 10) / this.DIVISORS.HOURS % 24),
			minutes =  Math.floor(parseInt(millis, 10) / this.DIVISORS.MINUTES % 60),
			seconds =  Math.round(parseInt(millis, 10) / this.DIVISORS.SECONDS % 60);

		overrides = overrides || {};
		numberOfUnits = numberOfUnits || 5;

		function add (unit, label) {
			units.push(doNotPluralize ? unit + ' ' + label : Ext.util.Format.plural(unit, label));
		}

		//if we have a unit and we haven't pushed the max number add it
		if (weeks && units.length < numberOfUnits) {
			add(weeks, overrides.week || 'week');
		}

		if (days && units.length < numberOfUnits) {
			add(days, overrides.day || 'day');
		} else if (weeks) {
			//if there no days but there are weeks add an empty string to the units to keep the units we show
			//from being too far about e.x. 2 weeks and 5 seconds
			units.push('');
		}

		if (hours && units.length < numberOfUnits) {
			add(hours, overrides.hour || 'hour');
		} else if (weeks || days) {
			units.push('');
		}

		if (minutes && units.length < numberOfUnits) {
			add(minutes, overrides.minute || 'minute');
		} else if (weeks || days || hours) {
			units.push('');
		}

		if (seconds && units.length < numberOfUnits) {
			add(seconds, overrides.second || 'second');
		}

		//filter out any empty strings we may have added
		units = units.filter(function (val) {
			return val;
		});

		if (units.length === 1) {
			s = units[0];
		} else if (units.length === 2) {
			s = units.join(' and ');
		} else if (units.length === 0) {
			s = '';
		}
		else {
			lastItem = units.pop();

			s = units.join(', ');

			s += ', and ' + lastItem;
		}

		return s;
	},

	/**
	 * Takes a moment constructor config (http://momentjs.com/docs/#/parsing/) and returns an object with:
	 *
	 * day: the moment for the date passed
	 * start: the moment for the start of the current week (last Monday)
	 * end: the moment for the end of the current week (next Sunday)
	 * getNext: calls this function with a week from the date given
	 * getPrevious: calls this function with a week before the date given
	 *
	 * @param  {Date|String} date argument to pass to the moment constructor, falsy means today
	 * @return {Object}		 utility for stepping through the weeks
	 */
	getWeek: function (date) {
		var m = date ? moment(date) : moment();

		return {
			day: m,
			start: moment(m).startOf('isoWeek'),
			end: moment(m).endOf('isoWeek'),
			getNext: this.getWeek.bind(this, moment(m).add(1, 'weeks')),
			getPrevious: this.getWeek.bind(this, moment(m).subtract(1, 'weeks'))
		};
	}
}).create();


Ext.util.Format.timeDifference = exports.timeDifference.bind(exports);

/*
 * A utility to do a count down or count up from a starting point until a stopping point or infinity
 */
exports._timer = function () {
	var start, from, to, direction, duration, interval, intervalWindow, timerInterval, tickFn, alarmFn, intervalUnit;

	function getTimeStamp (d) {
		if (!d && d !== 0) {
			d = (new Date()).getTime();
		} else if (d instanceof Date) {
			d = d.getTime();
		}

		return d;
	}

	function updateTime () {
		var now = new Date(),
			diff, time;

		if (intervalUnit === 'seconds') {
			now.setMilliseconds(0);
		}

		now = now.getTime();

		diff = now - start;
		time = from + (direction * diff);

		if (tickFn) {
			tickFn.call(null, {
				days: exports.getDays(time),
				hours: exports.getHours(time),
				minutes: exports.getMinutes(time),
				seconds: exports.getSeconds(time),
				millisseconds: exports.getMilliSeconds(time),
				time: time,
				remaining: Math.abs(to - time)
			});
		}

		//if we've reached the target then call the alarm if there is one
		//set the alarmFn to null so we don't call it again
		//if the diff is with in half of the iteration of the duration
		if (alarmFn && Math.abs(diff - duration) <= intervalWindow) {
			alarmFn.call();
			alarmFn = null;
		}
	}

	/**
	 * Start the count down/up and update on the interval
	 * @param  {Number} i how often to update
	 * @return {Object}			 this so calls can be chained
	 */
	this.start = function (i) {
		interval = i || 'seconds'; //default to a second

		duration = Math.abs(from - to);

		if (typeof interval === 'string') {
			intervalUnit = interval;
		}

		//if we are using seconds set the millis to 0 so we start on an
		//even second
		if (intervalUnit === 'seconds') {
			interval = 1000;
			start = new Date();
			start.setMilliseconds(0);
			start = start.getTime();
		}

		start = start || (new Date()).getTime();
		intervalWindow = interval / 2;

		timerInterval = setInterval(updateTime, interval);

		return this;
	};

	/**
	 * Set a count down from t to f
	 * @param  {Date|Number} t date or milliseconds to stop at
	 * @param  {Date|Number} f date or milliseconds to start at
	 * @return {Object}	  this so calls can be chained
	 */
	this.countDown = function (t, f) {
		from = getTimeStamp(f);

		if (t || t === 0) {
			to = getTimeStamp(t);
		} else {
			to = Infinity;
		}

		direction = -1;

		return this;
	};

	/**
	 * Set a count up from t to f
	 * @param  {Date|Number} t date or milliseconds to stop at
	 * @param  {Date|Number} f date or milliseconds to start at
	 * @return {Object}	  this so calls can be chained
	 */
	this.countUp = function (t, f) {
		from = getTimeStamp(f);

		if (t || t === 0) {
			to = getTimeStamp(t);
		} else {
			to = Infinity;
		}

		direction = 1;

		return this;
	};

	/**
	 * Add a callback to be called every time the interval passes
	 *
	 *	Will be called with an object containing...
	 *	{
	 *		hours: int, //number of hours left
	 *		minutes: int, //number of minutes left after hours
	 *		seconds: int, //number of seconds left after minutes
	 *		milliseconds: int, //number of milliseconds left after seconds
	 *		remaining: int, //total number of milliseconds left
	 *	}
	 *
	 * @param  {Function} fn callback to be called
	 * @return {Object}		 return this so calls can be chained
	*/
	this.tick = function (fn) {
		var time = from;

		tickFn = fn;

		tickFn.call(null, {
			days: exports.getDays(time),
			hours: exports.getHours(time),
			minutes: exports.getMinutes(time),
			seconds: exports.getSeconds(time),
			milliseconds: exports.getMilliSeconds(time),
			time: time,
			remaining: Math.abs(to - from)
		});

		return this;
	};


	/**
	 * Clear the interval, make sure this gets called. Otherwise we will have an interval hanging around
	 * @return {Object} return this so calls can be chained
	 */
	this.stop = function () {
		clearInterval(timerInterval);

		return this;
	};


	/**
	 * A callback to be called when the timer reaches the destination
	 * @param  {Function} fn [description]
	 * @return {Object}		 return this so calls can be chained
	 */
	this.alarm = function (fn) {
		alarmFn = fn;

		return this;
	};
};
