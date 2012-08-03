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
				{ title: 'Discussion', disabled: true},
				{ title: 'Common Themes', disabled: true },
				{ title: 'Key Words', disabled: true }
			]
		}
	],



	initComponent: function(){
		this.callParent(arguments);
		this.reader = Ext.getCmp('readerPanel');
		LocationProvider.on({
			scope: this.reader,
			navigate: this.reader.onNavigate,
			navigateComplete: this.reader.onNavigateComplete
		});
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
