/*jslint */
/*global DomUtils, NextThought */
Ext.define('NextThought.view.video.OverlayedPanel', {
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.overlay-video',

	requires: [
		'NextThought.util.Dom',
		'NextThought.model.PlaylistItem',
		'NextThought.view.video.Video'
	],

	ui: 'content-video',
	cls: 'content-video-container',

	representsUserDataContainer: true,

	renderSelectors: {
		openMediaViewerEl: '.media-transcript'
	},

	statics: {
		getData: function(dom, reader) {
			var el = Ext.get(dom),
				data = DomUtils.parseDomObject(dom),
				description = el.down('span.description');

			Ext.applyIf(data, {
				description: (description && description.getHTML()) || ''
			});
			return data;
		}
	},


	constructor: function(config) {
		if (!config || !config.contentElement) {
			throw 'you must supply a contentElement';
		}

		var me = this,
			dom = config.contentElement,
			el = Ext.get(dom),
			reader = config.reader,
			data = DomUtils.parseDomObject(dom),
			description = el.down('span.description'),
			loc = ContentUtils.getLocation(reader.getLocation().NTIID),
			playlist = [];

		playlist.push(NextThought.model.PlaylistItem.fromDom(dom));

		Ext.applyIf(data, {
			basePath: reader && reader.basePath,
			description: (description && description.getHTML()) || ''
		});

		Ext.apply(config, {
			layout: 'fit',
			items: [{
				width: 640,
				xtype: 'box',
				autoEl: { cls: 'curtain content-video-curtain', cn: [
					{ cls: 'ctr', cn: [
						{ cls: 'play', cn: [
							{cls: 'blur-clip', cn: {cls: 'blur'}},
							{ cls: 'label', 'data-qtip': 'Play' },
							{cls: 'launch-player', 'data-qtip': 'Play with transcript'}
						] }
					] }
				]}
			},{
				width: 640,
				xtype: 'content-video',
				data: data,
				playlist: playlist,
				contentElement: dom,
				listeners: {
					'height-change': 'refreshHeight',
					'player-command-activate': function() {
						var video = me.down('content-video');

						if (!me.fromClick) {
							delete me.fromClick;
							Ext.defer(video.deactivatePlayer, 1, video);
						}
						//console.log(me);
					}
				},
				xhooks: {
					playerConfigOverrides: function(type) {
						return {reserveControlSpace: true};
					}
				}
			}]
		});

		this.data = data;
		this.playlist = playlist;

		this.callParent([config]);

		Library.getVideoIndex(loc.title).then(this.fillVideo.bind(this));
	},


	fillVideo: function(index) {
		var id = this.data['attribute-data-ntiid'],
			poster = index[id].sources[0].poster,
			label = index[id].title;

		this.setBackground(poster, label);
	},


	setBackground: function(src, label) {
		if (!this.el) {
			this.on('afterrender', this.setBackground.bind(this, src), this, {single: true});
			return;
		}

		this.down('content-video').getEl().setStyle({cursor: 'pointer'});

		this.down('box').getEl().setStyle({
			backgroundImage: 'url(' + src + ')',
			backgroundSize: '640px',
			backgroundPosition: '0 0'
		});

		this.down('box').getEl().down('.label').update(label);

		this.mon(this.down('content-video').getEl(), 'click', 'play');
	},


	play: function() {
		this.fromClick = true;
		this.down('content-video').resumePlayback(true);
	},


	openMediaViewer: function() {
		var v = this.playlist[0];
		console.log('should start media player for video: ', v.get('NTIID'));
		this.fireEvent('start-media-player', v, v.get('NTIID'), this.reader.basePath);
	},


	findLine: function() {
		var doc = this.contentElement.ownerDocument,
			range = doc.createRange();

		range.selectNode(this.contentElement);
		return {range: range, rect: this.el.dom.getBoundingClientRect()};
	}
});
