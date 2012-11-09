Ext.define('NextThought.view.chat.View', {
	extend:'Ext.container.Container',
    alias: 'widget.chat-view',

    requires: [
        'NextThought.view.chat.Log',
        'NextThought.view.chat.Entry'
    ],

	header: false,
	frame: false,
	border: false,

	cls: 'chat-view',
	ui: 'chat-view',
    layout: {
		type: 'vbox',
		align: 'stretch'
	},
	items: [
		{ xtype: 'chat-log-view', flex:1 },
		{xtype: 'box', hidden: true, name:'error', autoEl: {cls: 'error-box', tag:'div',
            cn:[
                {cls: 'error-desc'}
            ]}
        },
		{ xtype: 'chat-entry', mainEntry: true }
    ],

	showError: function(errorObject){
		var box = this.down('[name=error]'),
			errorText = errorObject.message || 'An unknown error occurred. Please try again.';
        //make main error field show up
        box.el.down('.error-desc').update(errorText);
        box.show();
	},

	clearError: function(){
		var box = this.down('[name=error]');
		box.hide();
	}
});
