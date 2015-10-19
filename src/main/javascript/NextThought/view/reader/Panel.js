Ext.define('NextThought.view.reader.Panel', {
	extend: 'Ext.container.Container',
	alias: 'widget.reader',
	requires: [
		'NextThought.view.content.Reader',
		'NextThought.view.content.Toolbar',
		'NextThought.view.content.notepad.View',
		'NextThought.view.annotations.View'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	prefix: 'default',
	ui: 'reader',
	cls: 'reader-container',
	layout: 'none',

	scrollTargetSelector: '.x-panel-body-reader',
	secondaryElSelector: '.x-panel-notes-and-discussion',

	initComponent: function() {
		this.callParent(arguments);

		var items = [],
			toolbarConfig = this.getToolbarConfig(),
			readerConfig = this.getReaderConfig(),
			readerContent;

		this.flatPageStore = NextThought.store.FlatPage.create({ storeId: 'FlatPage-' + this.id });
		this.fireEvent('add-flatpage-store-context', this);

		//since the toolbar can be a bunch of different xtypes
		//add a flag to it so we can find it easily
		toolbarConfig.isReaderToolBar = true;

		this.add([{
				xtype: 'container',
				cls: 'center',
				layout: 'none',
				items: [
					toolbarConfig,
					readerConfig
				]
			},{
				width: 258,
				height: '100%',
				xtype: 'tabpanel',
				cls: 'tabpanel',
				ui: 'notes-and-discussion',
				layout: 'none',
				tabBar: {
					plain: true,
					baseCls: 'nti',
					ui: 'notes-and-discussion-tabbar',
					cls: 'notes-and-discussion-tabs',
					defaults: { plain: true, ui: 'notes-and-discussion-tab' }
				},
				defaults: {
					border: false,
					plain: true
				},

				deferredRender: false,

				stateful: isFeature('notepad'),
				stateId: 'notes-and-discussions',

				activeTab: 1,
				items: [
					{ title: 'Notepad', iconCls: 'notepad', xtype: 'content-notepad', refs: [
							{ ref: 'readerRef', selector: '#' + this.id + ' reader-content' }
						],
						disabled: !isFeature('notepad'), hidden: !isFeature('notepad') },
					{ title: 'Discussion', iconCls: 'discuss', xtype: 'annotation-view', discussion: true, store: this.flatPageStore }
				]
			}
		]);

		readerContent = this.getReaderContent();

		if (readerContent) {
			this.mon(readerContent, {
				'filter-by-line': 'selectDiscussion'
			});
			this.down('annotation-view').anchorComponent = readerContent;
		}

		this.on('beforedeactivate', this.beforeDeactivate, this);

		// NOTE: check notes on the mixin, as to why we might want to set a secondaryViewEl.
		// this.initCustomScrollOn('content', this.scrollTargetSelector,
		// 		//Not sure why yet, but with Notepad enabled, and previously active (so the app restores state with that tab active)
		// 		//this causes the secondaryViewEl to have a very odd bottom value (making the notes & discussions unusable)
		// 		{secondaryViewEl: this.secondaryElSelector, altClass: 'reader-in-view'});
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.pageInfo) {
			this.setPageInfo(this.pageInfo);
		}
	},


	getToolbarConfig: function() {
		return { xtype: 'content-toolbar', hidden: true };
	},


	getReaderConfig: function() {
		 return {xtype: 'reader-content', prefix: this.prefix, flex: 1 };
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


	setPageInfo: function(pageInfo) {
		var reader = this.getReaderContent();

		wait(1)
			.then(reader.setPageInfo.bind(reader, pageInfo));
	},


	beforeDeactivate: function() {
		var reader = this.down('reader-content');
		return !reader || reader.getNoteOverlay().onNavigation();
	},

	selectDiscussion: function() {
		this.down('tabpanel[ui=notes-and-discussion]').setActiveTab(
			this.down('annotation-view[discussion]'));
	}
});
