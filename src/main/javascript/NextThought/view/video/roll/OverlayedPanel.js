/*global DomUtils, NextThought */
Ext.define('NextThought.view.video.roll.OverlayedPanel', {
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.overlay-video-roll',

	requires: [
		'NextThought.util.Dom',
		'NextThought.view.cards.Launcher'
	],

	ui: 'content-launcher',
	cls: 'content-launcher-container',

	statics: {
		getData: function(dom, reader) {
			var videos = DomUtils.getVideosFromDom(dom);
			return NextThought.view.cards.Launcher.getData(dom, reader, videos, function() {
				var thumb = videos[0];
				thumb = thumb && thumb.sources && thumb.sources[0];
				return thumb && thumb.thumbnail;
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
					launch: 'showVideoRole'
				}
			}]
		});

		this.callParent([config]);
	},


	showVideoRole: function(data) {
		console.log('Video:', data);
	}
});
