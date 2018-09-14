const Ext = require('@nti/extjs');
const { encodeForURI } = require('@nti/lib-ntiids');
const { Forums } = require('@nti/web-discussions');
const { getService } = require('@nti/web-client');

const Forum = require('legacy/model/forums/Forum');

require('legacy/util/Parsing');
require('legacy/common/menus/Reports');

module.exports = exports = Ext.define('NextThought.app.forums.components.forum.Navigation', {
	extend: 'Ext.container.Container',
	alias: 'widget.forums-forum-nav',
	cls: 'topic-list-nav forum-nav',
	layout: 'none',

	initComponent () {
		this.callParent(arguments);
		this.forumList = this.add({
			xtype: 'react',
			component: Forums.ForumList,
			addHistory: true,
			getRouteFor: this.getRouteFor.bind(this),
			setActiveForum: this.setActiveForum
		});
		this.forumList.addCls('forum-list-nav');
	},

	afterRender () {
		this.callParent(arguments);
		this.forumList.setProps({ setActiveForum: this.setActiveForum });
	},

	async setCurrentBundle (bundle) {
		const service = await getService();
		this.currentBundle = await service.getObject(bundle.rawData.NTIID);
		this.forumList.setProps({ bundle: this.currentBundle });
	},

	getRouteFor (object, context) {
		if (object.MimeType.includes('application/vnd.nextthought.forums')) {
			return () => this.navigateToForum(Forum.interfaceToModel(object));
		}
	},

	navigateToForum (forum) {
		const id = encodeForURI(forum.getId());
		this.pushRoute(forum.get('title'), id, { forum });
		this.forumList.setProps({ activeForum: id });
	},
});
