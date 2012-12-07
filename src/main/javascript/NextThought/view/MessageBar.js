Ext.define('NextThought.view.MessageBar', {
	extend: 'Ext.Component',
	alias : 'widget.message-bar',

	requires: [],

	cls: 'message-bar',

	statics: {
		dontShow: false
	},

	renderTpl: Ext.DomHelper.markup([
		{cls: 'remember', html: 'I get it. Don\'t show this again...'},
		'Your browser\'s current zoom setting is not fully supported. Please reset it to the default zoom.',
		{tag: 'a', href: '#', html: 'Dismiss'}
	]),

	renderSelectors: {
		closeEl: 'a',
		rememberEl: '.remember'
	},

	constructor: function(){
		if(this.self.dontShow || !Ext.isEmpty(Ext.ComponentQuery.query('message-bar'))){
			return null;
		}
		return this.callParent(arguments);
	},

	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.closeEl, 'click', this.destroy, this);
		this.mon(this.rememberEl, 'click', this.remember, this);
	},

	remember: function(){
		this.self.dontShow = !this.self.dontShow;
		this.rememberEl[this.self.dontShow ? 'addCls' : 'removeCls']('checked');
	}
});
