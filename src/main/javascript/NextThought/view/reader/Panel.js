Ext.define('NextThought.view.reader.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.reader',
	requires: [
		'NextThought.view.content.Reader',
		'NextThought.view.content.Toolbar',
		'NextThought.view.annotations.View',
        'NextThought.modules.TouchHandler',
        'NextThought.modules.TouchSender'
	],

    mixins:[
        'NextThought.mixins.ModuleContainer'
    ],

	ui: 'reader',
	cls: 'reader-container',
	layout:'border',
	defaults: {
		border: false,
		plain: true
	},

	items:[{
		region: 'center',
		layout: {
			type: 'vbox',
			align: 'stretch'
		},
		items: [
			{ xtype: 'content-toolbar', hidden: true, delegate:[ 'content-view-container reader-content' ]},
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
		activeTab: 1,
		items:[
			{ title: 'Notepad', iconCls: 'notepad', disabled:true, hidden:true },
			{ title: 'Discussion', iconCls: 'discuss', xtype: 'annotation-view', discussion:true }
		]
	}],


	initComponent: function(){
		this.callParent(arguments);
		this.mon(this.down('reader-content'),{
			'filter-by-line': 'selectDiscussion'
		});
		this.down('annotation-view').anchorComponent = this.down('reader-content');

        var me = this;
        this.buildModule('modules', 'touchSender', {container: me.down('annotation-view')});
        this.buildModule('modules', 'touchHandler',
            {container: me.down('annotation-view'), getPanel: function(){
                    return this.container.el;
                }
            });
	},


	selectDiscussion: function(){
		this.down('tabpanel[ui=notes-and-discussion]').setActiveTab(
			this.down('annotation-view[discussion]'));
	}
});
