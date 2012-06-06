Ext.define('NextThought.view.account.contacts.management.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.contacts-management-panel',

	requires: [
		'NextThought.view.account.contacts.management.GroupList',
		'NextThought.view.account.contacts.management.ContactList',
		'NextThought.view.form.fields.SimpleTextField',
		'NextThought.view.form.fields.UserSearchInputField'
	],

	cls: 'contacts-management',
	layout: 'anchor',
	defaults: {
		anchor: '100%'
	},

	items: [
		{ xtype: 'box', html: { tag: 'div', cls: 'label', html: 'Add People'} },
		{
			xtype: 'usersearchinput',
			ui: 'group-editor',
			emptyText: 'Name',
			trigger2Cls: null//turn off the second trigger
		},
		{ xtype: 'management-contact-list' },

		{ xtype: 'box', html: { tag: 'div', cls: 'label group', html: 'Add Groups'}, set: 'groups' },
		{
			set: 'groups',
			xtype: 'container',
			layout: 'hbox',
			items: [
				{xtype: 'simpletext', width: 129, autoEl: { placeHolder: 'Group' }},
				{xtype: 'button', scale: 'medium', ui: 'secondary', text: 'Add', disabled: true }
			]
		},
		{ xtype: 'management-group-list', set: 'groups' },

		{
			cls: 'add-contacts-finish-box',
			xtype: 'container',
			layout: {
				type: 'hbox',
				pack: 'end'
			},
			items: [{
					action: 'cancel',
					xtype: 'button',
					scale: 'medium',
					ui: 'secondary',
					text: 'Cancel'
				},{
				action: 'finish',
				xtype: 'button',
				scale: 'medium',
				ui: 'primary',
				text: 'Finish'
			}],
			hidden: true
		}
	],

	initComponent: function(){
		this.callParent(arguments);

		var me = this,
			contactList = me.down('management-contact-list'),
			addBtn = me.down('button[text=Add]');

		me.mon( contactList, 'change', me.onContactListChanged, me);
		me.mon( addBtn, 'click', me.addGroup, me);
		me.mon( me.down('simpletext'),{
			scope: me,
			'commit': function(value){ if(value){ me.addGroup(); } },
			'changed': function(newValue){
				if(newValue){ addBtn.enable(); return; }
				addBtn.disable();
			}
		});
	},


	getData: function(){
		return this.down('management-contact-list').getSelected();
	},


	reset: function(){
		this.down('usersearchinput').reset();
		this.down('management-contact-list').reset();
		this.down('management-group-list').reset();
		this.addGroupComplete(true);
	},


	addGroup: function(){
		var text = this.down('simpletext'),
			groupName = text.getValue();

		if (!Globals.INVALID_CHARACTERS_PATTERN.test(groupName)){
			text.setError();
		}
		else {
			this.fireEvent('add-group', groupName, this.addGroupComplete, this);
		}
	},


	addGroupComplete: function(success){
		var text = this.down('simpletext');
		if(success) {
			text.clearValue();
			return;
		}

		text.setError();
	},


	onContactListChanged: function(isEmpty){
		var groupControls = this.query('[set=groups]'),
			finish = this.down('[cls=add-contacts-finish-box]');

		if(isEmpty){
			finish.hide();
			Ext.each(groupControls,function(c){c.show();});
			return;
		}

		Ext.each(groupControls,function(c){c.hide();});
		finish.show();

	}
});

