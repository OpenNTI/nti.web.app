const Ext = require('@nti/extjs');
const { encodeForURI } = require('@nti/lib-ntiids');
const { Forums } = require('@nti/web-discussions');

require('legacy/util/Parsing');

module.exports = exports = Ext.define('NextThought.app.forums.components.forum.Navigation', {
	extend: 'Ext.container.Container',
	alias: 'widget.forums-forum-nav',
	cls: 'topic-list-nav forum-nav',
	layout: 'none',

	async setCurrentBundle (bundle) {
		if (!this.currentBundle || this.currentBundle.getID() !== bundle.getId()) {
			if (this.forumList) {
				this.forumList.destroy();
				delete this.forumList;
			}

			this.currentBundle = await bundle.getInterfaceInstance();
			const baseroute = `/app/${bundle.isCourse ? 'course' : 'bundle'}/${encodeForURI(bundle.getId())}/discussions`;
			this.forumList = this.add({
				xtype: 'react',
				component: Forums.ForumList,
				getRouteFor: this.getRouteFor.bind(this),
				baseroute: baseroute,
				setFirstForum: this.setFirstForum,
				bundle: this.currentBundle,
				activeForumId: this.activeForumId
			});
			this.forumList.addCls('forum-list-nav');
		}
	},

	getRouteFor (object) {
		if (object.MimeType.includes('application/vnd.nextthought.forums')) {
			return `./${encodeForURI(object.getID())}`;
		}
	},

	setActiveForum (activeForumId) {
		this.activeForumId = activeForumId;
		if (this.forumList) {
			this.forumList.setProps({ activeForumId });
		}
	}
});
