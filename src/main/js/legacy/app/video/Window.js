var Ext = require('extjs');
var WindowWindow = require('../../common/window/Window');
var VideoPanel = require('./Panel');


module.exports = exports = Ext.define('NextThought.app.video.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.video-window',

	/*
		src:
		[
			// firefox (ogg theora)
			{
				src : 'http://xant.us/files/google_main.ogv',
				type: 'video/ogg'
			},
			// chrome and webkit-nightly (h.264)
			{
				src : 'http://xant.us/files/google_main.mgv',
				type: 'video/mp4'
			}
		]
	 */

	constructor: function (config) {
		if (!config || !config.src || !Ext.isArray(config.src)) {
			throw 'you must supply a src array';
		}

		config = Ext.applyIf(config, {
			animCollapse: false,
			title: 'Video Window',
			width: 740,
			height: 480,
			shim: false,
			border: false,
			layout: 'fit'
		});

		config.items = [{
			xtype: 'video',
			src: config.src,
			autobuffer: true,
			autoplay: true,
			controls: true
		}];

		this.callParent([config]);
	}
});
