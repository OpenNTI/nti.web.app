Ext.define( 'NextThought.view.views.Library', {
	extend: 'NextThought.view.views.Base',
	alias: 'widget.library-view-container',
	requires: [
		'NextThought.view.content.Reader',
		'NextThought.view.content.Toolbar'
	],
	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	items: [
		{	xtype: 'content-toolbar' },
		{
			cls: 'x-focus-pane',
			region: 'center',
			flex: 1,
			border: false,
			frame: false,
			layout: 'fit',
			defaults: {border: false, frame: false},
			items: {
				xtype: 'reader-panel',
				id: 'readerPanel'
			},
			margin: '0 100px 0 0'
		}
	],



	initComponent: function(){
		this.callParent(arguments);
		this.reader = Ext.getCmp('readerPanel');
		LocationProvider.on('navigate',this.reader.loadPage,this.reader);
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
	}
});
