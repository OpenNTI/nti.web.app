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

	initComponent () {
		this.callParent(arguments);

		this.forumList = this.add({
			xtype: 'react',
			component: Forums.ForumList,
			addHistory: true,
			getRouteFor: this.getRouteFor.bind(this),
			setActiveForum: this.setInitForum
		});
	},

	afterRender () {
		this.callParent(arguments);
		this.forumList.setProps({ setActiveForum: this.setInitForum });
	},

	scrollToActive () {
		const selectedItem = this.frameBodyEl && this.frameBodyEl.dom.getElementsByClassName('x-item-selected')[0];

		if(selectedItem) {
			this.frameBodyEl.dom.scrollTop = selectedItem.offsetTop;
		}
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
	},

	setActiveForum (id) {
		if (this.forumList) {
			this.forumList.setProps({ activeForum: id });
		}
	}
});
