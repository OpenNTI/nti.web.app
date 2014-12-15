Ext.define('NextThought.model.assessment.TimedAssignment', {
	extend: 'NextThought.model.assessment.Assignment',

	isTimed: true,

	fields: [
		{name: 'IsTimedAssignment', type: 'bool'},
		{name: 'MaximumTimeAllowed', type: 'int'},
		{name: 'StartTime', type: 'date'},
		{name: 'Duration', type: 'int'},
		//ui fields
		{name: 'isStarted', type: 'bool', persist: false, convert: function(v, rec) {
			return v || !!rec.getLink('StartTime');
		}},
		{name: 'startTime', type: 'int', persist: false}
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
			//if get start time fails assume we haven't started
			.fail(function() {
				return maxTime;
			});
	}
});
