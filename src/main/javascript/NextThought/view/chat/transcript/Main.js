Ext.define('NextThought.view.chat.transcript.Main',{
	extend:'Ext.Component',
	alias: 'widget.chat-transcript',

	cls: 'chat-transcript',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'divider', cn:[{tag:'span', html: '{today}{time:date("F j")}'}] },

		{tag:'tpl', 'for':'messages', cn:[

			{cls: 'message {me}', 'data-guid': '{guid}', cn:[
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

		t = this.time,
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
			var guid = guidGenerator(),
				creator = msg.get('Creator'),
				o = {
					guid: guid,
					me: isMe(creator) ? 'me' : undefined,
					name: creator,
					time: msg.get('CreatedTime'),
					body: 'Loading...'
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
				}


			}, this, this.generateClickHandler, 225);

			m.push(o);
			o = null;
		});
		return m;
	},


	generateClickHandler: function(id,data){
		//this.readOnlyWBsData[id] = data;
	}
});
