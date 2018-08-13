const Ext = require('@nti/extjs');
const { Stream } = require('@nti/web-content');
const { getService } = require('@nti/web-client');

require('legacy/mixins/Router');

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
			component: Stream
		});
	},

	async bundleChanged (bundle) {
		if (this.currentBundle === bundle) { return; }

		this.currentBundle = bundle;
		this.root = await Service.getPageInfo(bundle.getFirstPage(), null, null, null, bundle);

		if (this.notebook) {
			const service = await getService();
			const context = await service.getObject(this.root.rawData);

			this.notebook.setProps({ context });
		}
	},
});
