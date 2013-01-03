Ext.define('NextThought.view.chat.transcript.Main',{
	extend:'Ext.Component',
	alias: 'widget.chat-transcript',

	cls: 'chat-transcript',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'divider', cn:[{tag:'span', html: '{today}{time:date("F j")}'}] },

		{tag:'tpl', 'for':'messages', cn:[

			{cls: 'message {me} {moderatedCls}', 'data-guid': '{guid}', cn:[
                {cls: 'control', tag: 'span'},
				{cls: 'time', html: '{time:date("g:i:s A")}'},
				{ cls: 'wrap', cn: [
					{cls: 'name {me}', html: '{name:ellipsis(50)}'},
					{cls: 'body', html: '{body}'}
				]}
			]}

		]}

	]),

	initComponent: function(){
		var d = this.renderData = Ext.apply(this.renderData||{},{
			time: this.time,
			messages: this.formatMessages(this.messages)
		}),

		t = this.time || 0,
		now = new Date(),
		day = t.getDate(),
		year = t.getFullYear(),
		mo = t.getMonth();
		if(now.getDate()===day && now.getMonth()===mo && now.getFullYear() === year){
			delete d.time;
			d.today = 'Today';
		}

		return this.callParent(arguments);
	},

	afterRender: function(){
		this.callParent(arguments);
        var r = this.el.down('.reply');
		if(r){r.remove();}
		this.el.on('click', this.click, this);
        Ext.each(this.el.query('.control'), function(c){
            this.mon(Ext.fly(c), 'click', this.onControlClick, this);
        }, this);
	},


	formatMessages: function(messages){
		var m = [], me = this;



		function getEl(guid){
			return me.getEl().down('[data-guid='+guid+']');
		}

		Ext.Array.sort(messages,function(a,b){
			var k = 'CreatedTime';

			a = a.get(k);
			b = b.get(k);

			return a===b? 0 : a > b ? 1 : -1;
		});

		Ext.each(messages,function(msg){
			var guid = IdCache.getIdentifier(msg.getId()),
				creator = msg.get('Creator'),
				o = {
                    moderatedCls: msg.hasBeenModerated() ? 'moderated' : '',
					guid: guid,
					me: isMe(creator) ? 'me' : undefined,
					name: creator,
					time: msg.get('CreatedTime'),
					body: 'Loading...',
                    msg: msg      //just pass the message back
				};


			UserRepository.getUser(creator,function(u){
				try{
					o.name = u.getName();
				}
				//if this throws an error, o = null, and we've already rendered.
				catch(er){
					getEl(guid).down('.name').update(u.getName());
				}
			});

			msg.compileBodyContent(function(text){
				try {
					o.body = text;
				}
				//if this throws an error, o = null, and we've already rendered.
				catch(er){
					getEl(guid).down('.body').update(text);
					getEl(guid).down('.body .reply').remove();
				}


			}, me, me.generateClickHandler, 225);

			m.push(o);


			o = null;
		});

		return m;
	},


	generateClickHandler: function(id,data){
		if(this.readOnlyWBsData === undefined){
			this.readOnlyWBsData = {};
		}
		this.readOnlyWBsData[id] = data;
	},

	click: function(e){
		var t = e.getTarget('.whiteboard-container', null, true), guid;

		if(!t){ return;}

		guid = t.up('.body-divider').getAttribute('id');
		if(t && this.readOnlyWBsData[guid]){
			Ext.widget('wb-window',{ width: 802, value: this.readOnlyWBsData[guid], readonly: true}).show();
		}
	},


    onControlClick: function(evt, dom, opts){
        var message = evt.getTarget('.message');

        Ext.fly(message).toggleCls('flagged');
        Ext.fly(dom).toggleCls('checked');
        this.up('chat-transcript-window').fireEvent('control-clicked');
    },


    toggleModerationPanel:function() {
        this.el.toggleCls('moderating');
		Ext.each(this.el.query('.flagged'), function(d){
            Ext.fly(d).removeCls('flagged');
        });
        Ext.each(this.el.query('.control.checked'), function(d){
            Ext.fly(d).removeCls('checked');
        });
    }

});
