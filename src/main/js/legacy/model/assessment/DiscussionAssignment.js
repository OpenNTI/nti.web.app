const Ext = require('extjs');

require('legacy/mixins/ModelWithPublish');

require('./Assignment');

module.exports = exports = Ext.define('NextThought.model.assessment.DiscussionAssignment', {
	extend: 'NextThought.model.assessment.Assignment',

	isDiscussionAssignment: true,

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.discussionassignment'
	},

	mimeType: 'application/vnd.nextthought.assessment.discussionassignment',


	fields: [
		{name: 'discussion_ntiid', type: 'string'}
	]
});
