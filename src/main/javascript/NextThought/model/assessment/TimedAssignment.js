Ext.define('NextThought.model.assessment.TimedAssignment', {
	extend: 'NextThought.model.assessment.Assignment',

	isTimed: true,

	fields: [
		{name: 'IsTimedAssignment', type: 'bool'},
		{name: 'MaximumTimeAllowed', type: 'int'}, //this is in seconds
		{name: 'StartTime', type: 'date'},
		//ui fields
		{name: 'isStarted', type: 'bool', persist: false, convert: function(v, rec) {
			return v || !!rec.getLink('StartTime');
		}},
		{name: 'duration', type: 'int', persist: false}, // this is in seconds
		{name: 'startTime', type: 'int', persist: false}//this is in seconds
	],


	isStarted: function() {
		return this.get('isStarted');
	},


	start: function() {
		var me = this,
			link = this.getLink('Commence');

		if (!link) {
			console.error('No commence link');
			return Promise.reject();
		}

		return Service.post(link)
			.then(function(response) {
				var json = Ext.decode(response, true);

				if (!json || !json.StartTime) {
					console.error('Unexpected Response', response);
					return Promise.reject();
				}

				me.set({
					isStarted: true,
					startTime: json.StartTime
				});
			});
	},

	/**
	 * Take a number of seconds and return a string that looks like
	 * '# hour(s), # minute(s), and # second(s)'
	 * @param  {Number} seconds the number of seconds, since the server is sending these values back as seconds
	 * @return {String}         the time string
	 */
	__getTimeString: function(seconds) {
		var hours = parseInt(seconds / (60 * 60)),
			minutes = parseInt(seconds / 60) % 60,
			seconds = parseInt(seconds) % 60,
			time = '';

		if (hours) {
			time += Ext.util.Format.plural(hours, 'hour');

			if (minutes) {
				if (seconds) {
					time += ', ';
				} else {
					time += ' and ';
				}
			}
		}

		if (minutes) {
			time += Ext.util.Format.plural(minutes, 'minute');

			if (seconds) {
				if (hours) {
					time += ', and ';
				} else {
					time += ' and ';
				}
			}
		}

		if (seconds) {
			time += Ext.util.Format.plural(seconds, 'second');
		}

		return time;
	},


	getMaxTime: function() {
		var maxTime = this.get('MaximumTimeAllowed');

		return maxTime * 1000;
	},


	getMaxTimeString: function() {
		var maxTime = this.get('MaximumTimeAllowed');

		return this.__getTimeString(maxTime);
	},


	getStartTime: function() {
		var link = this.getLink('StartTime'),
			startTime = this.get('startTime');

		if (!link && !startTime) {
			return Promise.reject();
		}

		if (startTime) {
			return Promise.resolve(startTime);
		}

		return Service.request(link)
			.then(function(response) {
				var json = Ext.decode(response, true);

				if (!json || !json.StartTime) {
					console.error('Unexpected Response', response);
					return Promise.reject();
				}

				return json.StartTime;
			});
	},


	getTimeRemaining: function() {
		var maxTime = (this.get('MaximumTimeAllowed') || 0) * 1000;

		return this.getStartTime()
			.then(function(startTime) {
				var now = new Date(),
					start = new Date(startTime * 1000),
					diff;

				now = now.getTime();
				start = start.getTime();

				diff = now - start;

				return maxTime - diff;
			})
			//if get start time fails assume we haven't started and have the max time remaining
			.fail(function() {
				return maxTime;
			});
	},


	getDuration: function() {
		var link = this.getLink('Metadata');

		if (!link) {
			return Promise.reject('No MetaData link');
		}

		return Service.request(link)
			.then(function(response) {
				var json = Ext.decode(response);

				if (!json || !json.Duration) {
					console.error('Unexpected Response', response);
					return Promise.reject();
				}

				return json.Duration;
			});
	},


	getDurationString: function() {
		var me = this;

		return me.getDuration()
			.then(function(duration) {
				return me.__getTimeString(duration);
			});
	}
});
