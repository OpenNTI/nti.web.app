export default Ext.define('NextThought.app.search.components.results.ForumResult', {
	extend: 'NextThought.app.search.components.results.BlogResult',
	alias: ['widget.search-result-forums-communityheadlinepost', 'widget.search-result-forums-generalforumcomment'],


	setTitle: function(record) {
		if (record instanceof NextThought.model.forums.CommunityHeadlinePost) {
			return this.callParent(arguments);
		}
	},


	showBreadCrumb: function(path) {
		this.callParent(arguments);

		var record = this.hitRecord;

		if (record instanceof NextThought.model.forums.CommunityHeadlinePost) {
			return;
		}

		this.setTitleForReply(record, path);
	},


	setTitleForReply: function(record, path) {
		var me = this,
			leaf = path.last(),
			leafTitle = leaf && leaf.get('title');

		UserRepository.getUser(record.get('Creator'))
			.then(function(user) {
				var title = user.getName() + ' Commented';

				if (leafTitle) {
					title += ' on ' + leafTitle;
				}

				me.titleEl.update(title);
			});
	}
});
