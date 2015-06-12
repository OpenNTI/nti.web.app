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
		'NextThought.model.transcript.TranscriptItem'
	],

	mixins: {
		Router: 'NextThought.mixins.Router',
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
		{id: '{id}-body', cn: ['{%this.renderContainer(out, values)%}']}
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

		this.initRouter();

		this.LibraryActions = NextThought.app.library.Actions.create();
		this.addRoute('/:id', this.showVideoViewer.bind(this));
		this.addDefaultRoute(this.showVideoGrid.bind(this));

		this.__addKeyMapListeners();			
	},


	showVideoViewer: function(route, subRoute) {
		var videoId = route.params.id,
			video = route.precache.video,
			basePath = route.precache.basePath,
			rec = route.precache.rec,
			options = route.precache.options || {},
			transcript, me = this;

		videoId = ParseUtils.decodeFromURI(videoId);
		options.rec = rec;

		// Cache the lesson if it was passed to us.
		me.lesson = route.precache.lesson;

		if (video && video.isModel) {
			if(!basePath && basePath != "") {
				basePath = me.currentBundle.getContentRoots()[0];					
			}

			transcript = NextThought.model.transcript.TranscriptItem.fromVideo(video, basePath);
			me.setContent(video, transcript, options);
		}
		else{
			this.LibraryActions.getVideoIndex(me.currentBundle)
				.then(function(videoIndex) {
					var o = videoIndex[videoId];
					if (!o) { return; }

					basePath = me.currentBundle.getContentRoots()[0];
					video = NextThought.model.PlaylistItem.create(Ext.apply({ NTIID: o.ntiid }, o));
					transcript = NextThought.model.transcript.TranscriptItem.fromVideo(video, basePath);
					
					me.setContent(video, transcript, options);
				});
			return;
		}
	},


	setContent: function(video, transcript, options) {
		var me = this;

		if(!this.rendered) {
			this.onceRendered.then(function(){
				wait().then(me.setContent.bind(me, video, transcript, options));
			});
			return;
		}

		this.video = video;
		this.transcript = transcript;
		this.options = options;

		this.toolbar.setContent(this.video, this.transcript);
		this.gridView.setContent(this.video, this.currentBundle);
		this.buildInitialViewer();

		this.getLayout().setActiveItem(this.viewer);
		Ext.EventManager.onWindowResize(this.adjustOnResize, this, {buffer: 250});
	},


	showVideoGrid: function(route, subRoute) {
		//TOOD: not yet handled
		console.error('route not yet implemented: ', arguments);
	},


	afterRender: function() {
		this.callParent(arguments);
		
		if (!Ext.getBody().hasCls('media-viewer-open')) {
			this.animateIn();
		}
		else {
			this.maybeMask();
		}

		var playerType = this.getViewerType();
		this.toolbar = Ext.widget({
			xtype: 'media-toolbar',
			renderTo: this.headerEl,
			currentType: playerType,
			floatParent: this,
		});

		this.gridView = this.add({
			xtype: 'media-grid-view'
		});

		// this.identity = Ext.widget({
		// 	xtype: 'identity',
		// 	renderTo: this.toolbar.getEl(),
		// 	floatParent: this.toolbar
		// });

		this.on('destroy', 'destroy', this.toolbar);
		this.on('destroy', 'destroy', this.gridView);
		// this.on('destroy', 'destroy', this.identity);
		this.on('exit-viewer', 'exitViewer', this);
		this.on('destroy', 'cleanup', this);

		this.mon(this.gridView, {
			'hide-grid': {fn: 'showGridPicker', scope: this.toolbar},
			'store-set': 'listStoreSet'
		});
	},

	__addKeyMapListeners: function() {
		keyMap = new Ext.util.KeyMap({
			target: document,
			binding: [{
				key: Ext.EventObject.ESC,
				fn: this.exitViewer,
				scope: this
			}]
		});

		this.on('destroy', function() {keyMap.destroy(false);});
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
		this.mon(this.viewer, 'media-viewer-ready', function(){
				me.adjustOnResize();
				me.maybeUnmask();

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
		this.maybeMask();

		//TODO use the animationend event for the browsers that support it
		Ext.defer(this.fireEvent, 1100, this, ['animation-end']);
	},

	maybeMask: function() {
		if (!this.rendered || this.hasCls('loading')) {
			return;
		}

		this.addCls('loading');
		this.el.mask('Loading media viewer comtents...', 'loading');
	},


	maybeUnmask: function() {
		if (this.rendered) {
			this.removeCls('loading');
			this.el.unmask();
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


	exitViewer: function() {
		console.log('about to exit the video viewer');

		if (!this.viewer.beforeExitViewer()) {
			return;
		}

		if (this.handleClose) {
			this.handleClose();
			return;
		}

		Ext.getBody().removeCls('media-viewer-open').addCls('media-viewer-closing');
		this.removeCls('ready');
		this.addCls('closing');

		this.fireEvent('exited');

		Ext.defer(this.destroy, 1100, this);
		Ext.defer(this.fireEvent, 1100, this, ['exited', this]);
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

		if (this.viewer && this.viewer.videoplayer) {
			this.viewer.videoplayer.setPrev(this.prevVideo);
			this.viewer.videoplayer.setNext(this.nextVideo);
		}
	},


	switchVideoViewer: function(type, item) {
		if (!type || type === (this.viewer && this.viewer.viewerType)) { return Promise.reject(); }

		var me = this,
			playerType = this.getViewerType(type),
			viewerXType = this.viewerXtypeMap[playerType],
			targetViewerId = this.viewerIdMap[viewerXType],
			targetViewer = targetViewerId && Ext.getCmp(targetViewerId);


		if (this.viewer && (this.viewer.beforeDeactivate() === false)) {
			console.log('Cannot switch viewer because the current view refuses to deactivate.');
			return Promise.reject();
		}

		//store the current type so we can retrieve it later
		me.getStorageManager().set('media-viewer-player-type', playerType);

		if (!targetViewer) {
			this.viewer = this.add({
				xtype: viewerXType,
				transcript: this.transcript,
				record: this.record,
				accountForScrollbars: false,
				scrollToId: this.scrollToId,
				video: this.video,
				viewerContainer: this
			});

			this.viewerIdMap[viewerXType] = this.viewer.getId();
			this.getLayout().setActiveItem(this.viewer);
		}
		else {
			this.viewer = targetViewer;
			this.getLayout().setActiveItem(this.viewer);
		}

		wait(1000)
			.then(this.fireEvent.bind(this, 'animation-end'));
		wait(1001)
			.then(this.adjustOnResize.bind(this));

		return Promise.resolve();
	},


	showGridViewer: function(action) {
		if (action === 'show' && this.viewer && (this.viewer.beforeDeactivate() === false)) {
			console.log('Cannot switch viewer because the current view refuses to deactivate.');
			return Promise.reject();
		}

		if (action === 'show') {
			this.getLayout().setActiveItem(this.gridView);
			this.el.setStyle('overflowY', 'auto');
			this.gridView.refresh();
			Ext.defer(this.adjustOnResize, 1000, this);
		}
		else {
			this.el.setStyle('overflowY', 'hidden');
			this.getLayout().setActiveItem(this.viewer);
		}
		return Promise.resolve();
	}

});
