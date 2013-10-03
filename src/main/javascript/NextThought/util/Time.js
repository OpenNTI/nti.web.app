Ext.define('NextThought.util.Time', {
	singleton: true,

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
	}

},
function() {
	window.TimeUtils = this;
	Ext.util.Format.timeDifference = Ext.bind(this.timeDifference, this);
});
