Ext.define( 'NextThought.view.library.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.library-view-container',
	requires: [
		'NextThought.view.content.Reader',
		'NextThought.view.content.Toolbar',
		'NextThought.view.annotations.View'
	],

	minWidth: 1024,
	maxWidth: 1165,

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
			{ xtype: 'content-toolbar', hidden: true, delegate:[ 'library-view-container reader-panel' ]},
			{ xtype: 'reader-panel', id: 'readerPanel', flex: 1 }
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
			{ title: 'Notepad', iconCls: 'notepad' },
			{ title: 'Discussion', iconCls: 'discus', xtype: 'annotation-view', discussion:true }
		]
	}],



	initComponent: function(){
		this.callParent(arguments);
		this.reader = Ext.getCmp('readerPanel');

		this.mon(this, 'beforeactivate', this.beforeactivate, this);
		this.mon(this, 'deactivate', this.onDeactivated, this);

		this.reader.on({
			'navigateComplete': 'onNavigateComplete',
			'beforeNavigate': 'onBeforeNavigate',
			'navigateAbort': 'onNavigationAborted',
			'filter-by-line': 'selectDiscussion',
			scope:this
		});
	},


	selectDiscussion: function(){
		this.down('tabpanel[ui=notes-and-discussion]').setActiveTab(
			this.down('annotation-view[discussion]'));
	},


	beforeactivate: function(){
		if(this.reader.activating){
			this.reader.activating();
		}
	},


	onDeactivated: function(){
		var presentation = Ext.ComponentQuery.query('slidedeck-view'),
			noteWindow = Ext.ComponentQuery.query('note-window');

		if(!Ext.isEmpty(presentation)){
			presentation.first().destroy();
		}
		if(!Ext.isEmpty(noteWindow)){
			noteWindow.first().destroy();
		}
	},


	onNavigationAborted: function(resp, ntiid) {
		if(this.fireEvent('navigation-failed', this, ntiid, resp) !== false){
			this.reader.setSplash();
			this.reader.relayout();
			this.down('content-toolbar').hide();
			this.down('content-page-widgets').hide();
		}
	},



	onBeforeNavigate: function(ntiid, fromHistory){
		if(!fromHistory){
			if(this.activate(true) === false){
				return false;
			}
		}
		if(this.reader.iframeReady){
			this.reader.navigating = true;
			return true;
		}

		this.reader.ntiidOnFrameReady = ntiid;
		return false;
	},


	onNavigateComplete: function(pageInfo){
		if(!pageInfo || !pageInfo.isModel){return;}
		this.down('content-toolbar').show();
		this.setTitle(ContentUtils.findTitle(pageInfo.getId(),'NextThought'));
	},


	restore: function(state){
		var ntiid = state.library.location;
		this.reader.setLocation(ntiid,null,true);
		if(this.reader.ntiidOnFrameReady){
			this.up('master-view').down('library-collection').updateSelection(ntiid,true);
		}

		this.fireEvent('finished-restore');
	},


	activate: function(){
		var res = this.callParent(arguments);
		if(res){
			this.reader.relayout();
		}
		return res;
	},


	getFragment: function(){
		var o = ParseUtils.parseNtiid(this.reader.getLocation().NTIID);
		return o? o.toURLSuffix() : null;
	}
});
