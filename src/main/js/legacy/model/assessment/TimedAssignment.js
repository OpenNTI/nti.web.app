var Ext = require('extjs');
var ParseUtils = require('../../util/Parsing');
var TimeUtils = require('../../util/Time');
var AssessmentAssignment = require('./Assignment');


module.exports = exports = Ext.define('NextThought.model.assessment.TimedAssignment', {
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
		var link = this.getLink('TimeRemaining');

		function fail() {
			console.error('Unable get time remaining.. Returning Zero');
			return Promise.resolve(0);
		}

		if (!link) {
			return fail();
		}

		return Service.request(link)
				.then(function(response) {
					var json = JSON.parse(response);

					return json.TimeRemaining * 1000;
				})
				.fail(fail);
	},


	getDuration: function() {
		var metaData = this.get('Metadata');

		return metaData && (metaData.Duration * 1000);
	}
});
