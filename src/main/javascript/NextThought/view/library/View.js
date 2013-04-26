Ext.define( 'NextThought.view.library.View', {
	extend: 'NextThought.view.View',
	alias: 'widget.library-view-container',
	requires: [
		'NextThought.view.content.Reader',
		'NextThought.view.content.Toolbar',
		'NextThought.view.content.TabPanel'
	],
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	minWidth: 950,
	margin: '0 140px 0 0',

	items: [
		{	xtype: 'content-toolbar', margin: '0 0 0 40px', hidden: true},
		{
			xtype: 'content-tabs',
			items: [
				{ title: 'Book Content', xtype: 'reader-panel', id: 'readerPanel' }//,
//				{ title: 'Discussion', disabled: true},
//				{ title: 'Common Themes', disabled: true },
//				{ title: 'Key Words', disabled: true }
			]
		}
	],



	initComponent: function(){
		this.callParent(arguments);
		this.reader = Ext.getCmp('readerPanel');

		this.mon(this, 'beforeactivate', this.beforeactivate, this);
		this.mon(this, 'deactivate', this.onDeactivated, this);

		LocationProvider.on({
			scope: this.reader,
			//beforeNavigate: 'onBeforeNavigate',
			beginNavigate: 'onBeginNavigate',
            navigateAbort: 'onNavigationAborted',
			navigateComplete: 'onNavigateComplete'
		});


		LocationProvider.on({
			'navigateComplete': 'onNavigateComplete',
			'beforeNavigate': 'onBeforeNavigate',
			'navigateAbort': 'onNavigationAborted',
			scope:this
		});
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
			if(this.up('main-views').fireEvent('activate-main-view', 'library') === false){
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
		this.down('content-page-widgets').show();
		this.setTitle(LocationProvider.findTitle(pageInfo.getId(),'NextThought'));
	},


	restore: function(state){
		this.reader.restore(state);
	},


	activate: function(){
		var res = this.callParent(arguments);
		if(res){
			this.reader.relayout();
		}
		return res;
	},


	getFragment: function(){
		var o = ParseUtils.parseNtiid(LocationProvider.currentNTIID);
		return o? o.toURLSuffix() : null;
	}
});
