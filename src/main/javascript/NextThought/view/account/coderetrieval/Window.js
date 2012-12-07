Ext.define('NextThought.view.account.coderetrieval.Window',{
    extend: 'NextThought.view.Window',
    alias: 'widget.coderetrieval-window',

    requires: [
        'NextThought.view.account.Header',
		'NextThought.view.account.coderetrieval.Main'
    ],

    cls: 'coderetrieval-window',
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
				title: '',
				detail: 'Share the Group Code below to invite users to your group'
			},
			{xtype: 'box', cls: 'close', width: 10, height: 10}
		]},

		{xtype: 'coderetrieval-main-view'}
    ],

	afterRender: function(){
		this.callParent(arguments);
		this.mon( this.el.down('.close'), 'click', this.close, this);
		this.down('account-header-view').updateTitle(this.groupName);
		this.down('coderetrieval-main-view').updateCode(this.code);
	}
});

