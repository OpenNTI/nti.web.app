Ext.define('NextThought.view.chat.log.Entry', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-log-entry',

	requires: [
		'NextThought.layout.component.TemplatedContainer',
		'NextThought.util.Annotations',
		'NextThought.cache.IdCache'
	],

	componentLayout: 'templated-container',

	renderTpl: new Ext.XTemplate(
		'<div class="log-entry-wrapper {me}">',
			'<img src="{avatarURL}" class="avatar" alt="{name}">',
            '<span class="control"></span>',
			'<div class="message-bounding-box">',
			'<div class="log-entry {me}">',
				'<div class="name">{name}</div> ',
				'<div class="body-text">{body}</div> ',
			'</div>',
			'</div>',
		'</div>',
		'<div id="{id}-body" class="replies">',
			'{%this.renderContainer(out,values)%}',
		'</div>'
	),

	childEls: ['body'],

	renderSelectors: {
		icon: 'img',
		name: '.name',
		text: '.body-text'
	},

	initComponent: function(){
		this.addEvents('rendered-late');
		this.enableBubble('rendered-late');
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

		me.renderData.name = 'resolving...';

		if (s !== $AppConfig.username) {
			//This entry is created by you, so don't show the reply whisper option
			me.renderData.enablewhisper = 'enable-whisper';
		} else {
			me.renderData.me = 'me';
		}

		m.compileBodyContent(function(content){
			me.renderData.body = content;
			if(me.rendered){
			   me.text.update(me.renderData.body);
			   me.fireEvent('rendered-late');
			}
		});

		if(s){
			UserRepository.getUser(s, function(u){
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
//		if (!this.up('[disableDragDrop]')) {
//			this.initializeDragZone(this);
//		}
		this.el.on('click', this.click, this);
        this.mon(this.getEl().select('.control'),{
            scope: this,
            click: this.onControlClick
        });
	},

    onControlClick: function(e){
        this.el.down('.control').toggleCls('checked');
        this.el.down('.log-entry').toggleCls('flagged');
        //let our parent know so he can do something.
        this.up('chat-view').fireEvent('control-clicked');
    },


    isFlagged: function(){
        return this.el.down('.log-entry').hasCls('flagged');
    },


	click: function(event, target, eOpts){
		var t = event.getTarget('.whiteboard-wrapper', null, true);

		if(!t){ return; }

		if(event.getTarget('.reply')){
			//TODO: make the chat window/entry listen for this:
			this.fireEvent('reply-to-whiteboard',Ext.clone(this.message.get('body')[0]));
			return;
		}

		Ext.widget('wb-window', { width: 802, value:this.message.get('body')[0], readonly: true}).show();

	},

	fillInUser: function(u) {
		var name = u.getName();
		var url = u.get('avatarURL');
		console.log(url, u);
		this.renderData.name = name;
		this.renderData.avatarURL = url;
		if(this.rendered){
			this.name.update(name);
			this.icon.set({
				src: url,
				alt: name
			});
		}
	},

	initializeDragZone: function(v) {
		v.dragZone = Ext.create('Ext.dd.DragZone', v.getEl(), {

			getDragData: function(e) {
				var sourceEl = v.el.dom, d;
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
	}
});
