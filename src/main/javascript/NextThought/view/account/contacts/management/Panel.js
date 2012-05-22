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
		this.down('management-people-list').on('change',this.onPeopleListChanged,this);

		var addBtn = this.down('button[text=Add]');
		this.mon(this.down('simpletext'),{
			scope: this,
			'commit': function(value){
				if(value){
					console.log('trigger the same code that the add button does');
				}
			},
			'changed': function(newValue){
				if(newValue){
					addBtn.enable();
					return;
				}
				addBtn.disable();
			}
		});
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

