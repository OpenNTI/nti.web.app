export default Ext.define('NextThought.model.assessment.TimedAssignment', {
	extend: 'NextThought.model.assessment.Assignment',

	isTimed: true,

	fields: [
		{name: 'IsTimedAssignment', type: 'bool'},
		{name: 'MaximumTimeAllowed', type: 'int'}, //this is in seconds
		{name: 'Metadata', type: 'auto'},
		//ui fields
		{name: 'isStarted', type: 'bool', persist: false, convert: function(v, rec) {
			return v || !!rec.getLink('StartTime');
		}}
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
				return me;
			});
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

		return TimeUtils.getNaturalDuration(maxTime, 2);
	},


	getStartTime: function() {
		var metaData = this.get('Metadata');

		return (metaData && (metaData.StartTime * 1000));
	},



	getTimeRemaining: function() {
		var maxTime = this.getMaxTime(),
			now = (new Date()).getTime(), diff,
			startTime = this.getStartTime();

		if (!startTime) {
			diff = 0;
		} else {
			diff = now - startTime;
		}

		return maxTime - diff;
	},


	getDuration: function() {
		var metaData = this.get('Metadata');

		return metaData && (metaData.Duration * 1000);
	}
});
