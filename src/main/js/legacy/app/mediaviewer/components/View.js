const Ext = require('@nti/extjs');
const {wait} = require('@nti/lib-commons');
const { NotificationsView } = require('@nti/web-notifications');

const LibraryActions = require('legacy/app/library/Actions');
const GutterTab = require('legacy/app/chat/components/gutter/Tab');
const {TemporaryStorage} = require('legacy/cache/AbstractStorage');
const ReactHarness = require('legacy/overrides/ReactHarness');

require('legacy/mixins/State');
require('legacy/model/transcript/TranscriptItem');
require('legacy/app/account/identity/Index');

require('./Grid');
require('./Toolbar');
require('./mode/Split');
require('./mode/FullVideo');
require('./mode/SmallVideo');

const ADDED_CLS_SET = new Set();

module.exports = exports = Ext.define('NextThought.app.mediaviewer.components.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.media-view',

	mixins: {
		State: 'NextThought.mixins.State'
	},

	ui: 'media',
	floating: true,

	layout: {
		type: 'card',
		deferredRender: true
	},

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header'},
		{id: '{id}-body', cls: 'body', cn: ['{%this.renderContainer(out, values)%}']}
	]),

	getTargetEl: function () {
		return this.body;
	},

	childEls: ['body'],
	lockVideoWithNoTranscript: true,

	renderSelectors: {
		headerEl: '.header'
	},

	viewerXtypeMap: {
		'video-focus': 'media-split-viewer',
		'transcript-focus': 'media-transcript-viewer',
		'full-video': 'media-video-viewer'
	},

	viewerIdMap: {},

	items: [
		{xtype: 'box'},
		{xtype: 'media-grid-view'}
	],

	getStorageManager: function () {
		return TemporaryStorage;
	},

	initComponent: function () {
		this.callParent(arguments);
		this.LibraryActions = LibraryActions.create();
	},

	setContent: function (video, transcript, options) {
		if (this.isDestroyed) { return; }

		var me = this;

		if (!this.rendered) {
			this.onceRendered.then(function () {
				wait().then(me.setContent.bind(me, video, transcript, options));
			});
			return;
		}

		this.video = video;
		this.transcript = transcript;
		this.options = options;

		delete this.resourceList;
		delete this.slidedeck;

		// Only build set the contect and build a new viewer if the video actually changed.
		if (!this.viewer || this.viewer.video.getId() !== this.video.getId()) {
			this.toolbar.setContent(this.video, this.transcript);
			this.gridView.setContent(this.video, this.currentBundle);
			this.buildInitialViewer();
		}


		if (this.getLayout().getActiveItem() !== this.viewer) {
			this.getLayout().setActiveItem(this.viewer);
			// Ext.EventManager.onWindowResize(this.adjustOnResize, this, {buffer: 250});
		}


		if (this.toolbar && this.getViewerType()) {
			this.toolbar.updateCurrentType(this.getViewerType());
		}
	},

	setSlidedeckContent: function (slidedeck, videos, resourceList, options) {
		if (this.isDestroyed) { return; }

		var me = this;

		if (!this.rendered) {
			this.onceRendered.then(function () {
				wait().then(me.setSlidedeckContent.bind(me, slidedeck, videos, resourceList));
			});
			return;
		}

		// FIXME: For now, we will naively assume that each slidedeck is made of only one video.
		this.video = videos[0];
		this.slidedeck = slidedeck;
		this.resourceList = resourceList;
		this.options = options;

		delete this.transcript;

		// Only build set the contect and build a new viewer if the video actually changed.
		if (!this.viewer || this.viewer.video.getId() !== this.video.getId()) {
			this.toolbar.setContent(this.video, this.resourceList);
			this.gridView.setContent(this.video, this.currentBundle);
			this.buildInitialViewer();
		}


		if (this.getLayout().getActiveItem() !== this.viewer) {
			this.getLayout().setActiveItem(this.viewer);
		}


		if (this.toolbar && this.getViewerType()) {
			this.toolbar.updateCurrentType(this.getViewerType());
		}
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this,
			playerType = this.getViewerType();

		this.addCls(['showing', 'ready']);

		wait(1500)
			.then(function () {
				if (me.isRendered && !me.isDestroyed) {
					me.removeCls('showing');
				}
			});

		this.addClsToBody();

		this.toolbar = Ext.widget({
			xtype: 'media-toolbar',
			renderTo: this.headerEl,
			currentType: playerType,
			floatParent: this
		});

		this.gridView = this.down('media-grid-view');

		this.chatCmp = GutterTab.create({
			renderTo: this.toolbar.getEl()
		});

		this.notificationCmp = ReactHarness.create({
			component: NotificationsView,
			addHistory: true,
			baseroute: '/app',
			cls: 'media-viewer-notifications-icon',
			renderTo: this.toolbar.getEl(),
			floatParent: this.toolbar
		});

		this.notificationCmp.setThemeScope('mediaviewer.navigation');

		this.identityCmp = Ext.widget({
			xtype: 'identity',
			renderTo: this.toolbar.getEl(),
			floatParent: this.toolbar,
			setMenuOpen: this.setState.bind(this, {active: 'identityCmp'}),
			setMenuClosed: this.setState.bind(this, {})
		});

		this.on('destroy', 'cleanup', this);
		this.on('destroy', 'destroy', this.toolbar);
		this.on('destroy', 'destroy', this.gridView);
		this.on('destroy', 'destroy', this.identityCmp);
		this.on('destroy', 'destroy', this.notificationCmp);

		if (this.parentContainer && this.parentContainer.exitViewer) {
			this.on('exit-viewer', this.parentContainer.exitViewer.bind(this.parentContainer));
		}

		this.mon(this.gridView, {
			'hide-grid': {fn: 'showGridPicker', scope: this.toolbar},
			'toggl-grid': {fn: 'toggleGridPicker', scope: this.toolbar},
			'store-set': 'listStoreSet'
		});
	},


	addClsToBody () {
		if (ADDED_CLS_SET.has(this)) { return; }

		ADDED_CLS_SET.add(this);
		console.log('Adding open class');
		Ext.getBody().addCls('media-viewer-open');

		if (this.parentContainer && this.parentContainer.maybeUnmask) {
			this.parentContainer.maybeUnmask();
		}
	},


	removeClsFromBody () {
		if (!ADDED_CLS_SET.has(this)) { return; }

		ADDED_CLS_SET.delete(this);

		if (ADDED_CLS_SET.size === 0) {
			console.trace('Removing open class');
			Ext.getBody().removeCls('media-viewer-open');
		}
	},


	setState: function (state) {
		return this.applyState(state);
	},

	applyState: function (state) {
		var me = this,
			hide = 'onMenuHide',
			show = 'onMenuShow';

		function showOrHide (name) {
			me[name][state && state.active === name ? show : hide]();
		}

		showOrHide('identityCmp');
		showOrHide('notificationCmp');
	},

	buildInitialViewer: function () {
		var playerType = this.getViewerType(),
			viewerType = this.viewerXtypeMap[playerType], me = this;

		this.viewer = this.add({
			xtype: this.viewerXtypeMap[playerType],
			transcript: this.transcript,
			resourceList: this.resourceList,
			record: this.record || this.options.rec,
			accountForScrollbars: false,
			scrollToId: this.scrollToId,
			video: this.video,
			nextVideo: this.nextVideo,
			prevVideo: this.prevVideo,
			viewerContainer: this,
			currentBundle: this.currentBundle,
			switchToFull: () => this.switchToFull()
		});

		this.viewerIdMap[viewerType] = this.viewer.getId();
		this.mon(this.viewer, 'media-viewer-ready', function () {
			me.adjustOnResize();

			if (!Ext.isEmpty(me.startAtMillis)) {
				me.startAtSpecificTime(me.startAtMillis);
			}
		});
	},

	getViewerType: function (type) {
		if (this.lockVideoWithNoTranscript && !this.transcript && !this.resourceList) {
			return 'full-video';
		}

		return type || this.getStorageManager().get('media-viewer-player-type') || 'video-focus';
	},

	cleanup: function () {
		Ext.getBody().removeCls('media-viewer-closing');
		this.removeClsFromBody();
		Ext.EventManager.removeResizeListener(this.adjustOnResize, this);
	},

	startAtSpecificTime: function (startAt) {
		if (this.viewer && this.viewer.startAtSpecificTime) {
			this.viewer.startAtSpecificTime(startAt);
		}
	},


	adjustOnResize: function () {
		var toolbarHeight = this.toolbar.el && this.toolbar.getHeight() || 0,
			messageBarHeight = document.documentElement && document.documentElement.classList.contains('msg-bar-open') ? 40 : 0,
			availableHeight, paddingHeight = 0, availableWidth,
			activeItem = this.getLayout().getActiveItem();

		if (activeItem && activeItem.adjustOnResize) {
			availableHeight = Ext.Element.getViewportHeight() - toolbarHeight - paddingHeight - messageBarHeight;
			availableWidth = Ext.Element.getViewportWidth();

			activeItem.adjustOnResize(availableHeight, availableWidth);
		}
	},


	realignNotes () {
		const activeItem = this.getLayout().getActiveItem();

		if (activeItem && activeItem.realignNotes) {
			activeItem.realignNotes();
		}
	},


	beforeClose: function () {
		console.log('Before Close called');
		Ext.getBody().addCls('media-viewer-closing');
		this.removeCls('ready');
		this.addCls('closing');

		if (this.viewer) {
			this.viewer.beforeClose();
		}

		return wait(100);
	},

	allowNavigation: function () {
		if (this.viewer) {
			return this.viewer.allowNavigation();
		}
		return Promise.resolve();
	},

	listStoreSet: function (store) {
		if (!store) { return; }
		let index = store.indexOf(this.video);

		function isHeader (video) {
			return video && video.get('sources') && video.get('sources').length === 0;
		}

		function getPrevFromIndex (i) {
			var prev;

			if ((i - 1) >= 0) {
				prev = store.getAt(i - 1);
			}

			if (isHeader(prev)) {
				prev = getPrevFromIndex(i - 1);
			}

			return prev;
		}

		function getNextFromIndex (i) {
			var next;

			if ((i + 1) < store.getCount()) {
				next = store.getAt(i + 1);
			}

			if (isHeader(next)) {
				next = getNextFromIndex(i + 1);
			}

			return next;
		}

		this.prevVideo = getPrevFromIndex(index);
		this.nextVideo = getNextFromIndex(index);

		if (this.viewer) {
			this.viewer.setPrev(this.prevVideo);
			this.viewer.setNext(this.nextVideo);
		}
	},


	switchToFull () {
		this.switchVideoViewer('full-video', true);
		this.toolbar.updateType('full-video');
		this.toolbar.transcriptFailedToLoad();
	},

	switchVideoViewer: function (type, doNotPersist) {
		if (!type || type === (this.viewer && this.viewer.viewerType)) { return Promise.reject(); }

		var me = this,
			playerType = this.getViewerType(type),
			viewerXType = this.viewerXtypeMap[playerType],
			targetViewerId = this.viewerIdMap[viewerXType],
			targetViewer = targetViewerId && Ext.getCmp(targetViewerId),
			allow = Promise.resolve();


		if (this.viewer) {
			allow = this.viewer.allowNavigation();
		}

		return allow
			.then(function () {
				//store the current type so we can retrieve it later
				if (doNotPersist !== true) {
					me.getStorageManager().set('media-viewer-player-type', playerType);
				}

				//if we already have a video viewer for this video on this size, just make it active
				if (targetViewer && targetViewer.video.getId() === me.video.getId()) {
					me.viewer = targetViewer;
					me.getLayout().setActiveItem(me.viewer);
				} else {
					//if we have a target viewer its set to a different video so
					//remove it
					// FIXME: We need to setContent if we have a different video,
					// rather than creating a new one.
					if (targetViewer) {
						me.remove(targetViewer, true);
					}

					me.viewer = me.add({
						xtype: viewerXType,
						transcript: me.transcript,
						resourceList: me.resourceList,
						record: me.record,
						accountForScrollbars: false,
						scrollToId: me.scrollToId,
						video: me.video,
						viewerContainer: me,
						currentBundle: me.currentBundle,
						switchToFull: () => me.switchToFull()
					});

					me.viewerIdMap[viewerXType] = me.viewer.getId();
					me.getLayout().setActiveItem(me.viewer);
				}

				me.realignNotes();

				wait(1000)
					.then(me.fireEvent.bind(me, 'animation-end'));
				wait(1001)
					.then(me.adjustOnResize.bind(me));
			});
	},


	hideGridViewer () {
		this.showGridViewer('hide');
	},


	showGridViewer: function (action) {
		var me = this,
			allow = Promise.resolve();

		if (action === 'show' && me.viewer) {
			allow = me.viewer.allowNavigation();
		}

		return allow
			.then(function () {
				if (action === 'show') {
					me.getLayout().setActiveItem(me.gridView);
					me.getTargetEl().addCls('grid');
					me.gridView.refresh();

					wait(2000)
						.then(me.adjustOnResize.bind(me));
				} else {
					me.getTargetEl().removeCls('grid');
					me.getLayout().setActiveItem(me.viewer);
				}
			});
	}
});
