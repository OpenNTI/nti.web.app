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
		{	xtype: 'content-toolbar', margin: '0 0 0 40px' },
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
			'beginNavigate': this.reader.onNavigate,
            navigateAbort: this.reader.onNavigationAborted,
			navigateComplete: this.reader.onNavigateComplete
		});


		LocationProvider.on({
			'navigateComplete':this.onNavigateComplete,
			'beforeNavigate':this.onBeforeNavigate,
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


	onBeforeNavigate: function(ntiid,fromHistory){
		if(!fromHistory){
			return this.up('main-views').fireEvent('activate-main-view', 'library');
		}
	},


	onNavigateComplete: function(pageInfo){
		if(!pageInfo || !pageInfo.isModel){return;}
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
