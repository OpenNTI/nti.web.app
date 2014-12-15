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
				var newAssignment = ParseUtils.parseItems(response)[0];


				me.set(newAssignment.getData());
			});
	},

	/**
	 * Take a number of seconds and return a string that looks like
	 * '# hour(s), # minute(s), and # second(s)'
	 * @param  {Number} seconds the number of seconds, since the server is sending these values back as seconds
	 * @return {String}         the time string
	 */
	__getTimeString: function(seconds) {
		var hours = parseInt(seconds / (60 * 60), 10),
			minutes = parseInt(seconds / 60, 10) % 60,
			secs = parseInt(seconds, 10) % 60,
			time = '';

		if (hours) {
			time += Ext.util.Format.plural(hours, 'hour');

			if (minutes) {
				if (secs) {
					time += ', ';
				} else {
					time += ' and ';
				}
			} else if (secs) {
				time += ' and ';
			}
		}

		if (minutes) {
			time += Ext.util.Format.plural(minutes, 'minute');

			if (secs) {
				if (hours) {
					time += ', and ';
				} else {
					time += ' and ';
				}
			}
		}

		if (secs) {
			time += Ext.util.Format.plural(secs, 'second');
		}

		return time;
	},


	updateMetaData: function(metaData) {
		var current = this.get('Metadata');

		if (!current) {
			this.set('Metadata', metaData);
		}
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
		var metaData = this.get('Metadata'),
			startTime = this.get('startTime');

		return (metaData && (metaData.StartTime * 1000)) || startTime * 1000;
	},



	getTimeRemaining: function() {
		var maxTime = this.getMaxTime(),
			startTime = this.getStartTime();

		return new Promise(function(fulfill, reject) {
			var now = (new Date()).getTime(), diff;

			if (!startTime) {
				fulfill(maxTime);
			} else {
				diff = now - startTime;

				fulfill(maxTime - diff);
			}
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
