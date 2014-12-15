Ext.define('NextThought.model.assessment.TimedAssignment', {
	extend: 'NextThought.model.assessment.Assignment',

	isTimed: true,

	fields: [
		{name: 'IsTimedAssignment', type: 'bool'},
		{name: 'MaximumTimeAllowed', type: 'int'}, //this is in seconds
		{name: 'Metadata', type: 'auto'},
		//ui fields
		{name: 'isStarted', type: 'bool', persist: false, convert: function(v, rec) {
			return v || !!rec.getLink('StartTime');
		}},
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
			} else if (seconds) {
				time += ' and ';
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
		var metaData = this.get('Metadata');

		return metaData && (metaData.StartTime * 1000);
	},



	getTimeRemaining: function() {
		var maxTime = (this.get('MaximumTimeAllowed') || 0) * 1000;

		return Promise.resolve(this.getStartTime())
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
		var metaData = this.get('Metadata');

		return metaData && (metaData.Duration * 1000);
	},


	getCompletedInTime: function() {
		var maxTime = this.get('MaximumTimeAllowed');

		return this.getDuration()
					.then(function(duration) {
						return duration < maxTime;
					});
	}
});
