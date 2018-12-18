const Ext = require('@nti/extjs');
const {Widgets} = require('@nti/web-content');

require('legacy/overrides/ReactHarness');

module.exports = exports = Ext.define('NextThought.app.contentviewer.components.EmbededWidget', {
	extend: 'Ext.Component',
	alias: 'widget.overlay-content-embeded-widget-frame',

	cls: 'content-embeded-widget',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'container'}
	]),

	renderSelectors: {
		containerEl: '.container'
	},



	afterRender: function () {
		this.callParent(arguments);

		const data = {...(this.data || {})};
		const location = this.reader && this.reader.getLocation();

		delete data['attribute-class'];
		delete data['attribute-data-ntiid'];
		delete data['attribute-id'];
		delete data['attribute-itemprop'];
		delete data['attribute-type'];
		delete data['asDomSpec'];

		if (location && location.currentBundle) {
			location.currentBundle.getInterfaceInstance()
				.then(c => this.addWidget(data, c))
				.catch(() => this.addWidget(data));
		} else {
			this.addWidget(data);
		}
	},


	onDestroy () {
		if (this.widget) {
			Ext.destroy(this.widget);
		}
	},


	addWidget (data, contentPackage) {
		this.widget = Ext.widget({
			xtype: 'react',
			component: Widgets.EmbeddedWidget,
			item: data,
			contentPackage,
			maxWidth: 671,
			onHeightChange: () => this.onHeightChange(),
			renderTo: this.containerEl
		});
	},


	onHeightChange () {
		if (this.syncElementHeight) {
			this.syncElementHeight();
		}
	}
});
