Ext.define('NextThought.view.reader.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.reader',
	requires: [
		'NextThought.view.content.Reader',
		'NextThought.view.content.Toolbar',
		'NextThought.view.annotations.View'
	],

	layout:'border',
	defaults: {
		border: false,
		plain: true
	},

	items:[{
		region: 'west',
		layout: {
			type: 'vbox',
			align: 'stretch'
		},
		items: [
			{ xtype: 'content-toolbar', hidden: true, delegate:[ 'library-view-container reader-content' ]},
			{ xtype: 'reader-content', flex: 1 }
		]
	},{
		region: 'center',
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
		activeTab: 1,
		items:[
			{ title: 'Notepad', iconCls: 'notepad', disabled:true },
			{ title: 'Discussion', iconCls: 'discus', xtype: 'annotation-view', discussion:true }
		]
	}],


	initComponent: function(){
		this.callParent(arguments);
		this.mon(this.down('reader-content'),{
			'filter-by-line': 'selectDiscussion'
		});
	},


	selectDiscussion: function(){
		this.down('tabpanel[ui=notes-and-discussion]').setActiveTab(
			this.down('annotation-view[discussion]'));
	}
});
