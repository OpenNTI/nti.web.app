Ext.define('NextThought.util.Time', {
	singleton: true,

	DIVISORS: {
		WEEKS: 7 * 24 * 60 * 60 * 1000, //millis / 1000 = seconds / 60 = minutes / 60 = hours / 24 = days / 7 = weeks
		DAYS: 24 * 60 * 60 * 1000, //millis / 1000 = seconds / 60 = minutes / 60 = hours / 24 = days
		HOURS: 60 * 60 * 1000, //millis / 1000 = seconds / 60 = minutes / 60 = hours
		MINUTES: 60 * 1000, // millis / 1000 = seconds / 60 = minutes
		SECONDS: 1000 //millis / 1000 = seconds
	},


	getTimeGroupHeader: function(time) {
		var now = new Date(), t = time.getTime(),
			oneDayAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
			twoDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
			oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1 * 7);

		function between(start, end) {
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

		return new Duration(Math.abs(now - time) / 1000).ago();
	},

	//yanked & modifed from: http://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time-eg-2-seconds-ago-one-week-ago-etc-best
	timeDifference: function(current, previous) {

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



	getDurationText: function(started, ended) {
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


	getTimer: function(startTime, direction) {
		return new this._timer(startTime, direction);
	},


	/**
	 * Takes two dates and returns true if they are on the same day
	 * @param  {Date}  a date to compare
	 * @param  {Date}  b the other date to compare
	 * @return {Boolean}   if they are on the same day
	 */
	isSameDay: function(a, b) {
		//clone the dates so we don't affect what we were passed
		a = new Date(a);
		b = new Date(b);

		//set the hours to 0 so they will both be at 12:00:00 at the start of the day
		a.setHours(0, 0, 0, 0);
		b.setHours(0, 0, 0, 0);

		return a.getTime() === b.getTime();
	},

	/**
	 * Takes a number of milliseconds and returns a string that is more similar
	 * to how a human would say it (hopefully)
	 *
	 * ex. 2 weeks, 2 days, and 2 hours
	 *
	 * @param  {Number} millis         millis to convert
	 * @param  {Number} numberOfUnits  How many units (weeks, days, hours, etc.) to include
	 * @param  {Boolean} doNotPluralize whether or not to pluralize the units
	 * @param  {Object} overrides Strings to use instead of the defaults
	 * @return {String}                the parsed string
	 */
	getNaturalDuration: function(millis, numberOfUnits, doNotPluralize, overrides) {
		var units = [], lastItem, s,
			weeks = parseInt(millis / this.DIVISORS.WEEKS, 10),
			days = parseInt(millis / this.DIVISORS.DAYS, 10) % 7,
			hours = parseInt(millis / this.DIVISORS.HOURS, 10) % 24,
			minutes = parseInt(millis / this.DIVISORS.MINUTES, 10) % 60,
			seconds = parseInt(millis / this.DIVISORS.SECONDS, 10) % 60;

		overrides = overrides || {};

		function add(unit, label) {
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
		units = units.filter(function(val) {
			return val;
		});

		if (units.length === 1) {
			s = units[0];
		} else if (units.length === 2) {
			s = units.join(' and ');
		} else {
			lastItem = units.pop();

			s = units.join(', ');

			s += ', and ' + lastItem;
		}

		return s;
	}
},
function() {
	window.TimeUtils = this;
	Ext.util.Format.timeDifference = Ext.bind(this.timeDifference, this);

	/**
	 * A utility to start a timer down from a number of milliseconds, or up
	 *
	 * @param  {Number} remaining the number of milliseconds to countdown from, if falsy the timer will count up
	 * @param {Number} direction 1 to count up, -1 to count down, default to 1
	 */
	this._timer = function(startTime, direction) {
		var start = (new Date()).getTime(),
			interval, timerInterval,
			tickFn, alarmFn;

		start = start + (startTime || 0);

		direction = direction || 1;

		function getRemainingDays(time) {
			return parseInt(time / (24 * 60 * 60 * 1000), 10); // milli / 1000 = seconds / 60  = minutes / 60 = hours / 24 = days
		}

		function getRemainingHours(time) {
			return parseInt(time / (60 * 60 * 1000), 10) % 24;//milli / 1000 = seconds, seconds / 60 = minutes, minutes / 60 = hours
		}

		function getRemainingMinutes(time) {
			return parseInt(time / (60 * 1000), 10) % 60;//milli / 10000 = seconds, seconds / 60 = minutes
		}

		function getRemainingSeconds(time) {
			return parseInt(time / 1000, 10) % 60;//milli / 1000 = seconds
		}

		function getRemainingMilliSeconds(time) {
			return time % 1000;
		}

		function getTimeDiff() {
			var now = (new Date()).getTime();

			//if we are counting down start should be greater than now
			return direction < 0 ? start - now : now - start;
		}

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
		 * @return {Object}      return this so calls can be chained
		*/
		this.tick = function(fn) {
			var time = getTimeDiff();

			tickFn = fn;

			tickFn.call(null, {
				days: getRemainingDays(time),
				hours: getRemainingHours(time),
				minutes: getRemainingMinutes(time),
				seconds: getRemainingSeconds(time),
				milliseconds: getRemainingMilliSeconds(time),
				remaining: time
			});

			return this;
		};

		function updateTime() {
			var time = getTimeDiff();

			if (tickFn) {
				tickFn.call(null, {
					days: getRemainingDays(time),
					hours: getRemainingHours(time),
					minutes: getRemainingMinutes(time),
					seconds: getRemainingSeconds(time),
					milliseconds: getRemainingMilliSeconds(time),
					remaining: time
				});
			}

			//if we are on the last interval before 0 and counting down stop
			if (time <= 0 && direction < 0) {
				clearInterval(timerInterval);

				if (alarmFn) {
					alarmFn.call();
				}
			}
		}

		/**
		 * Start an interval to do the countdown
		 * @param  {Number} val length of the interval in milliseconds
		 * @return {Object}     this so calls can be changed
		 */
		this.start = function(val) {
			var me = this;

			if (!val) {
				val = 1000;
			}

			interval = val;

			updateTime();

			timerInterval = setInterval(function() {
				updateTime();
			}, interval);

			return me;
		};

		/**
		 * Clear the interval, make sure you call this eventually
		 */
		this.stop = function() {
			clearInterval(timerInterval);
		};


		/**
		 * A callback to be called when the timer reaches 0
		 * @param  {Function} fn callback
		 * @return {Object}      return this so calls can be chained
		 */
		this.alarm = function(fn) {
			alarmFn = fn;

			return this;
		};
	};
});
