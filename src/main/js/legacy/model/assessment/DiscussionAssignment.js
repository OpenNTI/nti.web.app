const Ext = require('extjs');
const ParseUtils = require('legacy/util/Parsing');

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


	resolveTopic (user) {
		const url = this.getLink('ResolveTopic');
		const params = user ? {user: user.getId()} : {};

		return Service.request({
			method: 'GET',
			url,
			params
		}).then((resp) => {
			return ParseUtils.parseItems([resp])[0];
		});
	}
});
