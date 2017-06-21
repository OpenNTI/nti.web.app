const Ext = require('extjs');

const ParseUtils = require('legacy/util/Parsing');

const User = require('../../User');

require('../../Base');
require('../../User');


module.exports = exports = Ext.define('NextThought.model.courses.assignments.Summary', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Alias', type: 'string'},
		{name: 'Username', type: 'string'},
		{name: 'avatar', type: 'string', defaultValue: User.BLANK_AVATAR},
		{name: 'HistoryItemSummary', type: 'singleItem'},
		{name: 'PredictedGrade', type: 'auto'},
		{name: 'OverdueAssignmentCount', type: 'int'},
		{name: 'UngradedAssignmentCount', type: 'int'},
		{name: 'User', type: 'auto'},
		{name: 'AvailableAssignmentNTIIDs', type: 'auto'},
		{name: 'AvailableFinalGrade', type: 'bool'}
	],

	hasFinalGrade: function () {
		return this.get('AvailableFinalGrade');
	},


	updatePredicted () {
		const link = this.getLink('CurrentGrade');

		if (!link) { return Promise.reject('No Link'); }

		return Service.request(link)
			.then((resp) => {
				const json = JSON.parse(resp);
				const grade = ParseUtils.parseItems(json.PredictedGrade)[0];
				const predicted = grade.isPredicted() ?
									{Correctness: grade.get('Correctness'), Grade: grade.get('Grade'), RawValue: grade.get('RawValue')} :
									null;

				//Dirty hack to cover up extjs' mess
				this.suspendEvents();
				this.editing = true;
				this.set('PredictedGrade', predicted);
				delete this.editing;
				this.resumeEvents();

				this.fireEvent('update');
			})
			.catch(() => {
				//Dirty hack to cover up extjs' mess
				this.suspendEvents();
				this.editing = true;
				this.set('PredictedGrade', null);
				delete this.editing;
				this.resumeEvents();

				this.fireEvent('update');
			});
	}
});
