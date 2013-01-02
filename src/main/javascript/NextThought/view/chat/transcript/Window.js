Ext.define('NextThought.view.chat.transcript.Window',{
	extend:'NextThought.view.Window',
	alias: 'widget.chat-transcript-window',

	requires: [
		'NextThought.view.chat.transcript.Main',
		'NextThought.view.chat.Gutter'
	],

	cls:'chat-window no-gutter chat-transcript-window',
	ui:'chat-window',

	minWidth:400,
	minHeight:200,
	height:400,
	width:400,
	managed: false,
	modal: true,

	layout: 'auto', autoScroll: true,
	titleTpl:'{0} (Chat History)',

	dockedItems:[
		{xtype:'chat-gutter', dock:'left', hidden:true},
        {
            xtype: 'container',
            hidden: true,
            layout: {
                type: 'hbox',
                pack: 'end',
                align: 'middle'
            },
            itemId: 'buttons',
            cls: 'mod-buttons',
            dock: 'bottom',
            items: [
                {
                    xtype: 'button',
                    ui: 'flat',
                    text: 'Cancel',
                    scale: 'large',
                    handler: function(btn){
                        this.up('window').onFlagToolClicked();
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
                        this.up('window').flagMessages();
                    }
                }
            ]
        }
	],


    tools:{
        'flag-for-moderation':{
            tip:'Flag as Inappropriate',
            handler:'onFlagToolClicked'
        }
    },

    afterRender: function(){
		var btn;
        this.callParent(arguments);
        this.mon(this, 'control-clicked', this.maybeEnableButtons);
		btn = this.el.down('.flag-for-moderation');
		if(btn){
			btn.show();
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


    flagMessages: function(){
        var allFlaggedEntries = this.el.query('.message.flagged'),
            allFlaggedMessages = [],
            guid, m;

        Ext.each(allFlaggedEntries, function(e){
			var arg = {};
            guid = e.getAttribute('data-guid');
            m = this.messageMap[guid];
            if(m){
				arg.sender = e;
				arg.message = m;
				allFlaggedMessages.push(arg);
			}
        }, this);

        this.fireEvent('flag-messages', allFlaggedMessages, this);
    },


    onFlagToolClicked: function(){
        var transcriptViews = this.query('chat-transcript'),
            btn = this.el.down('.flag-for-moderation');

        this.el.toggleCls('moderating');
        Ext.each(transcriptViews, function(v){
            v.toggleModerationPanel();
        });
        btn.toggleCls('moderating');

        //if we are now moderating, do something to the docked item
        if (btn.hasCls('moderating')){
            this.down('[itemId=buttons]').show();
        }
        else {
            this.down('[itemId=buttons]').hide();
        }
    },


    clearFlagOptions: function(){
        var allFlaggedEntries = this.el.query('.message.flagged'),
            checked = this.el.query('.control.checked');
        Ext.each(allFlaggedEntries, function(f){
            Ext.fly(f).toggleCls('flagged');
            if(!Ext.fly(f).hasCls('confirmFlagged')){Ext.fly(f).toggleCls('confirmFlagged');}
        });
        Ext.each(checked, function(f){
            Ext.fly(f).toggleCls('checked');
        });
        this.maybeEnableButtons();
    },


	failedToLoadTranscript: function(){
		alert({
			msg:'There was an error loading chat history for:'+(this.errorMsgSupplement||''),
			width: 450
		});
		this.destroy();
	},


	setTitleInfo: function(contributors){
		var me = this,
			list = me.down('chat-gutter');

		UserRepository.getUser(contributors,function(users){
			var names = [];
			Ext.each(users, function(u){ if(!isMe(u)){ names.push(u.getName()); }});

			list.updateList(users);

			me.setTitle(list.isHidden()
					? Ext.String.format(me.titleTpl,names.join(','))
					: 'Group Chat History');
		});
	},


	insertTranscript: function(record){

		this.setTitleInfo(record.get('Contributors'));
		var container = this.down('[windowContentWrapper]'),
			time = record.get('RoomInfo').get('CreatedTime') || record.get('CreatedTime'),
            messages = record.get('Messages'),
		    existing = container.items, idx = 0, inserted, btn;

        //keep all messages for later flagging:
        if (!this.messageMap){this.messageMap = {};}
        Ext.each(messages, function(m){
            this.messageMap[IdCache.getIdentifier(m.getId())] = m;
        }, this);

		//assume existing is already sorted
		existing.each(function(v,i){
			if(v.time < time){idx = i + 1;}
//			console.log(v.time, v, time, i);
		},this);


		inserted = container.insert(idx,{
			xtype: 'chat-transcript',
			time: time,
			messages: messages
		});

		this.show();
		console.log(this.waitFor);
		this.waitFor--;

		if(this.waitFor > 0 && !this.el.isMasked()){
			console.log(this.waitFor, 'masking...');
			this.el.mask('Loading...','loading');
		}

		if(this.waitFor <=0){
			console.log(this.waitFor, 'finished...');
			if(this.el.isMasked()){
				this.el.unmask();
			}
			//allow the dom to settle, let this execute in the nextish event pump.
			Ext.defer(function(){
				container.getEl().scrollTo('top',container.getEl().dom.scrollHeight);
			},10);
		}
	}
});
