Ext.define( 'NextThought.view.form.UserSearchInputField', {
	// extend: 'Ext.form.field.Text',
	extend: 'Ext.form.field.ComboBox',
	requires: [
			'NextThought.proxy.UserDataLoader'
	],
	alias : 'widget.usersearchinput',
	
	allowBlank: false,
    displayField: 'realname',
    typeAhead: false,
    hideLabel: true,
    hideTrigger:true,
    anchor: '100%',
    multiSelect:true,
    minChars: 1,

    listConfig: {
        loadingText: 'Searching...',
        emptyText: 'No matches found.',
        getInnerTpl: function() {
            return '<div class="search-item">' +
                '<img src="{avatarURL}" width=24 height=24 valign=middle border=0 hspace=5/><span>{realname}</span>' +
            '</div>';
        }
    },
//    pageSize: 5,
	
	emptyText: 'Share with...',	
	enableKeyEvents: true,
	
	constructor: function(){
		this.store = UserDataLoader.getUserSearchStore();
		this.callParent(arguments);
	},
	
	initComponent: function(){
		this.callParent(arguments);
	}
	
	
	
});