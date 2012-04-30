Ext.define('NextThought.view.widgets.NotePanel',{
	extend: 'Ext.container.Container',
	alias: 'widget.note-entry',
	requires: [
		'NextThought.cache.UserRepository',
		'NextThought.cache.IdCache',
		'NextThought.util.AnnotationUtils'
	],

	mixins: {
		avatar: 'NextThought.mixins.Avatar'
	},

	renderTpl: new Ext.XTemplate(
		'<div class="x-nti-note {owner}">',
			'<span class="controls">',
				'<span class="reply" title="Reply to note"></span>',
				'<span class="chat" title="Start a chat"></span>',
				'<span class="edit" title="Edit this note"></span>',
				'<span class="share" title="Share this note"></span>',
				'<span class="mute" title="Mute note"></span>',
				'<span class="delete" title="Delete note"></span>',
			'</span>',
			'<div class="timestamp">{time}</div>',
			'{[this.applySubtemplate("Avatar",values)]}',
			'<div>',
				'<span class="name">{name}</span> ',
				'<span class="body-text selectable">{body}</span> ',
			'</div>',
		'</div>',
		'<div class="x-nti-note-replies">',
			'{%this.renderContainer(out,values);%}',
		'</div>'
		),

	transcriptSummaryRenderTpl: new Ext.XTemplate(
		'<div class="x-nti-note chat-transcript">',
			'<tpl for="contributors">',
				'{[this.contrib(values,parent)]}',
			'</tpl>',
			'<div class="transcript-placeholder"><a href="#">View Log</a> (Messages: {MessageCount})</div>',
		'</div>',
		'<div class="x-nti-note-replies chat-transcript">',
			'{%this.renderContainer(out,values);%}',
		'</div>',{
			contrib: function(user,values){
				return this.applySubtemplate("Avatar", Ext.applyIf({user:user},values));
			}
		}),

	renderSelectors: {
		frameBody:  '.x-nti-note-replies',
		box:		'.x-nti-note',

		//For notes
		name:	   '.x-nti-note .name',
		text:	   '.body-text',
		time:	   '.timestamp',
		controls:   '.x-nti-note .controls'

		//For transcript summaries
	},


	initComponent: function(){
		var m = this,
			a = m.annotation,
			r = m.record = m.record || a.record;

		m.id = this.getCmpId(r);

		if(/TranscriptSummary/i.test(r.getModelName())){
			m.renderTpl = m.transcriptSummaryRenderTpl;
			m.updateModel = m.updateTranscriptSummaryModel;
		}

		m.initAvatar(r.get('Creator'));

		m.callParent(arguments);

		m.updateModel(r);
		m.buildThread(r);
	},

	getCmpId: function(r) {
		return (this.idPrefix||'')+IdCache.getComponentId(r, 'RoomInfo', this.annotation.prefix);
	},

	buildThread: function(record){
		var m = this,
			l = (record.children||[]).length;

		Ext.each(
			Ext.Array.sort( record.children || [], Globals.SortModelsBy('Last Modified', true)),
			function(rec){
				m.add(m.buildReply(rec));
			}
		);

		if(l !== this.items.getCount()) {
			console.warn('Lengths are wrong!', l, this.items.getCount(), this);
		}
	},

	convertToPlaceHolder: function(){
		this.placeHolder = true;
		this.text.update('');//'Place holder for deleted note');
		this.time.remove();
		this.name.remove();
		this.controls.remove();
		this.removeAvatar();
		this.box.addCls('placeholder');
	},

	failedToLoadTranscript: function() {
		var elm = this.box;
		elm.animate({listeners: { beforeanimate: function(){ elm.show(true); } }});
	},

	insertTranscript: function(m, alternateParent){
		if (!alternateParent){this.frameBody.hide();}

		this.removeAll(true);

		var date = Ext.Date.format(m.get('Last Modified') || new Date(), 'M j, Y'),
			panel = alternateParent || this.add({title: Ext.String.format('Chat Transcript | {0}',date), disableDragDrop: true, closable: true}),
			log = panel.add({ xtype: 'chat-log-view' }),
			msgs = m.get('Messages');

		//This happens when a componment is rendering for a bit, likely after this has rendered.
		//Like a large image in a whiteboard.
		log.on('rendered-late', function(){
			this.sizeChanged();
			this.doComponentLayout();
			this.doLayout();
		}, this);

		msgs = Ext.Array.sort( msgs || [], Globals.SortModelsBy('Last Modified'));

		Ext.each(msgs, function(i){ log.addMessage(i); });

		if (!alternateParent) {
			panel.on('beforeclose', function(){
				this.box.show();
			}, this);

			panel.down('header').on('click', function(e){
				e.preventDefault();
				e.stopPropagation();
				panel.close();
				this.box.show();
			}, this);

			//insert a cleanupreply here to guarentee cleanup when transcript is removed.
			panel.cleanupReply = function(b){
				if (!b) {
					return;
				}
				panel.removeAll(true);
			};

			this.frameBody.show({
				listeners: {
					scope: this,
					afteranimate: function(){
						this.sizeChanged();
					}
				}
			});
		}
	},


	updateTranscriptSummaryModel: function(m){
		var c  = Ext.Array.clone(m.get('Contributors'));


		Ext.apply(this.renderData,{
			contributors: Ext.Array.clone(c),
			MessageCount: m.get('RoomInfo').get('MessageCount')
		});
	},


	updateModel: function(m){
		var me = this,
			s = m.get('Creator'),
			owner = m.isModifiable();

		me.record = m;
		Ext.apply(me.renderData,{
			name: 'resolving...',
			owner: owner ? 'owner' : '',
			time: Ext.Date.format(m.get('Last Modified') || new Date(), 'g:i:sa M j, Y')
		});

		AnnotationUtils.compileBodyContent(m, function(content){
			if(me.rendered || me.text){
				me.text.update(content);
				me.time.update(me.renderData.time);
			} else {
				me.renderData.body = content;
			}
		});

		if(s){
			UserRepository.prefetchUser(s,
				function(users){
					var u = users[0];
					if (!u) {
						console.error('failed to resolve user', s, m);
						return;
					}

					me.fillInUser(u);
				},
				this);
		}
	},



	fillInUser: function(u) {
		var name = u.getName(),
			owner = u.isModifiable();

		if(this.rendered){
			this.name.update(name);
			this.box.removeCls('owner');
			if(owner) {
				this.box.addCls('owner');
			}
		}
		else {
			this.renderData.name = name;
			this.renderData.owner = owner ? 'owner' : '';
		}
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);
		if(me.record.placeHolder){
			me.convertToPlaceHolder();
		}

		if(!this.isTranscriptSummary()){
			this.frameBody.unselectable();
			this.box.unselectable();
			if (!this.placeHolder) {
				this.name.unselectable();
				this.text.selectable();
			}
		}


		me.el.on({
			scope: this,
			'click': me.click,
			'mouseup': function(e){
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		});
		me.sizeChanged();
	},


	disable: function() {
		this.callParent([true]);
		var me = this,
			b = Ext.widget('button',
			{
				floating: true,
				text: 'unmute',
				constrain: true,
				renderTo: this.container,
				handler: function(){
						me.fireEvent('unmute', me.record, me, true);
				}
			}
		);

		b.alignTo(this, 'c-c');
		this.unmuteBtn = b;
		b.doLayout();
	},


	enable: function(){
		this.callParent(arguments);
		if (this.unmuteBtn) {
			this.unmuteBtn.destroy();
			delete this.unmuteBtn;
		}
	},


	click: function(event, target){
		if (this.isDisabled()) {
			return;
		}

		target = Ext.get(target);
		event.preventDefault();
		event.stopPropagation();

		var me = this,
			inBox = target && me.controls && me.controls.contains(target),
			action = inBox && target.getAttribute('className');

		if(action){
			me.fireEvent('action', action, me);
		}
		else if(/whiteboard/i.test(target.getAttribute('class'))){
			//do lightbox/zoom of whiteboard image
			if(!target.is('img')){
				target = target.parent().first('img');
			}

			NextThought.view.whiteboard.Utils.display(target.getAttribute('src'));
		}
		else if(me.box.isDisplayed() && me.isTranscriptSummary()){
			me.box.setDisplayed(false);
			me.fireEvent('load-transcript', me.record, me);
		}
		else{
			me.box.fadeOut({
			    opacity: 0,
			    easing: 'easeOut',
			    duration: 50,
			    remove: false,
			    useDisplay: false
			}).fadeIn({
			    opacity: 1,
			    easing: 'easeOut',
			    duration: 50,
				callback: function(){
					if(me.record.isModifiable()) {
						me.fireEvent('action', 'edit', me);
					}
				}
			});
		}

		return false;
	},


	isTranscriptSummary: function(){
		return (/TranscriptSummary/i).test(this.record.getModelName());
	},


	addReply: function(record){
		this.add(this.buildReply(record));
		this.sizeChanged();
	},


	buildReply: function(record){
		try {
		var m = this,
			a = m.annotation,
			p = a.parentAnnotation? a.parentAnnotation : a,
			r;
			r = Ext.create('widget.note-entry',{
				record: record,
				owner: m,
				annotation: {
					prefix: a.prefix,
					parentAnnotation: p,
					getRecord: function(){return record;},
					remove: function(){ r.removeReply();},
					cleanup: function(){ r.cleanupReply();}
				}
			});

		record.on('updated', r.replyUpdated, r);

		return r;
		}
		catch(e){
			console.error('buildReply: ',e, e.message, e.stack);
		}
	},

	claimChild: function(children, child) {
		var cOid = child.get('NTIID'),
			i, o;
		for(i in children) {
			if (children.hasOwnProperty(i)) {
				o = children[i].get('NTIID');

				if (o === cOid) {
					Ext.Array.erase(children, i, 1);
				}
			}
		}
	},

	updateFromRecord: function(record) {
		var abandonedChildren = Ext.Array.clone(this.record.children || []),
			a, id, panel;

		this.updateModel(record);


		if (record.children && record.children.length > 0) {
			Ext.each(record.children, function(rec){
				this.claimChild(abandonedChildren, rec);
				var id = this.getCmpId(rec),
					reply = this.getComponent(id);

				if (reply) {
					reply.updateFromRecord(rec);
				}
				else {
					this.addReply(rec);
				}
			}, this);
		}
		//console.debug('abandoned', abandonedChildren.length);
		for (a in abandonedChildren) {
			if (abandonedChildren.hasOwnProperty(a)) {
				id = this.getCmpId(abandonedChildren[a]);
				panel = Ext.getCmp(id);
				panel.cleanupReply();
			}
		}

		//set the record to the new record.
		this.record = record;
	},


	hasReplies: function(){
		return this.query('note-entry[placeHolder]').length !== this.query('note-entry').length;
	},

	cleanupReply: function(removeAll){
		var m = this;
		/*,
		children = m.record.children,
		parent = m.record.parent;
		*/
		if (removeAll) {
			m.items.each(function(i){
				m.remove(i, false);
				i.cleanupReply(true);
			},m);

			m.destroy();
		}
		else if(m.hasReplies()) {
			m.convertToPlaceHolder();
		}
		else {
			m.destroy();
		}

		m.sizeChanged();
	},

	onRemove: function(){
		this.callParent(arguments);
		if(this.placeHolder && !this.hasReplies()){
			this.destroy();
		}

		this.sizeChanged();
	},

	removeReply: function(){
		this.cleanupReply();
		this.record.destroy();
	},


	replyUpdated: function(record){
		var m = this,
			children = m.record.children,
			parent = m.record.parent;

		record.on('updated',m.replyUpdated, m);
		record.children = children;
		record.parent = parent;

		m.record = record;
		m.updateModel(record);
		m.sizeChanged();
	},


	sizeChanged: function(){
		var a = this.annotation;
		try{
			a = (a.parentAnnotation || a);
			a.requestRender();
		}
		catch(e){
			console.error(e.stack);
		}
	}
	
	
},
function(){
	this.prototype.sizeChanged = Ext.Function.createBuffered(this.prototype.sizeChanged, 10);
}
);
