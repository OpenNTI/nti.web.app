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
			items: {
				xtype: 'button',
				ui: 'primary',
				text: 'Add to Contacts',
				scale: 'large',
				handler: function(btn){
					btn.up('.add-contact-popout').addContact();
				}
			}
		}
	],

	constructor: function(config){
		this.items = Ext.clone(this.items);
		this.items[0].user = config.record;
		return this.callParent(arguments);
	},

	initComponent: function(){
		this.callParent(arguments);
		this.on('blur',this.destroy,this);
	},


	destroy: function(){
		Ext.getBody().un('click',this.detectBlur,this);
		this.callParent(arguments);
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);
		Ext.defer(function(){Ext.getBody().on('click',me.detectBlur,me);},1);
	},


	detectBlur: function(e){
		if(!e.getTarget('.add-contact-popout')){
			this.fireEvent('blur');
		}
	},



	addContact: function(){
		var data = this.down('add-person-card').getSelected();

		this.fireEvent('add-contact', data.user, data.groups);
		this.destroy();
	}
});
