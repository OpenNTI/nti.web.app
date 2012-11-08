Ext.define('NextThought.view.menus.AnswerHistory',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.answer-history-menu',
	requires: [
		'NextThought.view.menus.LabeledSeparator',
		'NextThought.providers.Location'
	],
	ui: 'nt',
	plain: true,
	showSeparator: false,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'visibility',
	minWidth: 300,

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true,
		listeners: {
			'click': function(item){item.up('menu').handleClick(item);}
		}
	},

	handleClick: function(item){
		this.ownerCmp.setValue(item.text);
	}

});