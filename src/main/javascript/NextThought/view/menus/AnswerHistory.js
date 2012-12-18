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
	cls:'answer_history_menu',

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true,
		listeners: {
			'beforecheckchange':function(item, checked){ return item.allowUncheck!==false; },
			'click': function(item){item.up('menu').handleClick(item);}
		}
	},

	handleClick: function(item){
		if( !item.is('[answerHistoryTitle]') && !item.is('[noAnswerHistory]') ){
			this.ownerCmp.setValue(item.text);
		}
	}

});