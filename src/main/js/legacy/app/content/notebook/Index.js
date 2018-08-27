const Ext = require('@nti/extjs');
const { Stream } = require('@nti/web-content');
const { getService } = require('@nti/web-client');

const User = require('legacy/model/User');
const Note = require('legacy/model/Note');
const HighLight = require('legacy/model/Highlight');
const Bookmark = require('legacy/model/Bookmark');

require('legacy/mixins/Router');
require('legacy/mixins/ProfileLinks');

module.exports = exports = Ext.define('NextThought.app.content.notebook.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.bundle-notebook',
	layout: 'none',
	title: 'Notebook',
	cls: 'notebook',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	items: [],

	initComponent () {
		this.callParent(arguments);

		this.notebook = this.add({
			xtype: 'react',
			component: Stream,
			addHistory: true,
			getRouteFor: this.getRouteFor.bind(this)
		});
	},

	getRouteFor (object, context) {
		if (object.MimeType === HighLight.mimeType) {
			return () => this.Router.root.attemptToNavigateToObject(HighLight.interfaceToModel(object));
		} else if (object.MimeType === Bookmark.mimeType) {
			return () => this.Router.root.attemptToNavigateToObject(Bookmark.interfaceToModel(object));
		} else if (object.MimeType === Note.mimeType) {
			return () => this.Router.root.attemptToNavigateToObject(Note.interfaceToModel(object));
		} else if (object.isUser) {
			return `/app/user/${User.getUsernameForURL(object.Username)}`;
		}
	},

	async bundleChanged (bundle) {
		this.setTitle('Notebook');

		if (this.currentBundle === bundle) { return; }

		this.currentBundle = bundle;

		if (this.notebook) {
			const service = await getService();
			const context = await service.getObject(this.currentBundle.rawData);

			this.notebook.setProps({ context });
		}
	},
});
