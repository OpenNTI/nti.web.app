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

		this.UserDataActions = NextThought.app.userdata.Actions.create();
		this.WindowActions = NextThought.app.windows.Actions.create();
		this.showReader();

		this.on('beforedeactivate', this.beforeDeactivate, this);
	},


	showReader: function() {
		this.navigation.removeAll(true);
		this.body.removeAll(true);

		var toolbarConfig = this.getToolbarConfig(),
			readerConfig = this.getReaderConfig(),
			readerContent;

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
			doNavigation: this.doNavigation.bind(this)
		};
	},


	getReaderConfig: function() {
		 return {
		 	xtype: 'reader-content',
		 	prefix: this.prefix,
		 	flex: 1
		 };
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


	setPageInfo: function(pageInfo, bundle) {
		var reader = this.getReaderContent();

		//the reader might not be defined if we are in a timed assignment
		if (reader) {
			reader.setPageInfo(pageInfo, bundle);
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


	doNavigation: function(title, route, precache) {
		this.handleNavigation(title, route, precache);
	},


	showNote: function(record, el) {
		this.WindowActions.showWindow(record, null, el);
	}
});
