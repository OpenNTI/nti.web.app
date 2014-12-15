Ext.define('NextThought.util.Time', {
	singleton: true,

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
		var time = startTime || 0,
			interval, timerInterval,
			tickFn, alarmFn;

		direction = direction || 1;

		function getRemainingHours() {
			return parseInt(time / (60 * 60 * 1000), 10);//milli / 1000 = seconds, seconds / 60 = minutes, minutes / 60 = hours
		}

		function getRemainingMinutes() {
			return parseInt(time / (60 * 1000), 10) % 60;//milli / 10000 = seconds, seconds / 60 = minutes
		}

		function getRemainingSeconds() {
			return parseInt(time / 1000) % 60;//milli / 1000 = seconds
		}

		function getRemainingMilliSeconds() {
			return time % 1000;
		}

 		/**
 		 * Add a callback to be called everytime the interval passes
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
			tickFn = fn;

			return this;
		};

		function updateTime() {
			time = time + (direction * interval);

			if (tickFn) {
				tickFn.call(null, {
					hours: getRemainingHours(),
					minutes: getRemainingMinutes(),
					seconds: getRemainingSeconds(),
					milliseconds: getRemainingMilliSeconds(),
					remaining: time
				});
			}

			//if we are on the last interval before 0 and counting down stop
			if ((time - interval) <= 0 && direction < 0) {
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
