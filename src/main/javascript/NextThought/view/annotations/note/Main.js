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

	renderTpl: Ext.DomHelper.createTemplate([
		{
			cls: 'meta',
			cn: [{
				cls: 'controls',
				cn: [{ cls: 'bookmark' },{ cls: 'favorite' }]
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
		favorites: '.meta .controls .favorite',
		bookmarks: '.meta .controls .bookmark',
		name: '.meta .name',
		time: '.meta .time',
		context: '.context .text',
		text: '.body',
		responseBox: '.respond',
		editor: '.respond .editor',
		replyOptions: '.respond .reply-options',
		replyButton: '.respond .reply'
	},

	initComponent: function(){
		this.callParent(arguments);
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);

		me.setRecord(me.record);

		me.mon(me.replyButton,{
			scope: me,
			click: me.activateReplyEditor
		});

		me.mon(me.editor.down('.cancel'),{
			scope: me,
			click: me.deactivateReplyEditor
		});


		me.mon(me.editor.down('.content'),{
			scope: me,
			keypress: me.editorKeyPressed,
			keydown: me.editorKeyDown
		});

		me.editorActions = new NoteEditorActions(me,me.editor);
	},


	setRecord: function(r){
		this.record = r;
		if(!this.rendered){return;}
		UserRepository.getUser(r.get('Creator'),this.fillInUser,this);
		this.time.update(r.getRelativeTimeString());

		this.context.update('Get from the page... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt sem eget quam tempor hendrerit. <span class="highlight">Nulla ultricies tincidunt laoreet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Nunc dictum consequat nisl eget eleifend. Duis tincidunt nibh id dui bibendum aliquam.<span class="tip">&nbsp;</span></span> Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.');

		r.compileBodyContent(function(text){ this.text.update(text); },this);
	},


	fillInUser: function(user){
		if(Ext.isArray(user)){user = user[0];}
		this.name.update(user.getName());
	},


	activateReplyEditor: function(){
		this.el.addCls('editor-active');
	},

	deactivateReplyEditor: function(){
		this.el.removeCls('editor-active');
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
	}

});
