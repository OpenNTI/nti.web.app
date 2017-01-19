const Ext = require('extjs');

require('legacy/mixins/ModelWithPublish');

require('./Assignment');

module.exports = exports = Ext.define('NextThought.model.assessment.DiscussionAssignment', {
	extend: 'NextThought.model.assessment.Assignment',

	isDiscussion: true,

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.discussionassignment'
	},

	mimeType: 'application/vnd.nextthought.assessment.discussionassignment',


	fields: [
		{name: 'discussion_ntiid', type: 'string'}
	],


	resolveTopic () {
		const discussionId = this.get('discussion_ntiid');

		return Service.getObject(discussionId);
	}
});
