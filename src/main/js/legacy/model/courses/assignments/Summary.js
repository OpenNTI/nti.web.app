const Ext = require('extjs');
const User = require('../../User');
const ParseUtils = require('legacy/util/Parsing');

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
				const grade = ParseUtils.parseItems(resp)[0];
				const predicted = grade.isPredicted() ?
									{Correctness: grade.get('Correctness'), Grade: grade.get('Grade'), RawValue: grade.get('RawValue')} :
									null;

				this.set('PredictedGrade', predicted);
				this.fireEvent('update');
			});
	}
});
