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
			html: '{0}'
		}
	).compile(),

	renderTpl: Ext.DomHelper.markup([
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
	]),

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
		startChatButton: '.respond .chat',
		more: '.respond .reply-options .more'
	},

	initComponent: function(){
		this.callParent(arguments);
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);

		try {
			me.setRecord(me.record);

			me.mon(me.replyButton,{ scope: me, click: me.activateReplyEditor });
			me.mon(me.editor.down('.cancel'),{ scope: me, click: me.deactivateReplyEditor });
			me.mon(me.editor.down('.save'),{ scope: me, click: me.editorSaved });

			me.mon(me.startChatButton,{
				scope: me,
				click: me.startChat
			});

			me.mon(me.editor.down('.content'),{
				scope: me,
				keypress: me.editorKeyPressed,
				keydown: me.editorKeyDown
			});

			me.mon( this.liked, 'click', function(){ me.getRecord().like(me.liked); },this);
			me.mon( this.favorites, 'click', function(){ me.getRecord().favorite(me.favorites); },this);

			TemplatesForNotes.attachMoreReplyOptionsHandler(me, me.more);
			me.editorActions = new NoteEditorActions(me,me.editor);
			me.mon(me.editorActions, { scope: me, 'size-changed': function(){ me.doComponentLayout(); } });

			this.el.hover(this.onMouseOver,this.onMouseOut,this);
		}
		catch(e){
			console.error(Globals.getError(e));
		}
	},

	onMouseOver: function(){
		this.up('window').down('note-carousel').getEl().addCls('hover');
		this.el.addCls('hover');
		this.doComponentLayout();
	},

	onMouseOut: function(){
		this.up('window').down('note-carousel').getEl().removeCls('hover');
		this.el.removeCls('hover');
		this.doComponentLayout();
	},


	moveSubstringToWord: function(string, start, left) {
		var c,
			inc = left ? -1: 1;
		try {
			do{
				c = string.charAt(start);
				start += inc;

				if(start < 0 || start > string.length) {
					return left ? 0: undefined;
				}
			} while(!/\s/.test(c));
		}
		catch(e) {
			//pass boundary
			return left ? 0: undefined;
		}

		return start - inc;
	},


	getRecord: function(){return this.record;},


	setRecord: function(r){
		var suppressed, text, bodyText, start, end, range, doc,
			boundryChars = 50;

		this.record = r;
		if(!this.rendered || !r){return;}

		try {
			UserRepository.getUser(r.get('Creator'),this.fillInUser,this);
			this.time.update(r.getRelativeTimeString());
			this.liked.update(r.getFriendlyLikeCount());
			this.liked[(r.isLiked()?'add':'remove')+'Cls']('on');
			this.favorites[(r.isFavorited()?'add':'remove')+'Cls']('on');
		}
		catch(e1){
			console.error(Globals.getError(e1));
		}

		try {
			suppressed = r.get('style') === 'suppressed';
			doc = ReaderPanel.get(this.prefix).getDocumentElement();
			range = Anchors.toDomRange(r.get('applicableRange'),doc);
			if(range){
				text = range.toString();
				console.log(text);
				bodyText = range.commonAncestorContainer.ownerDocument.getElementById('NTIContent').textContent;
				start = bodyText.indexOf(text);
				end = start + text.length;
				start = Math.max(start - boundryChars, 0);
				end += boundryChars;

				//try to find word bounds:
				start = this.moveSubstringToWord(bodyText, start, true);
				end = this.moveSubstringToWord(bodyText, end, false);
				bodyText = Ext.String.trim(bodyText.substring(start, end));

				if (start){ bodyText = '[...] ' + bodyText;}
				if (end){ bodyText += ' [...]';}

				text = bodyText.replace(text, this.highlightTpl.apply([text]));
			} else {
				text = r.get('selectedText');
			}

			this.context.update(text);
		}
		catch(e2){
			console.error(Globals.getError(e2));
		}

		try {
			r.compileBodyContent(function(text){
				this.text.update(text);
				this.text.select('a[href]',true).set({target:'_blank'});
			},this);
			this.up('window').down('note-responses').setReplies(this.record.children);
		}
		catch(e3){
			console.error(Globals.getError(e3));
		}

		try {
			this.record.on('changed', function(){
				this.setRecord(this.record);
			}, this, {single:true});
		}
		catch(e4){
			console.error(Globals.getError(e4));
		}
	},


	fillInUser: function(user){
		if(Ext.isArray(user)){user = user[0];}
		this.name.update(user.getName());
		TemplatesForNotes.updateMoreReplyOptionsLabels(this.more,user);
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
		this.up('window').down('note-carousel').addCls('editor-active');
		me.el.addCls('editor-active');
		me.doComponentLayout();
		setTimeout(function(){me.editorActions.focus();}, 100);
	},

	deactivateReplyEditor: function(){
		this.text.show();
		this.editor.down('.content').update('');
		this.up('window').down('note-carousel').removeCls('editor-active');
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
		console.log(this.record);
		this.record.destroy();
		this.up('window').close();
	},

	startChat: function() {
		this.up('window').fireEvent('chat', this.record);
	}

});
