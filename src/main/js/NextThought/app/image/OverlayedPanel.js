/*global DomUtils, NextThought */
export default Ext.define('NextThought.app.image.OverlayedPanel', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.overlay-image-roll',

	requires: [
		'NextThought.util.Dom',
		'NextThought.common.ux.ImagePopout',
		'NextThought.common.components.cards.Launcher'
	],

	ui: 'content-launcher',
	cls: 'content-launcher-container',


	statics: {
		getData: function(dom, reader) {
			var images = DomUtils.getImagesFromDom(dom);
			return NextThought.common.components.cards.Launcher.getData(dom, reader, images, function() {
				var thumb = images[0];
				return thumb && thumb.url;
			});
		}
	},

	constructor: function(config) {
		if (!config || !config.contentElement) {
			throw 'you must supply a contentElement';
		}

		Ext.apply(config, {
			layout: 'fit',
			items: [{
				xtype: 'content-launcher',
				data: this.self.getData(config.contentElement, config.reader),
				listeners: {
					scope: this,
					launch: 'showImageRole'
				}
			}]
		});

		this.callParent([config]);
	},


	showImageRole: function(data) {
		this.imagePopout = Ext.widget('image-lightbox', { data: data.items }).show();
		this.on('destroy', this.imagePopout.destroy.bind(this.imagePopout));
	}
});
