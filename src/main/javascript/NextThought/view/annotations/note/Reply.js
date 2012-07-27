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
	getTargetEl: function () { return this.body; },

	renderTpl: Ext.DomHelper.markup([
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
		  tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}')
		}
	]),

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
		startChatButton: '.respond .chat',
		more: '.respond .reply-options .more'
	},

	afterRender: function(){
		var me = this;
		me.callParent(arguments);

		this.replyBox.hover(this.onMouseOver,this.onMouseOut,this);

		//decide if we are the first in the parent's list:
		if (me.ownerCt.items.indexOf(me) === 0) {
			me.replyBox.addCls('first');
		}

		me.setRecord(me.record);

		if (this.record.placeHolder) {
			this.replyBox.remove();
			delete this.replyBox;
			return;
		}

		me.mon(me.startChatButton,{
			scope: me,
			click: me.startChat
		});

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


	getCarouselIfNear: function(){
		var c = this.up('window').down('note-carousel').getEl();

		return c.dom.getBoundingClientRect().bottom >=
				this.el.dom.getBoundingClientRect().top ? c : null;
	},

	onMouseOver: function(){
		//if this reply is near the top from scrolling... toggle the carousel's clsses
		var s = this.getCarouselIfNear();
		if(s){ s.addCls('hover'); }

		Ext.each(this.up('window').query('note-reply'),function(r){
			if(r.replyBox){r.replyBox.removeCls('hover');}
		});
		this.replyBox.addCls('hover');
		this.doLayout();
	},

	onMouseOut: function(){
		//if this reply is near the top from scrolling... toggle the carousel's clsses
		var s = this.getCarouselIfNear();
		if(s){ s.removeCls('hover'); }
		this.replyBox.removeCls('hover');
		this.doLayout();
	},


	scrollIntoView: function(){
		var scroller = this.up('note-responses').ownerCt.getEl();
		if( this.replyBox ){
			this.replyBox.addCls('hover');
		}
		this.getEl().scrollIntoView(scroller);
		this.doLayout();
	},


	setRecord: function(r){
		this.record = r;
		this.guid = IdCache.getIdentifier(r.getId());
		var me = this;
		if(!me.rendered){return;}
		if (!r.placeHolder){UserRepository.getUser(r.get('Creator'),me.fillInUser,me);}
		me.time.update(r.getRelativeTimeString());
		me.liked.update(r.getFriendlyLikeCount());
		if (r.isLiked()){
			this.liked.addCls('on');
		}
		if (r.isFavorited()){
			this.favorites.addCls('on');
		}
		try{
			r.compileBodyContent(function(text){
				var search =  me.up('window').getSearchTerm(), re;
				if(search){
					search = Ext.String.htmlEncode( search );
					re = new RegExp( RegExp.escape( search ), 'ig');
					text = text.replace(re,'<span class="search-term">'+search+'</span>');
				}
				me.text.update(text);
				me.text.select('a[href]',true).set({target:'_blank'});
				setTimeout(function(){
					me.doComponentLayout();
					me.doLayout();
				},1);
			});
		}
		catch(e){
			console.error(Globals.getError(e));
			this.replyBox.remove(); //placeholder
		}
		if (r.children) {
			Ext.each(r.children, me.addReply, me);
		}
	},


	fillInUser: function(user){
		if(Ext.isArray(user)){user = user[0];}
		this.name.update(user.getName());
		TemplatesForNotes.updateMoreReplyOptionsLabels(this.more,user);
	},


	saveReply: function(){
		var v = this.editorActions.getValue(),
			me = this;

		function callback(success, record){
			console.log('save reply was a success?', success, record);
			if (success) {
				me.deactivateReplyEditor();
				me.addReply(record);
			}
		}

		this.up('window').fireEvent('save-new-reply', this.record, v.body, v.shareWith, callback);
	},


	activateReplyEditor: function(){
		if(this.replyBox){
			this.replyBox.addCls('editor-active');
			this.doLayout();
			this.doComponentLayout();
			this.scrollIntoView();
		}
	},


	deactivateReplyEditor: function(){
		if(this.replyBox){
			this.replyBox.removeCls('editor-active');
			this.editor.down('.content').update('');
		}
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
			this.replyBox.remove();
			r.placeHolder = true;
		}
		else {
			this.destroy();
		}

		r.destroy();
	},

	startChat: function() {
		this.fireEvent('chat', this.record);
	}

});
