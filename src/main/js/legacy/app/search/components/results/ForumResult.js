const Ext = require('@nti/extjs');

const UserRepository = require('legacy/cache/UserRepository');
const CommunityHeadlinePost = require('legacy/model/forums/CommunityHeadlinePost');

require('./BlogResult');


module.exports = exports = Ext.define('NextThought.app.search.components.results.ForumResult', {
	extend: 'NextThought.app.search.components.results.BlogResult',
	alias: ['widget.search-result-forums-communityheadlinepost', 'widget.search-result-forums-generalforumcomment'],


	addTitle: function (record) {
		if (record instanceof CommunityHeadlinePost) {
			return this.callParent(arguments);
		}
	},


	showBreadCrumb: function (path) {
		this.callParent(arguments);

		const record = this.hitRecord;

		if (record instanceof CommunityHeadlinePost) {
			return;
		}

		this.setTitleForReply(record, path);
	},


	setTitleForReply: function (record, path) {
		var me = this,
			leaf = path.last(),
			leafTitle = leaf && leaf.get('title');

		UserRepository.getUser(record.get('Creator'))
			.then(function (user) {
				var title = user.getName() + ' Commented';

				if (leafTitle) {
					title += ' on ' + leafTitle;
				}

				me.titleEl.update(title);
			});
	}
});
