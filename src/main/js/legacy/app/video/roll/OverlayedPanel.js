var Ext = require('extjs');
var DomUtils = require('legacy/util/Dom');
require('legacy/app/contentviewer/overlay/Panel');
require('legacy/common/components/cards/Launcher');
require('./Roll');


module.exports = exports = Ext.define('NextThought.app.video.roll.OverlayedPanel', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.overlay-video-roll',
	ui: 'content-launcher',
	cls: 'content-launcher-container',

	statics: {
		getData: function (dom, reader) {
			var videos = DomUtils.getVideosFromDom(dom);
			return NextThought.common.components.cards.Launcher.getData(dom, reader, videos, function () {
				var thumb = videos[0];
				thumb = thumb && thumb.sources && thumb.sources[0];
				return thumb && thumb.thumbnail;
			});
		}
	},

	constructor: function (config) {
		if (!config || !config.contentElement) {
			throw new Error('you must supply a contentElement');
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

	showVideoRole: function (data) {
		var videos = [];

		Ext.each((data && data.items) || [], function (v) {
			var s = v.sources[0],
				source = s && s.source,
				item = {
					type: s && s.service,
					thumbnail: s && s.thumbnail
				};

			if (item.type === 'vimeo') {
				item.url = Ext.String.format('//player.vimeo.com/video/{0}?badge=0&portrait=0&byline=0', source);
			} else if (item.type === 'youtube') {
				item.url = Ext.String.format('//www.youtube.com/embed/{0}?rel=0&wmode=opaque', source);
			} else {
				console.warn('Unknown source:', v);
			}

			if (item.url) {
				videos.push(item);
			}
		});

		Ext.widget('video-lightbox', { data: videos }).show();
	}
});
