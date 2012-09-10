Ext.define('NextThought.view.account.contacts.management.Popout',{
	extend: 'Ext.container.Container',
	alias: 'widget.contact-popout',

	requires: [
		'NextThought.view.account.contacts.management.Person'
	],

	floating: true,

	width: 255,
	cls: 'contact-popout',
	hideMode: 'visibility',

	items: [
		{xtype: 'person-card'},
		{
			xtype: 'container',
			cls: 'add-button',
			layout: 'fit',
			items: [{
				xtype: 'button',
				ui: 'primary',
				text: 'Add to Contacts',
				scale: 'large',
				handler: function(btn){
					btn.up('.contact-popout').actOnContact();
				}
			}]
		}
	],

	constructor: function(config){
		this.buttonEvent = 'add-contact';
		var isContact = Ext.getStore('FriendsList').isContact(config.record);
		this.items = Ext.clone(this.items);

		Ext.apply(this.items[0],{
			user: config.record,
			liveEdit: isContact
		});

		if(isContact){
			this.buttonEvent = 'delete-contact';
			Ext.apply(this.items[1].items[0],{
				ui: 'secondary',
				text: 'Remove Contact'
			});
		}


//		this.startChatAction = new Ext.Action({
//			text: 'Start a Chat',
//			scope: this,
//			handler: this.startChat,
//			itemId: 'start-chat',
//			ui: 'nt-menuitem', plain: true,
//			hidden: !$AppConfig.service.canChat(),
//			disabled: this.user.get('Presence')==='Offline'
//		});

		return this.callParent(arguments);
	},


	destroy: function(){
		Ext.getBody().un('click',this.detectBlur,this);
		this.callParent(arguments);
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);

		me.mon(me.el,'click',function(e){e.stopPropagation();},me);

		me.on('blur',me.destroy,me);


		Ext.defer(function(){Ext.getBody().on('click',me.detectBlur,me);},1);
	},


	detectBlur: function(e){
		if(!e.getTarget('.contact-popout')){
			this.fireEvent('blur');
		}
	},



	actOnContact: function(){
		var data = this.down('person-card').getSelected();
		this.fireEvent(this.buttonEvent, data.user, data.groups);
		this.destroy();
	}
});
