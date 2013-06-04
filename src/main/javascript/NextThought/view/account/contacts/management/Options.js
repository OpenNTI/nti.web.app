Ext.define('NextThought.view.account.contacts.management.Options', {
	extend:'Ext.menu.Menu',
	alias:'widget.person-options-menu',
	ui: 'nt',
	cls:'person-options-menu',
	plain: true,
	width: 350,
	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true,
		listeners: {
			'beforecheckchange':function(item, checked){ return item.allowUncheck!==false; },
			'click': function(item){item.up('menu').handleClick(item);}
		}
	},
	items: [
		{ text:'Settings', cls:'label', allowUncheck: false, header: true},
		{ text: 'Mute', allowSelect:true},
		{ text: 'Block', allowSelect:true},
		{ text: 'Remove from contacts', cls:'no-checkbox', removeContact: true, allowSelect:true}
	],

	handleClick: function(item){
		if(item.removeContact){
			if(!this.isContact){ return; }
			this.fireEvent('remove-contact-selected', this, this.user);
		}

		//TODO: right now, we will use the header as a toggle option for showing and hiding the menu
		if(item.header){
			this.fireEvent('hide-menu');
		}
	}
});