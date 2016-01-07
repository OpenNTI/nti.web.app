Ext.define('NextThought.app.contentviewer.panels.Reader', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.reader',

	requires: [
		'NextThought.app.contentviewer.components.Reader',
		'NextThought.app.contentviewer.navigation.Content',
		'NextThought.app.contentviewer.notepad.View',
		'NextThought.store.FlatPage',
		'NextThought.app.annotations.Index',
		'NextThought.app.userdata.Actions',
		'NextThought.app.context.StateStore',
		'NextThought.app.windows.Actions'
	],


	prefix: 'default',
	ui: 'reader',
	cls: 'reader-container',
	layout: 'none',

	scrollTargetSelector: '.x-panel-body-reader',
	secondaryElSelector: '.x-panel-notes-and-discussion',

	navigation: {
		height: 'auto',
		xtype: 'tabpanel',
		ui: 'notes-and-discussion',
		layout: 'none',
		tabBar: {
			plain: true,
			baseCls: 'nti',
			ui: 'notes-and-discussion-tabbar',
			cls: 'notes-and-discussion-tabs',
			defaults: {plain: true, ui: 'notes-and-discussion-tab'}
		},
		defaults: {
			border: false,
			plain: true
		},
		stateFul: isFeature('notepade'),
		stateId: 'notes-and-discussions',
		items: []
	},


	body: {xtype: 'container', cls: 'center', layout: 'none', width: 766},

	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.UserDataActions = NextThought.app.userdata.Actions.create();
		me.WindowActions = NextThought.app.windows.Actions.create();
		me.ContextStore = NextThought.app.context.StateStore.getInstance();
		me.showReader();

		me.on({
			'beforedeactivate': me.beforeDeactivate.bind(me),
			'activate': me.onActivate.bind(me),
			'deactivate': me.onDeactivate.bind(me),
			'destroy': function() {
				Ext.EventManager.removeResizeListener(me.onWindowResize, me);
			}
		});
	},


	onActivate: function() {
		Ext.EventManager.onWindowResize(this.onWindowResize, this);
		this.alignNavigation();
	},


	onDeactivate: function() {
		this.endViewedAnalytics();
		Ext.EventManager.removeResizeListener(this.onWindowResize, this);
	},


	/**
	 * Handles resize event on the reader
	 *
	 * NOTE: Since most video APIs do not provide events for when the browser goes into fullscreen mode,
	 * we are caching the lastScroll zone before we're in fullscreen mode. And when they exist fullscreen mode,
	 * it will fire a resize event. When the resize event is fired, we go ahead and scroll to the last scroll position.
	 * 
	 */
	onWindowResize: function() {
		if (this.navigation && this.navigation.setWidth) {
			this.navigation.setWidth('100%');
			this.alignNavigation();
		}


		var r = this.body.down('reader-content'),
			readerScroll = r && r.getScroll && r.getScroll(),
			isInFullScreenMode = readerScroll && readerScroll.isInFullScreenMode && readerScroll.isInFullScreenMode();

		if (r && r.scrollBeforeFullscreen !== undefined && !isInFullScreenMode) {
			readerScroll.to(r.scrollBeforeFullscreen);
			delete r.scrollBeforeFullscreen;
		}
	},


	showReader: function() {
		this.navigation.removeAll(true);
		this.body.removeAll(true);

		var toolbarConfig = this.getToolbarConfig(),
			readerConfig = this.getReaderConfig(),
			readerContent, onWindowResize;

		this.flatPageStore = this.flatPageStore || NextThought.store.FlatPage.create({ storeId: 'FlatPage-' + this.id });
		this.UserDataActions.initPageStores(this);

		//since the toolbar can be a bunch of different xtypes
		//add a flag to it so we can find it easily
		toolbarConfig.isReaderToolBar = true;

		this.body.add([
			toolbarConfig,
			readerConfig
		]);

		this.navigation.setActiveTab(this.navigation.add(
			// {
			// 	title: 'Notepad',
			// 	iconCls: 'notepad',
			// 	xtype: 'content-notepad',
			// 	refs: [
			// 		{ref: 'readerRed', selector: '#' + this.id + ' reader-content'}
			// 	],
			// 	disabled: !isFeature('notepad'),
			// 	hidden: !isFeature('notepad')
			// },
			{
				title: 'Discussion',
				iconCls: 'discuss',
				xtype: 'annotation-view',
				discussion: true,
				store: this.flatPageStore,
				showNote: this.showNote.bind(this)
			}
		));


		readerContent = this.getReaderContent();

		this.mon(this.flatPageStore, 'bookmark-loaded', function(r) {
			readerContent.pageWidgets.onBookmark(r);
		});

		Ext.destroy(this.readerMons);

		if (readerContent) {
			this.readerMons = this.mon(readerContent, {
				'destroyable': true,
				'filter-by-line': 'selectDiscussion',
				'assignment-submitted': this.fireEvent.bind(this, 'assignment-submitted'),
				'assessment-graded': this.fireEvent.bind(this, 'assessment-graded'),
				'sync-height': this.alignNavigation.bind(this)
			});
			this.down('annotation-view').anchorComponent = readerContent;
		}

		if (this.rendered && this.pageInfo) {
			this.setPageInfo(this.pageInfo, this.bundle);
		}
	},


	alignNavigation: function() {
		var header = this.getToolbar();

		if (header && header.alignTimer) {
			header.alignTimer();
		}

		this.callParent(arguments);
	},


	afterRender: function() {
		this.callParent(arguments);

		var center = this.el.down('.center'),
			height = Ext.Element.getViewportHeight();

		if (this.pageInfo) {
			this.setPageInfo(this.pageInfo, this.bundle);
		} else {
			console.error('No Page Info set on the reader. Everyone PANIC!!!!!!');
		}

		center.setStyle({
			'min-height': (height - 72) + 'px'
		});
	},


	getToolbarConfig: function() {
		return {
			xtype: 'content-toolbar',
			bundle: this.bundle,
			path: this.path,
			pageSource: this.pageSource,
			hideControls: this.pageInfo.hideControls,
			doNavigation: this.doNavigation.bind(this),
			toc: this.toc,
			hideHeader: this.hideHeader,
			rootRoute: this.rootRoute
		};
	},


	getReaderConfig: function() {
		 return {
		 	xtype: 'reader-content',
		 	prefix: this.prefix,
		 	flex: 1
		 };
	},


	onceReadyForSearch: function() {
		var reader = this.getReaderContent();

		return reader.onceReadyForSearch();
	},


	showSearchHit: function(hit, fragment) {
		var reader = this.getReaderContent(),
			scroll = reader && reader.getScroll();

		if (scroll) {
			scroll.toSearchHit(hit, fragment);
		}
	},


	showRemainingTime: function() {
		var header = this.getToolbar();

		if (header && header.showRemainingTime) {
			header.showRemainingTime.apply(header, arguments);
		}
	},


	showHeaderToast: function() {
		var header = this.getToolbar();

		if (header && header.showToast) {
			return header.showToast.apply(header, arguments);
		}
	},


	getToolbar: function() {
		return this.down('[isReaderToolBar]');
	},


	getReaderContent: function() {
		return this.down('reader-content');
	},


	getLocation: function() {
		var reader = this.getReaderContent();

		return reader && reader.getLocation();
	},


	setPageInfo: function(pageInfo, bundle) {
		var reader = this.getReaderContent(),
			toolbar = this.getToolbar();

		if (toolbar) {
			toolbar.setPageInfo(pageInfo, bundle);
		}

		//the reader might not be defined if we are in a timed assignment
		if (reader) {
			reader.setPageInfo(pageInfo, bundle, this.fragment, this.note);
		}

		this.onceReadyForSearch()
			.then(this.beginViewedAnalytics.bind(this));
	},


	goToFragment: function(fragment) {
		var reader = this.getReaderContent();

		this.fragment = fragment;

		if (reader) {
			reader.goToFragment(fragment);
		}
	},


	goToNote: function(note) {
		var reader = this.getReaderContent();

		this.note = note;
		if (reader) {
			reader.goToNote(note);
		}
	},

	beforeDeactivate: function() {
		var reader = this.down('reader-content');
		return !reader || reader.getNoteOverlay().onNavigation();
	},

	selectDiscussion: function() {
		this.down('tabpanel[ui=notes-and-discussion]').setActiveTab(
			this.down('annotation-view[discussion]'));
	},


	/**
	 * Return true if the reader should allow itself to be close
	 * false should attempt to stop the navigation if it can
	 * @return {Promise} fulfills once it can navigate, or rejects if it needs to stop
	 */
	allowNavigation: function(forced) {
		var reader = this.getReaderContent();

		return !reader || reader.allowNavigation(forced);
	},


	beforeRouteChange: function() {
		var reader = this.getReaderContent();

		return reader && reader.beforeRouteChange();
	},


	doNavigation: function(title, route, precache) {
		this.handleNavigation(title, route, precache);
	},


	showNote: function(record, el, monitors) {
		this.WindowActions.pushWindow(record, null, el, monitors);
	},


	getQuestionSet: function() {
		var assessmentItems = this.pageInfo.get('AssessmentItems'),
			i, item;

		assessmentItems = assessmentItems || [];

		for (i = 0; i < assessmentItems.length; i++) {
			item = assessmentItems[i];

			if (item && item instanceof NextThought.model.assessment.QuestionSet) {
				return item;
			}
		}

		return null;
	},


	getAnalyticData: function() {
		var questionSet = this.getQuestionSet(),
			data = {};

		if (questionSet) {
			data.type = 'assessment-viewed';
			data.resource_id = questionSet.getId();
			data.ContentId = this.pageInfo.getId();
		} else {
			data.type = 'resource-viewed';
			data.resource_id = this.pageInfo.getId();
		}

		return data;
	},


	beginViewedAnalytics: function() {
		var data = this.getAnalyticData();
		//if we don't have a resource id for some reason, we can't send a valid event
		if (!data.resource_id) { return; }

		//if we are trying to start an event for the one we already have going
		if (this.__lastAnalyticEvent && this.__lastAnalyticEvent.resource_id === data.resource_id) {
			return;
		}

		if (this.__lastAnalyticEvent) {
			console.warn('Overwriting event %o with %o', this.___lastAnalyticEvent, data);
		}

		this.__lastAnalyticEvent = data;

		AnalyticsUtil.getResourceTimer(data.resource_id, data);
	},


	endViewedAnalytics: function() {
		var data = this.__lastAnalyticEvent;

		if (!data) { return; }

		AnalyticsUtil.stopResourceTimer(data.resource_id, data.type, data);
	}
});
