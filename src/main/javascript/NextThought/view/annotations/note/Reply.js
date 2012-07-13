Ext.define('NextThought.view.annotations.note.Reply',{
	extend: 'Ext.container.Container',
	alias: 'widget.note-reply',

	requires: [
		'NextThought.layout.component.TemplatedContainer',
		'NextThought.cache.UserRepository',
		'NextThought.view.annotations.note.EditorActions',
		'NextThought.view.annotations.note.Templates'
	],

	cls: 'note-reply-container',
	layout: 'auto',
	componentLayout: 'templated-container',
	defaultType: 'note-reply',
	childEls: ['body'],

	renderTpl: Ext.DomHelper.createTemplate([
		{
			cls: 'note-reply',
			cn: [{
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
			},{ cls: 'body' },{
				cls: 'respond',
				cn: [
					TemplatesForNotes.getReplyOptions(),
					TemplatesForNotes.getEditorTpl()
				]
			}]
		},
		{ id: '{id}-body',
		  cls: 'note-replies',
		  text: '{%this.renderContainer(out,values)%}'
		}
	]).compile(),

	renderSelectors: {
		replyBox: '.note-reply',
		liked: '.meta .controls .like',
		favorites: '.meta .controls .favorite',
		name: '.meta .name',
		time: '.meta .time',
		text: '.body',
		responseBox: '.respond',
		editor: '.respond .editor',
		replyOptions: '.respond .reply-options',
		replyButton: '.respond .reply',
		more: '.respond .reply-options .more'
	},

	getTargetEl: function () {
		return this.body;
	},

	afterRender: function(){
		var me = this;
		me.callParent(arguments);


		//decide if we are the first in the parent's list:
		if (me.ownerCt.items.indexOf(me) === 0) {
			me.replyBox.addCls('first');
		}

		me.setRecord(me.record);

		if (this.record.placeHolder) {
			this.replyBox.remove();
			return;
		}

		me.mon(me.replyButton,{
			scope: me,
			click: me.activateReplyEditor
		});

		me.mon(me.editor.down('.cancel'),{
			scope: me,
			click: me.deactivateReplyEditor
		});

		me.mon(me.editor.down('.save'),{
			scope: me,
			click: me.saveReply
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
				setTimeout(function(){
					me.doLayout();
					me.doComponentLayout();},1);
			}
		});
	},


	setRecord: function(r){
		this.record = r;
		var me = this;
		if(!me.rendered){return;}
		UserRepository.getUser(r.get('Creator'),me.fillInUser,me);
		me.time.update(r.getRelativeTimeString());
		me.liked.update(r.getFriendlyLikeCount());
		if (r.isLiked()){
			this.liked.addCls('on');
		}
		if (r.isFavorited()){
			this.favorites.addCls('on');
		}
		r.compileBodyContent(function(text){
			me.text.update(text);
			setTimeout(function(){
				me.doComponentLayout();
				me.doLayout();
			},1);
		});
		if (r.children) {
			Ext.each(r.children, me.addReply, me);
		}
	},


	fillInUser: function(user){
		if(Ext.isArray(user)){user = user[0];}
		this.name.update(user.getName());
	},


	saveReply: function(){
		var body = this.editorActions.getValue(),
			me = this;

		function callback(success, record){
			console.log('save reply was a success?', success, record);
			if (success) {
				me.deactivateReplyEditor();
				me.addReply(record);
			}
		}

		this.up('window').fireEvent('save-new-reply', this.record, body, undefined, callback);
	},


	activateReplyEditor: function(){
		this.replyBox.addCls('editor-active');
		this.doLayout();
		this.doComponentLayout();
	},


	deactivateReplyEditor: function(){
		this.replyBox.removeCls('editor-active');
		this.doLayout();
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


	addReply: function(record) {
		this.add({record: record});
	},


	onShare: function(){
		this.fireEvent('share', this.record);
	},


	onDelete: function(){
		var r = this.record;
		if (r.children && r.children.length > 0){
			//TODO - placeholder with kids....
			this.replyBox.remove();
		}
		else {
			this.destroy();
		}

		r.destroy();
	}

});
