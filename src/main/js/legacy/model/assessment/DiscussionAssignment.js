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
		//use the resolve topic link on the need to potentially pass a user param
		const discussionId = this.get('discussion_ntiid');

		return Service.getObject(discussionId);
	}
});
