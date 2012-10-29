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
		Ext.each(this.el.query('.whiteboard-thumbnail'),
				function(wb){
					Ext.fly(wb).on('click', this.click, this);
					if(wb.previousSibling && Ext.fly(wb.previousSibling).hasCls('whiteboard-magnifier')){
						Ext.fly(wb.previousSibling).on('click', this.click, this);
					}
				},
				this);
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
		var t = e.getTarget('img.whiteboard-thumbnail'), guid;

		// Get a click on the magnifying glass to expand the note
		if(!t && Ext.fly(e.target.nextSibling).hasCls('whiteboard-thumbnail') ){ t = e.target.nextSibling; }
		if(!t){ return;}

		guid = t.parentNode.getAttribute('id');
		console.log(guid);
		if(t && this.readOnlyWBsData[guid]){
			Ext.widget('wb-window',{ width: 802, value: this.readOnlyWBsData[guid], readonly: true}).show();
		}
	}
});
