Ext.define( 'NextThought.view.views.Library', {
	extend: 'NextThought.view.views.Base',
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
				{ title: 'Book Content', xtype: 'reader-panel', id: 'readerPanel' },
				{ title: 'Discussion' },
				{ title: 'Common Themes' },
				{ title: 'Key Words' }
			]
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
