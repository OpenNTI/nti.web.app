Ext.define('NextThought.view.account.contacts.management.Popout',{
	extend: 'Ext.container.Container',
	alias: 'widget.add-contact-popout',

	requires: [
		'NextThought.view.account.contacts.management.Person'
	],

	floating: true,

	width: 255,
	cls: 'add-contact-popout',

	items: [
		{xtype: 'add-person-card'},
		{
			xtype: 'container',
			cls: 'add-button',
			layout: 'fit',
			items: { xtype: 'button', ui: 'primary', text: 'Add to Contacts' }
		}
	],

	constructor: function(config){
		this.items = Ext.clone(this.items);
		this.items[0].user = config.record;
		return this.callParent(arguments);
	}
});
