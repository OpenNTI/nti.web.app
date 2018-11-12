const Ext = require('@nti/extjs');

const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));
// const Duration = require('durationjs');

require('../Base');

module.exports = exports = Ext.define('NextThought.model.assessment.UsersCourseAssignmentAttemptMetadataItem', {
	extend: 'NextThought.model.Base',

	mimeType: 'application/vnd.nextthought.assessment.userscourseassignmentattemptmetadataitem',

	fields: [
		{name: 'StartTime', type: 'any'},
		{name: 'SubmitTime', type: 'date'},
		{name: 'Duration', type: 'any'},
	],


	getAssignment () {
		const link = this.getLink('Assignment');

		if (!link) { return Promise.reject('No Assignment Link'); }

		return Service.request(link)
			.then(response => lazy.ParseUtils.parseItems(response)[0]);
	},


	getStartTime () {
		const start = this.get('StartTime');

		return start && (start * 1000);
	},


	getDuration () {
		const duration = this.get('Duration');

		return duration && (duration * 1000);
	}
});
