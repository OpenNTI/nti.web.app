Ext.define( 'NextThought.view.form.fields.UserSearchInputField', {
	extend: 'Ext.form.field.ComboBox',
	alias : 'widget.usersearchinput',
	requires: [
		'NextThought.view.menus.Group'
	],
	
	anchor: '100%',
	allowBlank: true,
	displayField: 'realname',
	typeAhead: false,
	hideLabel: true,
	multiSelect:false,
	enableKeyEvents: true,
	minChars: 1,
	valueField: 'Username',
	emptyText: 'Search...',
	trigger1Cls: 'hidden',
	trigger2Cls: 'x-menu',

	listConfig: {
		loadingText: 'Searching...',
		emptyText: 'No matches found.',
		getInnerTpl: function() {
			return '<div class="user-search-suggestion">' +
				'<img src="{avatarURL}"/> <span>{realname}</span>' +
			'</div>';
		}
	},

	constructor: function(){
		this.store = Ext.getStore('UserSearch');
		return this.callParent(arguments);
	},

	initComponent: function(){
		var me = this;
		me.callParent(arguments);
		me.menu = Ext.widget({xtype: 'group-menu', width: 200});
		me.menu.on('selected',function(record, item){
			me.fireEvent('select',me,[record]);
		});
	},


	destroy: function(){
		this.menu.destroy();
		delete this.menu;
		this.callParent();
	},


	onTrigger2Click: function(){
		if(!this.menu.isVisible()){
			this.menu.showBy(this.getEl(),'tl-bl?',[0,5]);
		}
		else {
			this.menu.hide();
		}
	}
});
