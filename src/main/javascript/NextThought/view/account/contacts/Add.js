Ext.define('NextThought.view.account.contacts.Add',{
	extend: 'Ext.container.Container',
	alias: 'widget.contacts-add-panel',

	requires: [
		'NextThought.view.form.fields.SimpleTextField',
		'NextThought.view.form.fields.UserSearchInputField'
	],

	cls: 'contacts-management',
	layout: 'anchor',
	defaults: {
		anchor: '100%'
	},

	items: [
		{
			xtype: 'box',
			html: { tag: 'div', cls: 'label', html: 'Add People'}
		},
		{
			xtype: 'usersearchinput',
			ui: 'group-editor',
			trigger2Cls: null,//turn off the second trigger
			listConfig: {
				ui: 'nt',
				plain: true,
				shadow: false,
				frame: false,
				border: false,
				cls: 'x-menu',
				baseCls: 'x-menu',
				itemCls: 'x-menu-item contact-card',
				loadingText: '<br/>Searching...<br/>',
				emptyText: '<div class="x-menu-item">No results</div>',
				getInnerTpl: function() {
					return [
						'<img src="{avatarURL}">',
						'<div class="card-body">',
							'<div class="name">{realname}</div>',
							'<div class="status">{status}</div>',
						'</div>'
					].join('');
				},
				xhooks: {
					initComponent: function(){
						this.callParent(arguments);
						this.itemSelector = '.contact-card';
					}
				}
			}
		},
		{ xtype: 'container', id: 'selected-people-to-add' },
		{
			xtype: 'box',
			html: { tag: 'div', cls: 'label', html: 'Add Groups'}
		},
		{
			xtype: 'container',
			layout: 'hbox',
			items: [
				{xtype: 'simpletext', flex: 1},
				{xtype: 'button', scale: 'medium', ui: 'secondary', text: 'Add'}
			]
		}
	]
});

