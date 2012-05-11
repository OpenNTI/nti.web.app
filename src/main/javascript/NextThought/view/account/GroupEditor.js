Ext.define('NextThought.view.account.GroupEditor', {
	extend: 'Ext.window.Window',
	alias : 'widget.group-editor',
	requires: [
		'NextThought.cache.UserRepository',
		'NextThought.model.User',
		'NextThought.view.form.fields.UserSearchInputField'
	],
	constrain: true,
	title: 'Edit Group',
	width: 450,
	height: 500,
	modal: true,
	layout: 'fit',
	closeAction: 'destroy',
	defaults:{border: false, defaults:{border: false}},

	initComponent: function(){
		var me= this,
			n, s;
		me.callParent(arguments);
		me.removeAll();
		me.store = Ext.create('Ext.data.Store',{
			model: 'NextThought.model.User',
			proxy: 'memory'
		});

		if(!me.record.phantom){
			UserRepository.getUser(me.record.get('friends'), function(users){
				me.store.add(users);
			});

			n = me.record.get('realname');
		}

		me.add(
				{
					xtype: 'form',
					bbar: ['->',
						{minWidth: 80, text: 'Save', actionName: 'save'},
						{minWidth: 80, text: 'Cancel', actionName: 'cancel'}],
					layout: 'anchor',
					items:[{
						xtype: 'textfield',
						anchor: '100%',
						emptyText: 'Group Name',
						allowBlank: false,
						name: 'name',
						validator: function(s){
							s = s.trim();
							var l = s.length,
								m =	Globals.INVALID_CHARACTERS_PATTERN.test(s);

							if (s !==n && me.groupExists(s)) {
								return 'Group named ' + s + ' already exists.';
							}

							if (l > 0 && m) {
								return true;
							}

							return 'Group names must be at least 1 character, and not contain any symbols';
						},
						value: n
					},{
						anchor: '100% -72',
						xtype: 'grid',
						enableColumnHide: false,
						store: this.store,
						columns: [
							{
								text	 : '',
								width	: 30,
								sortable : false,
								xtype	 : 'templatecolumn',
								tpl		 : '<img src="{avatarURL}" width="16" height="16"/>'
							},
							{
								text	 : 'Name',
								flex	 : 1,
								sortable : true,
								dataIndex: 'realname'
							},
							{
								text	 : 'id',
								flex	 : 1,
								sortable : true,
								dataIndex: 'Username'
							},
							{
								xtype: 'actioncolumn',
								sortable: false,
								width: 30,
								items: [{
									iconCls: 'delete-action',
									tooltip: 'Remove',
									handler: function(grid, rowIndex) {
										me.store.removeAt(rowIndex);
									}
								}]
							}
						],
						title: 'Members',
						viewConfig: {
							stripeRows: true
						}
					},
						{html:'<hr size=1/>'},
						{xtype: 'usersearchinput', margin: 5, allowBlank: true, enableKeyEvents: true }
					]
				});

		s = me.down('usersearchinput');
		s.on('select', me.selectSearch, me);
	},

	show: function(){
		this.callParent(arguments);
		var e = this.down('textfield');
		setTimeout(function(){e.focus();}, 500);
	},

	selectSearch: function(sel, items) {
		this.store.add(items);
		sel.setValue('');
		sel.clearInvalid();
		sel.collapse();
	},

	groupExists: function(proposedName) {
		var s = Ext.getStore('FriendsList'),
			r = s.getRange(),
			i=0, m,
			n = proposedName.toLowerCase();

		for (i; i < r.length; i++) {
			m = r[i];
			if (m.get('realname').toLowerCase() === n) {
				return true;
			}
		}

		return false;
	}
});
