Ext.define('NextThought.view.widgets.chat.LogEntryModerated', {
	extend: 'Ext.form.field.Checkbox',
	alias: 'widget.chat-log-entry-moderated',
	mixins: {
		abstractContainer: 'Ext.container.AbstractContainer',
		contains: 'Ext.container.Container'
	},
	requires: [
		'NextThought.util.AnnotationUtils',
		'NextThought.cache.IdCache'
	],

	preventMark:true,
	anchor: '100%',
	layout: 'anchor',
	cls: 'chat-entry',

	labelableRenderTpl: [
		'<tpl if="!hideLabel && !(!fieldLabel && hideEmptyLabel)">',
			'<label<tpl if="inputId"> for="{inputId}"</tpl> class="{labelCls}"<tpl if="labelStyle"> style="{labelStyle}"</tpl>>',
				'<tpl if="fieldLabel">{fieldLabel}{labelSeparator}</tpl>',
			'</label>',
		'</tpl>',
		'<div class="x-chat-log-entry moderated {baseBodyCls} {fieldBodyCls}"<tpl if="inputId"> id="{baseBodyCls}-{inputId}"</tpl> role="presentation">',
			'<span class="reply">',
				'<span class="reply-whisper"></span>',
				'<span class="reply-public"></span>',
				'<span class="pin"></span>',
			'</span>',
			'<div class="timestamp">{time}</div>',
			'{subTplMarkup}',
			'<img src="{icon}" width=16 height=16"/>',
			'<div>',
				'<span class="name">{name}</span> ',
				'<span class="body-text">{body}</span> ',
			'</div>',
		'</div>',
		'<div class="x-chat-replies"></div>',
//		'<div class="{errorMsgCls}" style="display:none"></div>',
		'<div id="{id}-errorEl" class="{errorMsgCls} errorEl" style="display:none"></div>',
		'<div class="{clearCls}" role="presentation"><!-- --></div>',
		{
			compiled: true,
			disableFormats: true
		}
	],

	renderSelectors: {
		box: 'div.x-chat-log-entry',
		name: '.x-chat-log-entry span.name',
		text: 'span.body-text',
		time: 'div.timestamp',
		icon: 'img',
		frameBody: 'div.x-chat-replies',
		errorEl: 'div.errorEl',
		bodyEl: 'div.x-chat-log-entry'
	},

	initComponent: function(){
		Ext.container.Container.prototype.initComponent.apply(this, arguments);
		this.callParent(arguments);
		this.update(this.message);

		this.$add = this.add;

		//work around a mixin issue... we're mixing in a class that wasn't written as a mixin...
		this.add = function(){
			var r = this.$add.apply(this,arguments);
				reply = this.down('chat-reply-to');
			//console.debug('r', r);

			if(reply && r!==reply){
				var ci = this.items.indexOf(reply);
				this.move(ci, this.items.getCount()-1);
				reply.down('textfield').focus();
			}

			return r;
		};
	},

	update: function(m){
		var me = this,
			s = m.get('Creator');

		me.message = m;
		me.messageId = IdCache.getIdentifier(m.getId());

		me.renderData.time = Ext.Date.format(m.get('Last Modified'), 'g:i:sa');
		me.renderData.name = 'resolving...';
		me.renderData.body = AnnotationUtils.compileBodyContent(m);

		if(this.rendered){
		   me.text.update(me.renderData.body);
		   me.time.update(me.renderData.time);
		}

		if(s){
			UserRepository.prefetchUser(s, function(users){
				var u = users[0];
				if (!u) {
					console.error('failed to resolve user', s, m);
					return;
				}

				me.fillInUser(u);
			});
		}

		//apply shadow class if necessary:
		me.addCls(/shadow/i.test(m.get('Status')) ? 'shadow' : '');
		me.addCls(m.getId() ? '' : ' nooid');
	},

	afterRender: function() {
		this.callParent(arguments);
		this.initializeDragZone(this);

		this.on('change', function(cmp, state){
			this.box.removeCls('selected');
			if(state){ this.box.addCls('selected');}
		});

		this.box.on('click', this.click, this);
	},

	click: function(event, target, eOpts){
		target = Ext.get(target);
		var inBox = target && this.box.contains(target),
			tag = target? target.tagName : '';

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

			alert('TODO: lightbox ');
		}
		else if(!/input/i.test(tag)){
			this.setValue(!this.getValue());
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
