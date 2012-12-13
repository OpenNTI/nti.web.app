Ext.define('NextThought.view.account.contacts.createlist.Window',{
    extend: 'NextThought.view.Window',
    alias: 'widget.createlist-window',

    requires: [
        'NextThought.view.account.Header',
        'NextThought.view.account.contacts.createlist.Main'
    ],

    cls: 'createlist-window',
    ui: 'nt-window',
    minimizable: false,
    constrain: true,
    modal: true,
    closable: true,
    resizable: false,
    dialog: true,
    closeAction: 'destroy',

    width: 480,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
        {xtype: 'container', layout: {type: 'absolute'}, items: [
			{
				anchor: '100% 100%',
				xtype: 'account-header-view',
				noIcon: true,
				title: 'Create a New List...',
				detail: 'Enter a name for your new list.  Once created, lists can be used to organize your contacts.'
			},
			{xtype: 'box', cls: 'close', width: 10, height: 10}
		]},
        {xtype: 'createlist-main-view'}
    ],

	afterRender: function(){
		this.callParent(arguments);
		this.mon( this.el.down('.close'), 'click', this.close, this);
	},

	getListName: function(){
		return this.query('createlist-main-view')[0].getListName();
	},

	showError: function(errorText){
		return this.query('createlist-main-view')[0].showError(errorText);
	}
});
