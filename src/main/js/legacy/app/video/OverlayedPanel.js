const Ext = require('@nti/extjs');
const { default: Logger } = require('@nti/util-logger');
const DomUtils = require('internal/legacy/util/Dom');
const PlaylistItem = require('internal/legacy/model/PlaylistItem');
const VideoPosters = require('internal/legacy/model/resolvers/VideoPosters');

const LibraryActions = require('../library/Actions');

require('../contentviewer/overlay/Panel');
require('./Video');

const logger = Logger.get('NextThought.app.video.OverlayedPanel');

module.exports = exports = Ext.define('NextThought.app.video.OverlayedPanel', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.overlay-video',
	ui: 'content-video',
	cls: 'content-video-container',
	representsUserDataContainer: true,

	renderSelectors: {
		openMediaViewerEl: '.media-transcript',
	},

	statics: {
		getData: function (dom, reader) {
			var el = Ext.get(dom),
				data = DomUtils.parseDomObject(dom),
				description = el.down('span.description');

			Ext.applyIf(data, {
				description: (description && description.getHTML()) || '',
			});
			return data;
		},
	},

	constructor: function (config) {
		if (!config || !config.contentElement) {
			throw new Error('you must supply a contentElement');
		}

		var me = this,
			dom = config.contentElement,
			el = Ext.get(dom),
			reader = config.reader,
			data = DomUtils.parseDomObject(dom),
			description = el.down('span.description'),
			location = reader.getLocation(),
			bundle = location.currentBundle,
			content = location.ContentNTIID,
			playlist = [],
			size = this.getSize(dom, 640);

		Ext.applyIf(data, {
			basePath: reader && reader.basePath,
			description: (description && description.getHTML()) || '',
		});

		this.size = size;
		this.dom = dom;

		this.LibraryActions = LibraryActions.create();

		Ext.apply(config, {
			layout: 'fit',
		});

		this.data = data;

		this.callParent([config]);

		this.getVideo(bundle, content)
			.then(index => {
				if (!me.checkDomState()) {
					console.warn(
						'Weird dom state. Might’ve unmounted before the video request came back. Bailing.'
					);
					return;
				}

				playlist.push(this.createPlaylistItem(index));

				this.playlist = playlist;

				this.curtain = this.add({
					width: size.width,
					xtype: 'box',
					autoEl: {
						cls: 'curtain content-video-curtain',
						cn: [
							{
								cls: 'ctr',
								cn: [
									{
										cls: 'play',
										cn: [
											{
												cls: 'blur-clip',
												cn: { cls: 'blur' },
											},
											{
												cls: 'label',
												'data-qtip': 'Play',
											},
											{
												cls: 'launch-player',
												'data-qtip':
													'Play with transcript',
											},
										],
									},
								],
							},
						],
					},
				});

				this.player = this.insert(0, {
					width: size.width,
					xtype: 'content-video-player',
					data: data,
					playlist: playlist,
					video: playlist[0],
					doNotAutoPlay: true,
					deferred: true,
					contentElement: dom,
					listeners: {
						'height-change': () => {
							this.syncElementHeight();
							this.syncTop();
						},
						'player-command-activate': function () {
							var video = me.down('content-video-player');

							if (!me.fromClick) {
								delete me.fromClick;
								Ext.defer(video.deactivatePlayer, 1, video);
							}
							//console.log(me);
						},
						'player-deactivated': () => {
							me.onPlayerDeactivated();
						},
					},
					xhooks: {
						playerConfigOverrides: function (type) {
							return { reserveControlSpace: true };
						},
					},
				});

				this.syncElementHeight();
				this.syncTop();

				return index;
			})
			.then(this.fillVideo.bind(this))
			.catch(error => {
				this.error = this.add({
					width: size.width,
					xtype: 'box',
					autoEl: {
						cls: 'curtain error content-video-curtain',
						cn: [
							{
								cls: 'ctr',
								cn: [{ cls: 'play', cn: [{ cls: 'error' }] }],
							},
						],
					},
				});

				this.syncElementHeight();
				this.syncTop();
				this.setError(error);
			});
	},

	checkDomState: function () {
		return (
			!this.isDestroyed &&
			this.dom &&
			this.readerMounted() &&
			this.isMountedInReader(this.dom)
		);
	},

	readerMounted: function () {
		try {
			return document.body.contains(this.reader.el.dom);
		} catch (e) {
			//
		}
		return false;
	},

	isMountedInReader: function (elem) {
		try {
			return this.reader
				.getIframe()
				.getDocumentElement()
				.body.contains(elem);
		} catch {
			//
		}
		return false;
	},

	createPlaylistItem: function () {
		return PlaylistItem.fromDom(this.dom);
	},

	getVideo: function (bundle, content) {
		return this.LibraryActions.getVideoIndex(bundle, content);
	},

	afterRender: function () {
		try {
			this.callParent(arguments);

			this.el.setStyle({
				left: this.size.left + 'px',
				width: this.size.parentWidth + 'px',
			});
		} catch (e) {
			console.error(e);
			throw e;
		}
	},

	getSize: function (dom, desiredWidth) {
		var parent = dom.parentElement,
			left,
			parentRect = parent && parent.getBoundingClientRect();

		if (!parentRect) {
			return {
				left: 0,
				width: desiredWidth,
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
				width: desiredWidth,
			};
		}

		return {
			left: parentRect.left,
			width: desiredWidth,
		};
	},

	fillVideo: function (index) {
		var id = this.data['attribute-data-ntiid'],
			source = index[id].sources[0],
			poster = source.poster,
			label = index[id].title;

		if (poster) {
			this.setBackground(poster, label);
		} else {
			VideoPosters.resolveForSource(source).then(imgs => {
				this.setBackground(imgs.poster, label);
			});
		}
	},

	setError: function (error) {
		if (!this.el) {
			this.on('afterrender', this.setError.bind(this, error), this, {
				single: true,
			});
			return;
		}

		try {
			this.down('box').getEl().setStyle({
				backgroundSize: 'contain',
				backgroundColor: 'black',
				backgroundPosition: 'center center',
			});

			this.down('box').getEl().down('.error').update(error);
		} catch (e) {
			logger.error('Unable to set error. %o', error);
		}
	},

	setBackground: function (src, label) {
		if (!this.el) {
			this.on('afterrender', this.setBackground.bind(this, src), this, {
				single: true,
			});
			return;
		}

		this.down('content-video-player')
			.getEl()
			.setStyle({ cursor: 'pointer' });

		this.curtain.getEl().setStyle({
			backgroundImage: 'url(' + src + ')',
			backgroundSize: 'contain',
			backgroundColor: 'black',
			backgroundPosition: 'center center',
		});

		if (!src) {
			this.addCls('no-poster');
		}

		this.curtain
			.getEl()
			.down('.label')
			.update(Ext.util.Format.htmlEncode(label));

		this.mon(this.el, 'click', this.play.bind(this));
	},

	play: function (e) {
		const playing = this.hasCls('playing');

		//If we are already playing don't stomp on the player
		if (playing) {
			return;
		}

		if (e.getTarget('.launch-player')) {
			this.fromClick = true;
			this.addCls('playing');
			this.down('content-video-player').resumePlayback(true);
		} else {
			this.openMediaViewer();
		}
	},

	onPlayerDeactivated() {
		this.removeCls('playing');
	},

	openMediaViewer: function () {
		var v = this.playlist[0],
			bundleContent = this.up('bundle-content'),
			contentViewer = this.up('content-viewer'),
			location =
				(this.reader &&
					this.reader.getLocation &&
					this.reader.getLocation()) ||
				{},
			path;

		if (bundleContent && bundleContent.getVideoRouteForObject) {
			v.pageInfo = location.pageInfo;
			v.page = location.NTIID;
			path = bundleContent.getVideoRouteForObject(v);

			if (path && path.route && bundleContent.handleContentNavigation) {
				bundleContent.handleContentNavigation(path.title, path.route);
			}
		} else if (contentViewer && contentViewer.showMediaViewerForVideo) {
			contentViewer.showMediaViewerForVideo(v);
		}
	},

	findLine: function () {
		var doc = this.contentElement.ownerDocument,
			range = doc.createRange();

		range.selectNode(this.contentElement);
		return { range: range, rect: this.el.dom.getBoundingClientRect() };
	},
});
