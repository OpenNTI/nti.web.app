export default Ext.define('NextThought.app.contentviewer.components.EmbededWidgetPanel', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.overlay-content-embeded-widget',

	requires: [
		'NextThought.util.Dom'
	],

	cls: 'content-embeded-widget-frame',

	constructor: function(config) {
		if (!config || !config.contentElement) {
			throw 'you must supply a contentElement';
		}

		Ext.apply(config, {
			layout: 'fit',
			items: [{
				xtype: 'overlay-content-embeded-widget-frame',
				data: DomUtils.parseDomObject(config.contentElement),
				basePath: config.reader.basePath
			}]
		});

		this.callParent([config]);
	}
});
