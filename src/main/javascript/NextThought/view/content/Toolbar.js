Ext.define('NextThought.view.content.Toolbar',{
	extend: 'Ext.toolbar.Toolbar',
	requires: [
		'NextThought.view.content.Filter',
		'NextThought.view.content.JumpBox',
		'NextThought.view.content.Pager',
		'NextThought.view.content.Font',
		'NextThought.view.content.Settings'
	],
	alias: 'widget.content-toolbar',
	ui: 'content',


	height: 79,
	defaults: {
		xtype: 'tbspacer'
	},

	items: [
		{ width: 180 },
		{ xtype: 'content-jumper', flex: 1 },
		{ xtype: 'content-filter', flex: 1 },
		{ xtype: 'content-pager'},
		{ width:100 }
	],

	afterLayout: function(){
		var result = this.callParent(arguments);

		var jump = this.down('content-jumper');
		if(this.getWidth()<=570){
			jump.hide();
		}
		else if(!jump.isVisible()){
			jump.show();
		}

		return result;
	}
});
