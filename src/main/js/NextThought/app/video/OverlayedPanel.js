/*jslint */
/*global DomUtils, NextThought */
Ext.define('NextThought.app.video.OverlayedPanel', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.overlay-video',

	requires: [
		'NextThought.util.Dom',
		'NextThought.model.PlaylistItem',
		'NextThought.model.resolvers.VideoPosters',
		'NextThought.app.video.Video',
		'NextThought.app.library.Actions'
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
			bundle = reader.getLocation().currentBundle,
			playlist = [],
			size = this.getSize(dom, 640);

		playlist.push(NextThought.model.PlaylistItem.fromDom(dom));

		Ext.applyIf(data, {
			basePath: reader && reader.basePath,
			description: (description && description.getHTML()) || ''
		});

		this.size = size;

		this.LibraryActions = NextThought.app.library.Actions.create();

		Ext.apply(config, {
			layout: 'fit',
			items: [{
				width: size.width,
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
				width: size.width,
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

		this.LibraryActions.getVideoIndex(bundle)
			.then(this.fillVideo.bind(this));
	},



	afterRender: function() {
		this.callParent(arguments);

		this.el.setStyle({
			left: this.size.left + 'px',
			width: this.size.parentWidth + 'px'
		});
	},



	getSize: function(dom, desiredWidth) {
		var parent = dom.parentElement, left, width,
			parentRect = parent && parent.getBoundingClientRect();

		if (!parentRect) {
			return {
				left: 0,
				width: destiredWidth
			};
		}

		if (parentRect.width >= desiredWidth) {
			if (Ext.fly(parent).is('.figure')) {
				//there is some padding being applied somewhere that I don't know how to find programmatically
				//so hard code the 4 for now...
				left = Math.ceil((parentRect.width - desiredWidth) / 2) + 4;
			} else {
				left = 0;
			}
			return {
				left: left,
				parentWidth: parentRect.width,
				width: desiredWidth
			};
		}

		return {
			left: parentRect.left,
			width: desiredWidth
		};
	},


	fillVideo: function(index) {
		var me = this,
			id = me.data['attribute-data-ntiid'],
			source = index[id].sources[0],
			poster = source.poster,
			label = index[id].title;

		if (poster) {
			me.setBackground(poster, label);
		} else {
			NextThought.model.resolvers.VideoPosters.resolveForSource(source)
				.then(function(imgs) {
					me.setBackground(imgs.poster, label);
				});
		}
	},


	setBackground: function(src, label) {
		if (!this.el) {
			this.on('afterrender', this.setBackground.bind(this, src), this, {single: true});
			return;
		}

		this.down('content-video').getEl().setStyle({cursor: 'pointer'});

		this.down('box').getEl().setStyle({
			backgroundImage: 'url(' + src + ')',
			backgroundSize: 'contain',
			backgroundColor: 'black',
			backgroundPosition: 'center center'
		});

		if (!src) {
			this.addCls('no-poster');
		}

		this.down('box').getEl().down('.label').update(label);

		this.mon(this.el, 'click', this.play.bind(this));
	},


	play: function(e) {
		if (e.getTarget('.launch-player')) {
			this.fromClick = true;
			this.addCls('playing');
			this.down('content-video').resumePlayback(true);
		}
		if (!e.getTarget('.launch-player') && e.getTarget('.label')) {
			this.openMediaViewer();
		}
	},


	openMediaViewer: function() {
		var v = this.playlist[0],
			bundleContent = this.up('bundle-content'),
			location = this.reader && this.reader.getLocation && this.reader.getLocation() || {},
			path;

		if (bundleContent && bundleContent.getVideoRouteForObject) {
			v.pageInfo = location.pageInfo;
			v.page = location.NTIID;
			path = bundleContent.getVideoRouteForObject(v);

			if (path && path.route) {
				bundleContent.handleNavigation(path.title, path.route, path.precache);
			}
		}
	},


	findLine: function() {
		var doc = this.contentElement.ownerDocument,
			range = doc.createRange();

		range.selectNode(this.contentElement);
		return {range: range, rect: this.el.dom.getBoundingClientRect()};
	}
});
