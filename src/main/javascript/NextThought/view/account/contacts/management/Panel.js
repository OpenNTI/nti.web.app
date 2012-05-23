Ext.define('NextThought.view.account.contacts.management.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.contacts-management-panel',

	requires: [
		'NextThought.view.account.contacts.management.GroupList',
		'NextThought.view.account.contacts.management.PeopleList',
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
		{ xtype: 'management-people-list' },

		{ xtype: 'box', html: { tag: 'div', cls: 'label', html: 'Add Groups'}, labelFor: 'groups' },
		{
			xtype: 'container',
			layout: 'hbox',
			items: [
				{xtype: 'simpletext', width: 129, autoEl: { placeHolder: 'Group' }},
				{xtype: 'button', scale: 'medium', ui: 'secondary', text: 'Add', disabled: true }
			]
		},
		{ xtype: 'management-group-list' },

		{
			cls: 'add-contacts-finish-box',
			xtype: 'container',
			layout: {
				type: 'hbox',
				pack: 'end'
			},
			items: {
				action: 'finish',
				xtype: 'button',
				scale: 'medium',
				ui: 'primary',
				text: 'Finish'
			},
			hidden: true
		}
	],

	initComponent: function(){
		this.callParent(arguments);

		var me = this,
			peopleList = me.down('management-people-list'),
			addBtn = me.down('button[text=Add]');

		me.mon( peopleList, 'change', me.onPeopleListChanged, me);
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
		var people = this.down('management-people-list').getSelected();
		var groups = this.down('management-group-list').getSelected();

		return {
			users: people,
			groups: groups
		};
	},


	reset: function(){
		this.down('usersearchinput').reset();
		this.down('management-people-list').reset();
		this.down('management-group-list').reset();
		this.addGroupComplete(true);
	},


	addGroup: function(){
		var groupName = this.down('simpletext').getValue();
		this.fireEvent('add-group', groupName, this.addGroupComplete, this);
	},


	addGroupComplete: function(success){
		var text = this.down('simpletext');
		if(success) {
			text.clearValue();
			return;
		}

		text.setError();
	},


	onPeopleListChanged: function(isEmpty){
		var label = this.down('[labelFor=groups]').getEl().down('.label'),
			list = this.down('management-group-list'),
			finish = this.down('[cls=add-contacts-finish-box]');

		if(isEmpty){
			list.disallowSelection();
			finish.hide();
			label.update('Add Groups');
			return;
		}

		list.allowSelection();
		finish.show();
		label.update('To Groups');

	}
});

