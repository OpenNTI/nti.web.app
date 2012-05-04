Ext.define('NextThought.view.account.contacts.Activity',{
	extend: 'Ext.Component',
	alias: 'widget.contact-activity',

	renderTpl: [
		'<div class="activity {type}">{message}</div>'
	],

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.applyIf(this.renderData||{},this.initialConfig);
	}
});
