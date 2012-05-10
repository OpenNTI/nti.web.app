Ext.define( 'NextThought.view.form.fields.UserSearchInputField', {
	extend: 'Ext.form.field.ComboBox',
	alias : 'widget.usersearchinput',
	
	anchor: '100%',
	allowBlank: true,
	displayField: 'realname',
	typeAhead: false,
	hideLabel: true,
	//hideTrigger:true,
	multiSelect:false,
	enableKeyEvents: true,
	minChars: 1,
	valueField: 'Username',
	emptyText: 'Search...',
	trigger2Cls: 'groupMenuEnable',

	listConfig: {
		loadingText: 'Searching...',
		emptyText: 'No matches found.',
		getInnerTpl: function() {
			return '<div class="search-item">' +
				'<img src="{avatarURL}" width=24 height=24 valign=middle border=0 hspace=5/><span>{realname}</span>' +
			'</div>';
		}
	},

	constructor: function(){
		this.store = Ext.getStore('UserSearch');
		return this.callParent(arguments);
	},

	initComponent: function(){
		this.callParent(arguments);
	}
});
