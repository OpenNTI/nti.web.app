Ext.define('NextThought.app.slidedeck.media.components.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.media-view',
	requires: [
		'NextThought.app.slidedeck.media.components.Grid',
		'NextThought.app.slidedeck.media.components.Toolbar',
		'NextThought.app.slidedeck.media.components.viewers.SplitViewer',
		'NextThought.app.slidedeck.media.components.viewers.TranscriptViewer',
		'NextThought.app.slidedeck.media.components.viewers.VideoViewer',
		'NextThought.app.library.Actions',
		'NextThought.model.transcript.TranscriptItem',
		'NextThought.app.account.identity.Index'
	],

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

	getTargetEl: function() {
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

	getStorageManager: function() {
		return TemporaryStorage;
	},


	initComponent: function() {
		this.callParent(arguments);
		this.LibraryActions = NextThought.app.library.Actions.create();
	},


	setContent: function(video, transcript, options) {
		var me = this;

		if (!this.rendered) {
			this.onceRendered.then(function() {
				wait().then(me.setContent.bind(me, video, transcript, options));
			});
			return;
		}

		this.video = video;
		this.transcript = transcript;
		this.options = options;

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


	afterRender: function() {
		this.callParent(arguments);

		var me = this,
			playerType = this.getViewerType();

		this.addCls(['showing', 'ready']);

		wait(1500)
			.then(function() {
				me.removeCls('showing');
			});

		if (!Ext.getBody().hasCls('media-viewer-open')) {
			wait(100)
				.then(me.animateIn.bind(me));
		}

		this.toolbar = Ext.widget({
			xtype: 'media-toolbar',
			renderTo: this.headerEl,
			currentType: playerType,
			floatParent: this
		});

		this.gridView = this.add({
			xtype: 'media-grid-view'
		});

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

		if (this.parentContainer && this.parentContainer.exitViewer) {
			this.on('exit-viewer', this.parentContainer.exitViewer.bind(this.parentContainer));
		}

		this.mon(this.gridView, {
			'hide-grid': {fn: 'showGridPicker', scope: this.toolbar},
			'toggl-grid': {fn: 'toggleGridPicker', scope: this.toolbar},
			'store-set': 'listStoreSet'
		});
	},


	setState: function(state) {
		return this.applyState(state);
	},


	applyState: function(state) {
		var me = this,
			hide = 'onMenuHide',
			show = 'onMenuShow';

		function showOrHide(name) {
			me[name][state.active === name ? show : hide]();
		}

		showOrHide('identityCmp');
	},


	buildInitialViewer: function() {
		var playerType = this.getViewerType(),
			viewerType = this.viewerXtypeMap[playerType], me = this;

		this.viewer = this.add({
			xtype: this.viewerXtypeMap[playerType],
			transcript: this.transcript,
			record: this.record,
			accountForScrollbars: false,
			scrollToId: this.scrollToId,
			video: this.video,
			nextVideo: this.nextVideo,
			prevVideo: this.prevVideo,
			viewerContainer: this,
			currentBundle: this.currentBundle
		});

		this.viewerIdMap[viewerType] = this.viewer.getId();
		this.mon(this.viewer, 'media-viewer-ready', function() {
				me.adjustOnResize();

				if (!Ext.isEmpty(me.startAtMillis)) {
					me.startAtSpecificTime(me.startAtMillis);
				}
			});
	},


	getViewerType: function(type) {
		if (this.lockVideoWithNoTranscript && !this.transcript) {
			return 'full-video';
		}

		return type || this.getStorageManager().get('media-viewer-player-type') || 'video-focus';
	},


	cleanup: function() {
		Ext.getBody().removeCls('media-viewer-open media-viewer-closing');
		Ext.EventManager.removeResizeListener(this.adjustOnResize, this);
	},


	startAtSpecificTime: function(startAt) {
		if (this.viewer && this.viewer.startAtSpecificTime) {
			this.viewer.startAtSpecificTime(startAt);
		}
	},


	animateIn: function() {
		var me = this;
		if (!this.rendered) {
			this.on('afterrender', 'animateIn', this);
			return;
		}

		Ext.getBody().addCls('media-viewer-open');
		if (this.parentContainer && this.parentContainer.maybeUnmask) {
			this.parentContainer.maybeUnmask();
		}
	},


	adjustOnResize: function() {
		var toolbarHeight = this.toolbar.el && this.toolbar.getHeight() || 0,
			availableHeight, paddingHeight = 30, availableWidth,
			activeItem = this.getLayout().getActiveItem();

		if (activeItem && activeItem.adjustOnResize) {
			availableHeight = Ext.Element.getViewportHeight() - toolbarHeight - paddingHeight;
			availableWidth = Ext.Element.getViewportWidth();

			activeItem.adjustOnResize(availableHeight, availableWidth);
		}
	},


	beforeClose: function() {
		Ext.getBody().removeCls('media-viewer-open').addCls('media-viewer-closing');
		this.removeCls('ready');
		this.addCls('closing');
	},


	allowNavigation: function() {
		if (this.viewer) {
			return this.viewer.allowNavigation();
		}
		return Promise.resolve();
	},

	listStoreSet: function(store) {
		if (!store) { return; }
		var me = this, index = store.indexOf(this.video);

		function isHeader(video) {
			return video && video.get('sources') && video.get('sources').length === 0;
		}

		function getPrevFromIndex(i) {
			var prev;

			if ((i - 1) >= 0) {
				prev = store.getAt(i - 1);
			}

			if (isHeader(prev)) {
				prev = getPrevFromIndex(i - 1);
			}

			return prev;
		}

		function getNextFromIndex(i) {
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


	switchVideoViewer: function(type, item) {
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
			.then(function() {
				//store the current type so we can retrieve it later
				me.getStorageManager().set('media-viewer-player-type', playerType);

				//if we already have a video viewer for this video on this size, just make it active
				if (targetViewer && targetViewer.video.getId() === me.video.getId()) {
					me.viewer = targetViewer;
					me.getLayout().setActiveItem(me.viewer);
				} else {
					//if we have a target viewer its set to a different video so
					//remove it
					if (targetViewer) {
						me.remove(targetViewer, true);
					}

					me.viewer = me.add({
						xtype: viewerXType,
						transcript: me.transcript,
						record: me.record,
						accountForScrollbars: false,
						scrollToId: me.scrollToId,
						video: me.video,
						viewerContainer: me,
						currentBundle: me.currentBundle
					});

					me.viewerIdMap[viewerXType] = me.viewer.getId();
					me.getLayout().setActiveItem(me.viewer);
				}

				wait(1000)
					.then(me.fireEvent.bind(me, 'animation-end'));
				wait(1001)
					.then(me.adjustOnResize.bind(me));
			});
	},


	showGridViewer: function(action) {
		var me = this,
			allow = Promise.resolve();

		if (action === 'show' && me.viewer) {
			allow = me.viewer.allowNavigation();
		}

		return allow
			.then(function() {
				if (action === 'show') {
					me.getLayout().setActiveItem(me.gridView);
					me.el.setStyle('overflowY', 'auto');
					me.gridView.refresh();

					wait(2000)
						.then(me.adjustOnResize.bind(me));
				} else {
					me.el.setStyle('overflowY', 'hidden');
					me.getLayout().setActiveItem(me.viewer);
				}
			});
	}
});
