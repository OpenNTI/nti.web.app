Ext.define('NextThought.view.reader.Panel', {
	extend: 'Ext.container.Container',
	alias: 'widget.reader',
	requires: [
		'NextThought.view.content.Reader',
		'NextThought.view.content.Toolbar',
		'NextThought.view.content.notepad.View',
		'NextThought.view.annotations.View'
	],

	ui: 'reader',
	cls: 'reader-container',
	layout: 'border',
	defaults: {
		border: false,
		plain: true
	},

	initComponent: function() {
		this.callParent(arguments);

		this.add([{
				region: 'center',
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				items: [
					this.getToolbarConfig(),
					{ xtype: 'reader-content', flex: 1 }
				]
			},{
				width: 258,
				region: 'east',
				xtype: 'tabpanel',
				ui: 'notes-and-discussion',
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

				activeTab: isFeature('notepad') ? 0 : 1,
				items: [
					{ title: 'Notepad', iconCls: 'notepad', xtype: 'content-notepad', refs: [
							{ ref: 'readerRef', selector: '#' + this.id + ' reader-content' }
						],
						disabled: !isFeature('notepad'), hidden: !isFeature('notepad') },
					{ title: 'Discussion', iconCls: 'discuss', xtype: 'annotation-view', discussion: true }
				]
			}
		]);

		this.mon(this.down('reader-content'), {
			'filter-by-line': 'selectDiscussion'
		});
		this.down('annotation-view').anchorComponent = this.down('reader-content');

		this.on('beforedeactivate', this.beforeDeactivate, this);
	},


	getToolbarConfig: function() {
		return { xtype: 'content-toolbar', hidden: true };
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
