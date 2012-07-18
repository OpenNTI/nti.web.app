Ext.define('NextThought.view.annotations.note.Main',{
	extend: 'Ext.Component',
	alias: 'widget.note-main-view',

	requires: [
		'NextThought.cache.UserRepository',
		'NextThought.view.annotations.note.EditorActions',
		'NextThought.view.annotations.note.Templates'
	],

	ui: 'nt',
	cls: 'main-view',

	highlightTpl: Ext.DomHelper.createTemplate(
		{
			tag: 'span',
			cls: 'highlight',
			cn: [
				'{0}',
				{
					tag: 'span',
					cls: 'tip'
				}
			]
		}
	).compile(),

	renderTpl: Ext.DomHelper.createTemplate([
		{
			cls: 'meta',
			cn: [{
				cls: 'controls',
				cn: [{ cls: 'favorite' },{ cls: 'like' }]
			},{
				tag: 'span',
				cls: 'name'
			},' - ',{
				tag: 'span', cls: 'time'
			}]
		},{
			cls: 'context',
			cn: [{tag: 'span', cls: 'text'}]
		},{ cls: 'body' },{
			cls: 'respond',
			cn: [
				TemplatesForNotes.getReplyOptions(),
				TemplatesForNotes.getEditorTpl()
			]
		}
	]).compile(),

	renderSelectors: {
		liked: '.meta .controls .like',
		favorites: '.meta .controls .favorite',
		name: '.meta .name',
		time: '.meta .time',
		context: '.context .text',
		text: '.body',
		responseBox: '.respond',
		editor: '.respond .editor',
		replyOptions: '.respond .reply-options',
		replyButton: '.respond .reply',
		more: '.respond .reply-options .more'
	},

	initComponent: function(){
		this.callParent(arguments);
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);

		me.setRecord(me.record, me.range);

		me.mon(me.replyButton,{
			scope: me,
			click: me.activateReplyEditor
		});
		
		me.mon(me.startChatButton,{
			scope: me,
			click: me.startChat
		});
		
		me.mon(me.editor.down('.content'),{
			scope: me,
			keypress: me.editorKeyPressed,
			keydown: me.editorKeyDown
		});

		me.mon(me.editor.down('.save'),{
			scope: me,
			click: me.editorSaved
		});

		me.mon(me.editor.down('.content'),{
			scope: me,
			keypress: me.editorKeyPressed,
			keydown: me.editorKeyDown
		});

		me.mon(me.liked, {
			scope: me,
			click: function(){
				me.record.like(me.liked);
			}
		});

		me.mon(me.favorites, {
			scope: me,
			click: function(){
				me.record.favorite(me.favorites);
			}
		});

		TemplatesForNotes.attachMoreReplyOptionsHandler(me, me.more);
		me.editorActions = new NoteEditorActions(me,me.editor);

		me.mon(me.editorActions, {
			scope: me,
			'size-changed': function(){
				me.doComponentLayout();
			}
		});
	},


	setRecord: function(r, range){
		this.record = r;
		this.range = range;
		if(!this.rendered){return;}
		UserRepository.getUser(r.get('Creator'),this.fillInUser,this);
		this.time.update(r.getRelativeTimeString());
		this.liked.update(r.getFriendlyLikeCount());
		if (r.isLiked()){
			this.liked.addCls('on');
		}
		if (r.isFavorited()){
			this.favorites.addCls('on');
		}

		var commonAncestor = range ? range.commonAncestorContainer : null,
			ancestorText = commonAncestor ? commonAncestor.textContent : null,
			suppressed = r.get('style') === 'suppressed',
			selectedText = range ? range.toString() : '';

		if (!suppressed){
			ancestorText = ancestorText
					? ancestorText.replace(selectedText, this.highlightTpl.apply([selectedText]))
					: '';
		}

		this.context.update(ancestorText);

		r.compileBodyContent(function(text){ this.text.update(text); },this);
		this.up('window').down('note-responses').setReplies(this.record.children);

		this.record.on('changed', function(){
			this.setRecord(this.record, range);
		}, this, {single:true});
	},


	fillInUser: function(user){
		if(Ext.isArray(user)){user = user[0];}
		this.name.update(user.getName());
	},


	editorSaved: function(){
		var v = this.editorActions.getValue(),
			me = this,
			r = me.record,
			isMyNote = isMe(r.get('Creator')) || r.phantom;

		function callback(success, record){
			console.log('save reply was a success?', success, record);
			if (success) {
				me.deactivateReplyEditor();
				if(isMyNote){
					me.up('window').down('note-responses').addReply(record);
				}
			}
		}

		this.up('window').fireEvent('save-new-reply', this.record, v.body, v.shareWith, callback);
	},


	activateReplyEditor: function(){
		var me = this;
		me.el.addCls('editor-active');
		me.doComponentLayout();
		setTimeout(function(){me.editorActions.focus();}, 100);
	},

	deactivateReplyEditor: function(){
		delete this.mainContentEdit;
		this.text.show();
		this.el.removeCls('editor-active');
		this.doComponentLayout();
	},


	editorKeyDown: function(event){
		event.stopPropagation();
		var k = event.getKey();
		if(k === event.ESC){
			this.deactivateReplyEditor();
		}
	},


	editorKeyPressed: function(event){
		event.stopPropagation();
		//control+enter & command+enter submit?
		//document.queryCommandState('bold')
	},

	onShare: function(){
		this.up('window').fireEvent('share', this.record);
	},


	onDelete: function(){
		this.record.destroy();
	}

});
