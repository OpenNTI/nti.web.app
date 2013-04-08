Ext.define('NextThought.view.account.contacts.management.Popout',{
	extend: 'NextThought.view.account.activity.Popout',
	alias: ['widget.contact-popout', 'widget.activity-popout-user'],

	requires: [
		'NextThought.view.account.contacts.management.Person'
	],

	floating: true,

	width: 255,
	cls: 'contact-popout',

	setupItems: function(){
		this.buttonEvent = 'add-contact';
		var isContact = Ext.getStore('FriendsList').isContact(this.record),
			buttonCfg = {
				xtype: 'button',
				ui: 'primary',
				text: 'Add to Contacts',
				scale: 'large',
				handler: function(btn){
					btn.up('.contact-popout').actOnContact();
				}
			};

		this.person = this.add({xtype: 'person-card',
			user: this.record,
			isContact: isContact
		});

		if(isContact){
			this.buttonEvent = 'delete-contact';
			Ext.apply(buttonCfg,{
				ui: 'caution',
				text: 'Remove Contact'
			});
		}

		this.preview = this.add({
			xtype: 'container',
			cls: 'add-button',
			layout: 'fit',
			items: [buttonCfg]
		});
	},


	getPointerStyle: function(x,y){
		var el = this.person.getTargetEl(),
			t = el.getTop(),
			b = el.getBottom();

		return (t <= y && y <= b) ? '' : 'contact';
	},


	actOnContact: function(){
		var data = this.person.getSelected(), me = this,
			fin = function(){ me.destroy(); };

		this.fireEvent(this.buttonEvent, data.user, data.groups, fin);
	}
});
