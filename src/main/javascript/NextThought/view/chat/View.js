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
        {
            cls: 'entry-card',
            border: 0,
            entryCard: true,
            layout: 'card',
            items: [
		        { xtype: 'chat-entry', itemId: 'entry', mainEntry: true },
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        pack: 'end',
                        align: 'middle'
                    },
                    itemId: 'buttons',
                    cls: 'mod-buttons',
                    items: [
                        {
                            xtype: 'button',
                            ui: 'flat',
                            text: 'Cancel',
                            scale: 'large',
                            handler: function(btn){
                                this.up('chat-window').onFlagToolClicked();
                            }
                        },
                        {
                            xtype: 'button',
                            flagButton: true,
                            ui: 'caution',
                            text: 'Flag',
                            scale: 'large',
                            disabled: true,
                            handler: function(){
                                this.up('chat-view').flagMessages();
                            }
                        }
                    ]
                }
            ]
        }
    ],


    afterRender: function(){
        this.callParent(arguments);
        this.mon(this, 'control-clicked', this.maybeEnableButtons, this);
	    this.mon( this, 'add', this.maybeShowFlagIcon, this);
    },


    flagMessages: function(){
        var allEntries = this.query('chat-log-entry'),
            allFlaggedMessages = [];
        Ext.each(allEntries, function(e){
            if (e.isFlagged()){
                allFlaggedMessages.push(e);
            }
        });

        this.fireEvent('flag-messages', allFlaggedMessages, this);
    },

	maybeShowFlagIcon: function(view, entry){
		if(this.showFlagIcon){ return; }

		//NOTE: we want to display the flag icon, only where we have at least one message
		// that can be flagged( meaning that belongs to the other chat participant.)
		var otherEntries = this.el.query('.log-entry-wrapper:not(.me)'), w, i;
		if(otherEntries.length > 0 || !isMe(entry.message.get('Creator'))){
			w = this.up('.chat-window');
			if(w){
				i =  w.el.select('.flag-for-moderation', null, true);
				i.show();
				this.showFlagIcon = true;
			}
		}
	},

    maybeEnableButtons: function(){
        var b = this.down('[flagButton]');
        //if there is checked stuff down there, enable button
        if(this.el.down('.control.checked')){
            b.setDisabled(false);
        }
        //if not, disable
        else{
            b.setDisabled(true);
        }
    },


    toggleModerationButtons:function() {
        var layout = this.down('[entryCard]').getLayout(),
            activeId = layout.getActiveItem().itemId,
            toggledId = (activeId === 'entry') ? 'buttons' : 'entry';

        layout.setActiveItem(toggledId);
    },


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
