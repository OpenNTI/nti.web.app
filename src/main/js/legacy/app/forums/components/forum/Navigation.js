const Ext = require('@nti/extjs');
const { encodeForURI } = require('@nti/lib-ntiids');
const { Forums } = require('@nti/web-discussions');

require('legacy/util/Parsing');
require('legacy/common/menus/Reports');

module.exports = exports = Ext.define('NextThought.app.forums.components.forum.Navigation', {
	extend: 'Ext.container.Container',
	alias: 'widget.forums-forum-nav',
	cls: 'topic-list-nav forum-nav',
	layout: 'none',

	setBaseRoute (baseroute) {
		if (this.forumList) {
			this.forumList.setBaseRoute(baseroute);
		}
	},

	async setCurrentBundle (bundle) {
		if (!this.currentBundle || this.currentBundle.getID() !== bundle.getId()) {
			if (this.forumList) {
				this.forumList.destroy();
				delete this.forumList;
			}

			this.currentBundle = await bundle.getInterfaceInstance();

			this.forumList = this.add({
				xtype: 'react',
				component: Forums.ForumList,
				getRouteFor: this.getRouteFor.bind(this),
				setActiveForum: this.setActiveForum,
				bundle: this.currentBundle
			});
			this.forumList.addCls('forum-list-nav');
		}
	},

	getRouteFor (object) {
		if (object.MimeType.includes('application/vnd.nextthought.forums')) {
			return `./${encodeForURI(object.NTIID)}`;
		}
	},

	navigateToForum (forum) {
		const id = encodeForURI(forum.getId());
		this.pushRoute(forum.get('title'), id, { forum });
		this.forumList.setProps({ activeForum: id });
	},
});
