Ext.define('NextThought.view.account.contacts.Panel',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.contacts-panel',
	ui: 'contacts-panel',
	cls: 'contacts-panel',

	collapsible: true,
	hideCollapseTool: true,
	collapsedCls: 'collapsed',

//	componentLayout: 'body',

	frame: false,
	border: false,
	unstyled: true,
	showCount: true,

	initComponent: function(){
		this.callParent(arguments);
		this.setTitle(this.title);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.getHeader().on('click',this.toggleCollapse,this);
	},


	setTitle: function(title){
		if(this.showCount){
			title = Ext.String.format('{0} ({1})',title,this.items.getCount());
		}

		return this.callParent([title]);
	}
});
