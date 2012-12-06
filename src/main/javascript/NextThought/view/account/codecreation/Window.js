Ext.define('NextThought.view.account.codecreation.Window',{
    extend: 'NextThought.view.Window',
    alias: 'widget.codecreation-window',

    requires: [
        'NextThought.view.account.Header',
		'NextThought.view.account.codecreation.Main'
    ],

    cls: 'codecreation-window',
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
				title: 'Create a New Group...',
				detail: 'Once your group has been created, you\'ll receive a \'Group Code\' that you can share with others who want to join your group'
			},
			{xtype: 'box', cls: 'close', width: 10, height: 10}
		]},

		{xtype: 'codecreation-main-view'}
    ],

	afterRender: function(){
		this.callParent(arguments);
		this.mon( this.el.down('.close'), 'click', this.close, this);
	},

	showCreatedGroupCode: function(code){
		var headerView = this.query('account-header-view')[0];
		headerView.updateHeaderText('Your Group Has Been Created...', 'Share the Group Code below to invite users to your group');
		this.query('codecreation-main-view')[0].setGroupCode(code);
		this.doLayout();
	},

	getGroupName: function(){
		return this.query('codecreation-main-view')[0].getGroupName();
	}
});

