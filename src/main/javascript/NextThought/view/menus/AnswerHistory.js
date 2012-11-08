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
			//			'beforecheckchange':function(item, checked){ return checked || item.allowUncheck!==false; },
			//			'checkchange': function(item){item.up('menu').handleClick(item);}
		}
	}

});