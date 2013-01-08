Ext.define('NextThought.view.MessageBar', {
	extend: 'Ext.Component',
	alias : 'widget.message-bar',

	requires: [],

	cls: 'message-bar',

	inheritableStatics: {
		dontShow: {}	},

	renderTpl: Ext.DomHelper.markup([
		{cls: 'remember', html: 'I get it. Don\'t show this again...'},
		'{message}',
		{tag: 'a', cls: 'dismiss', href: '#', html: 'Dismiss'}
	]),

	renderSelectors: {
		closeEl: 'a.dismiss',
		rememberEl: '.remember'
	},

	constructor: function(cfg){
		var messageType = cfg.messageType || '';

		if(this.self.dontShow[messageType] || !Ext.isEmpty(Ext.ComponentQuery.query('message-bar'))){
			return null;
		}
		return this.callParent(arguments);
	},

	initComponent: function(){
		this.callParent(arguments);
		if(Ext.isObject(this.message)){
			this.message = Ext.DomHelper.markup(this.message);
		}
		this.renderData = Ext.apply(this.renderData || {}, {message: this.message});
	},

	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.closeEl, 'click', this.destroy, this);
		this.mon(this.rememberEl, 'click', this.remember, this);
	},

	remember: function(){
		this.self.dontShow[this.messageType] = !this.self.dontShow[this.messageType];
		this.rememberEl[this.self.dontShow ? 'addCls' : 'removeCls']('checked');
	}
});
