Ext.define('NextThought.view.chat.View', {
	extend:'Ext.container.Container',
    alias: 'widget.chat-view',

    requires: [
        'NextThought.modules.TouchSender',
        'NextThought.view.chat.Log',
        'NextThought.view.chat.Entry',
        'NextThought.view.chat.TouchHandler'
    ],

    mixins: [
        'NextThought.mixins.ModuleContainer'
    ],

	header: false,
	frame: false,
	border: false,
	autoScroll: false,
	overflowX: 'hidden',
	overflowY: 'hidden',

	cls: 'chat-view',
	ui: 'chat-view',
    layout: {
		type: 'anchor'
	},
	defaults: {anchor: '100%'},
	items: [
		{ xtype: 'chat-log-view', anchor: '0 -51' },
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
                            text: 'Report',
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
	    this.mon(this.down('chat-log-view'), 'add', this.maybeShowFlagIcon, this);
	    this.on('resize',this.reanchorLog,this);
	    this.on('status-change', this.trackChatState, this);
        this.maybeShowFlagIcon();

        if(Ext.is.iPad){
            var me = this;

            this.attachSenders();

            me.el.down('input').on('touchstart', function(){
                me.el.down('input').dom.click();
            });

            me.el.down('input').on('focus', function(){
                console.log('input focused');
                if(!me.hasOwnProperty('initialY')){
                    me.initialY = me.el.up('.x-window-chat-window').getY();
                    console.log('initialY:' + me.initialY);
                }
            }, me);

            me.el.down('input').on('blur', function(){
                console.log("input blurred");
                Ext.Function.defer(function(){
                    console.log("deferred function");
                    var topWindow = me.el.up('.x-window-chat-window');
                    if(me.hasOwnProperty('initialY')){
                        topWindow.setY(me.initialY);
                    }
                },100);
            },me);

        }
    },


    attachSenders: function(){
        var me = this,
            s = {
                NONE: 0,
                DOWN: 1,
                SCROLLING: 3,
                SELECTING: 4,
                DRAGGING: 5
            },
            state = s.NONE,

            initialTime,
            initialX, initialY,
            lastX, lastY,
            vel;

        var mainDom = this.down('.chat-log-view').el.dom;

        mainDom.addEventListener('touchstart', function(e){
            console.log('touchStart');
            var touch = e.touches[0];

            if(state !== s.NONE){
                return;
            }
            state = s.DOWN;

            initialTime = Date.now();
            initialY = touch.pageY;
            initialX = touch.pageX;
            lastY = initialY;
            vel = 0;

        });

        mainDom.addEventListener('touchmove', function(e){
            console.log('touchmove');

            var touch = e.touches[0];

            if(state === s.DOWN || state === s.SCROLLING){
                console.log('should be scrolling?');
                vel = lastY - touch.pageY;
                lastY = touch.pageY;
                lastX = touch.pageX;

                var ele = me.down('.chat-log-view').el;
                console.log(me);
                ele.scrollBy(0, vel, false);

                state = s.SCROLLING;
            }
        });

        mainDom.addEventListener('touchend', function(e){
            console.log('touchend');
            state = s.NONE;
        });

    },


	trackChatState: function(notification){
		if(!notification || !notification.status){ return; }

		var me = this, activeTimer= 120000,
			goneTimer = 600000,
			room = this.up('.chat-window') ?  this.up('.chat-window').roomInfo : null;
		if(!room){ console.log("Error: Cannot find the roomInfo, so we drop the chat status change"); return; }

		// NOTE: We want to always restart the timer when the receive one of these events.
		if(notification.status === 'active' || notification.status === 'composing' || notification.status === 'paused'){
			clearTimeout(me.inactiveTimer);
			clearTimeout(me.awayTimer);
			me.inactiveTimer = setTimeout(function(){ me.fireEvent('status-change', {status:'inactive'}); }, activeTimer);
			me.awayTimer = setTimeout( function(){ me.fireEvent('status-change', {status:'gone'}); }, goneTimer);
		}

		if( notification.status !== 'active' ) {
			me.fireEvent('publish-chat-status', room, notification.status);
		}
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
		if(otherEntries.length > 0 || (entry && entry.message && entry.message.get && !isMe(entry.message.get('Creator')))){
			w = this.up('.chat-window');
			if(w){
				i =  w.el.select('.flag-for-moderation', null, true);
				if(i){
					i.show();
				}
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
	    this.updateLayout();
    },


	showError: function(errorObject){
		var box = this.down('[name=error]'),
			errorText = errorObject.message || 'An unknown error occurred. Please try again.';
        //make main error field show up
        box.el.down('.error-desc').update(errorText);
        box.show();

		this.reanchorLog();
	},


	clearError: function(){
		var box = this.down('[name=error]'),
			log = this.down('chat-log-view');
		log.anchor = log.initialConfig.anchor;
		box.hide();
	},


	reanchorLog: function(){
		var log = this.down('chat-log-view'),
			foot = 0;

		this.items.each(function(cmp){
			if(cmp !== log){
				foot += cmp.getHeight();
			}
		});

		log.anchor = '0 '+(-1*foot);
		this.updateLayout();
	}
});
