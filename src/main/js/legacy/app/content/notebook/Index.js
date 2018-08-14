const Ext = require('@nti/extjs');
const { Stream } = require('@nti/web-content');
const { getService } = require('@nti/web-client');

const User = require('legacy/model/User');
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
		if (context === 'stream-highlight') {
			return () => this.navigateToObject(object);
		} else if (object.isUser) {
			return `/app/user/${User.getUsernameForURL(object.Username)}`;
		}
	},

	async bundleChanged (bundle) {
		if (this.currentBundle === bundle) { return; }

		this.currentBundle = bundle;

		if (this.notebook) {
			const service = await getService();
			const context = await service.getObject(this.currentBundle.rawData);

			this.notebook.setProps({ context });
		}
	},
});
