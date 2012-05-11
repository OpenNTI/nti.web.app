Ext.define( 'NextThought.view.form.fields.UserSearchInputField', {
	extend: 'Ext.form.field.ComboBox',
	alias : 'widget.usersearchinput',
	requires: [
		'NextThought.view.menus.Group'
	],

	width: 70,
	allowBlank: true,
	displayField: 'realname',
	typeAhead: false,
	hideLabel: true,
	multiSelect:false,
	enableKeyEvents: true,
	minChars: 1,
	valueField: 'Username',
	emptyText: 'Search...',
	cls: 'user-search-field',
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
		me.menu = Ext.widget({xtype: 'group-menu'});
		me.menu.on('selected',function(record, item){
			me.fireEvent('select',me,[record]);
		});
	},


	afterRender: function(){
		this.callParent();
		this.inputEl.on({
			mousedown: function(e){ e.dragTracked = true; }
		});
		this.triggerEl.first().parent().addCls('hidden');
	},


	destroy: function(){
		this.menu.destroy();
		delete this.menu;
		this.callParent();
	},


	getRefEl: function(){
		return this.ref || this.getEl();
	},


	onTrigger2Click: function(){
		var e = this.getRefEl();
		if(!this.menu.isVisible()){
			this.menu.setWidth(e.getWidth());
			this.menu.showBy(e,'tl-bl?',[0,5]);
		}
		else {
			this.menu.hide();
		}
	}
});
