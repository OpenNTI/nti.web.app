const Ext = require('extjs');

require('legacy/mixins/ModelWithPublish');

require('legacy/model/Base');

module.exports = exports = Ext.define('NextThought.model.assessment.DiscussionAssignment', {
	extend: 'NextThought.model.Base',
	isAssignment: true,
	isDiscussionAssignment: true,

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.discussionassignment'
	},

	mimeType: 'application/vnd.nextthought.assessment.discussionassignment',

	mixins: {
		ModelWithPublish: NextThought.mixins.ModelWithPublish
	},

	fields: []
});
