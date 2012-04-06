Ext.define('NextThought.view.widgets.chat.LogEntry', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-log-entry',

	requires: [
		'NextThought.util.AnnotationUtils',
		'NextThought.view.widgets.chat.ReplyTo',
		'NextThought.cache.IdCache'
	],

	renderTpl: new Ext.XTemplate(
		'<div class="x-chat-log-entry">',
			'<span class="reply">',
				'<span class="reply-whisper {enablewhisper}"></span>',
				'<span class="reply-public"></span>',
				'<span class="pin"></span>',
			'</span>',
			'<div class="timestamp">{time}</div>',
			'<img src="{icon}" width=16 height=16"/>',
			'<div>',
				'<span class="name">{name}</span> ',
				'<span class="body-text">{body}</span> ',
			'</div>',
		'</div>',
		'<div class="x-chat-replies"></div>'
		),

	renderSelectors: {
		box: 'div.x-chat-log-entry',
		name: '.x-chat-log-entry span.name',
		text: 'span.body-text',
		time: 'div.timestamp',
		icon: 'img',
		frameBody: 'div.x-chat-replies',
		enablewhisper: '.x-chat-log-entry span.nowhisper'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.update(this.message);
	},

	add: function(){
		var r = this.callParent(arguments),
			reply = this.down('chat-reply-to');

		if(reply && r!==reply){
			var ci = this.items.indexOf(reply);
			this.move(ci, this.items.getCount()-1);
			reply.down('textfield').focus();
		}

		return r;
	},

	update: function(m){
		var me = this,
			s = m.get('Creator');

		me.message = m;
		me.messageId = IdCache.getIdentifier(m.getId());

		me.renderData.time = Ext.Date.format(m.get('Last Modified'), 'g:i:sa');
		me.renderData.name = 'resolving...';

		if (s !== $AppConfig.username) {
			//This entry is created by you, so don't show the reply whisper option
			me.renderData.enablewhisper = 'enable-whisper';
		}

		AnnotationUtils.compileBodyContent(m,function(content){
			me.renderData.body = content;
			if(me.rendered){
			   me.text.update(me.renderData.body);
			   me.time.update(me.renderData.time);
			}
		});

		if(s){
			UserRepository.prefetchUser(s, function(users){
				var u = users[0];
				if (!u) {
					console.error('failed to resolve user', s, m);
					return;
				}

				me.fillInUser(u);
			},
				this);
		}

		//apply shadow class if necessary:
		me.addCls(/shadow/i.test(m.get('Status')) ? 'shadow' : '');
		me.addCls(m.getId() ? '' : ' nooid');
	},

	afterRender: function(){
		this.callParent(arguments);
		if (!this.up('[disableDragDrop]')) {
			this.initializeDragZone(this);
		}
		this.el.on('click', this.click, this);
	},

	click: function(event, target, eOpts){
		target = Ext.get(target);
		var inBox = target && this.box.contains(target);
		if(inBox){
			if(target.hasCls('reply-public')){
				this.fireEvent('reply-public', this);
			}
			else if(target.hasCls('reply-whisper')){
				this.fireEvent('reply-whisper', this);
			}
			else if(target.hasCls('pin')){
				this.fireEvent('pin', this);
			}
		}
		else if(/whiteboard/i.test(target.getAttribute('class'))){
			//do lightbox/zoom of whiteboard image
			if(!target.is('img')){
				target = target.parent().first('img');
			}

			NextThought.view.whiteboard.Utils.display(target.getAttribute('src'));
		}
	},

	fillInUser: function(u) {
		var name = u.get('alias') || u.get('Username'),
			i = u.get('avatarURL');

		if(this.rendered){
			this.icon.set({src: i});
			this.name.update(name);
		}
		else {
			this.renderData.name = name;
			this.renderData.icon = i;
		}

	},

	initializeDragZone: function(v) {
		v.dragZone = Ext.create('Ext.dd.DragZone', v.getEl(), {

			getDragData: function(e) {
				var sourceEl = v.box.dom, d;
				if (sourceEl) {
					d = sourceEl.cloneNode(true);
					d.id = Ext.id();
					v.dragData = {
						sourceEl: sourceEl,
						repairXY: Ext.fly(sourceEl).getXY(),
						ddel: d,
						data: v.message.data
					};
					return v.dragData;
				}
			},

			getRepairXY: function() {
				return this.dragData.repairXY;
			}
		});
	},

	showReplyToComponent: function() {
		return this.add({
			xtype: 'chat-reply-to',
			replyTo: this.message.getId()
		});
	}
});
