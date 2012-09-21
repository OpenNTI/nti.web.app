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

	renderSelectors: {
		avatar: '.avatar img',
		replyBox: '.note-reply',
		liked: '.meta .controls .like',
		name: '.meta .name',
		time: '.meta .time',
		text: '.body',
		responseBox: '.respond',
		editor: '.respond .editor',
		replyOptions: '.respond .reply-options',
		replyButton: '.respond .reply',
		more: '.respond .reply-options .more'
	},


	afterRender: function(){
		var me = this;
		this.readOnlyWBsData = {};
		me.callParent(arguments);

		this.replyBox.hover(this.onMouseOver,this.onMouseOut,this);
		me.text.setVisibilityMode(Ext.dom.Element.DISPLAY);

		//decide if we are the first in the parent's list:
		if (me.ownerCt.items.indexOf(me) === 0) {
			me.replyBox.addCls('first');
		}

		me.setRecord(me.record);

		if (this.record.placeHolder) {
            this.setPlaceholderContent();
			return;
		}

		else if (this.record.isFlagged()) {
			console.log('TODO - this is flagged, consider an indicator, or remove this log.');
		}

		if( $AppConfig.service.canShare() ){
			me.mon(me.replyButton,{
				scope: me,
				click: me.activateReplyEditor
			});
		}
		else{
			me.replyButton.remove();
		}

		me.mon(me.editor.down('.cancel'),{
			scope: me,
			click: me.deactivateReplyEditor
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

		me.replyOptions.down('.share').remove();

		TemplatesForNotes.attachMoreReplyOptionsHandler(me, me.more);
		me.editorActions = new NoteEditorActions(me,me.editor);
	},

	click: function(e){
		var t = e.getTarget('img.whiteboard-thumbnail'), guid = t.parentNode.getAttribute('id');
		console.log(guid);
		if(t && this.readOnlyWBsData[guid]){
			Ext.widget('wb-window', {height: '75%', width: '50%', value: this.readOnlyWBsData[guid], readonly: true}).show();
		}
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
	},

	onMouseOut: function(){
		//if this reply is near the top from scrolling... toggle the carousel's clsses
		var s = this.getCarouselIfNear();
		if(s){ s.removeCls('hover'); }
		this.replyBox.removeCls('hover');
	},


	updateToolState: function(){
		this.liked.set({'title':  this.record.isLiked() ? 'Liked' : 'Like'});
		if (this.record.isFlagged()){this.replyOptions.down('.flag').setHTML('Flagged');}
	},

	setRecord: function(r){
		var me = this,
			likeTooltip;

		//Remove the old listener
		if(this.record){
			this.mun(this.record, 'updated', this.updateToolState, this);
			this.mun(this.record, 'child-added', this.addNewChild, this);
		}

		this.record = r;
		this.guid = IdCache.getIdentifier(r.getId());
		if(!me.rendered){return;}
		if (!r.placeHolder){UserRepository.getUser(r.get('Creator'),me.fillInUser,me);}

		me.recordIdHash = IdCache.getIdentifier(r.getId());

		me.time.update(r.getRelativeTimeString());
		me.liked.update(r.getFriendlyLikeCount());
		if (r.isLiked()){
			this.liked.addCls('on');
		}
		try{
			r.compileBodyContent(this.setContent, this, this.generateClickHandler, 226);
			this.responseBox[r.get('sharedWith').length===0?'removeCls':'addCls']('shared');
		}
		catch(e){
			console.error(Globals.getError(e));
			this.replyBox.remove(); //placeholder
		}
		if (r.children) {
			Ext.Array.sort(r.children || [],Globals.SortModelsBy('CreatedTime',null,null));
			me.addReplies(r.children);
		}
		this.updateToolState();
		this.mon(r, 'updated', this.updateToolState, this);
		this.mon(r, 'child-added', this.addNewChild, this);
	},


	activateReplyEditor: function(e){
		if(e){e.stopEvent();}

		if(this.replyBox && this.up('window').checkAndMarkAsActive()){
			this.replyBox.addCls('editor-active');
			this.editorActions.activate();
			this.scrollIntoView();
		}
		return false;
	},


	deactivateReplyEditor: function(){
		var myWindow = this.up('window');
		if(this.replyBox){
			if(!myWindow.editorActive()){
				console.warn('editor already deactivated?');
			}
			this.replyBox.removeCls('editor-active');
			this.editorActions.deactivate();
			this.editor.down('.content').update('');
		}
		if(this.editMode){
			this.text.show();
		}
		delete this.editMode;
		myWindow.setEditorActive(false);
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


	addNewChild: function(child){
		if(child.get('inReplyTo') === this.record.getId()){
			this.addReplies([child]);
		}
		else {
			console.log('[reply] ignoring, child does not directly belong to this item '+this.record.getId(), child);
		}
	},


	addReplies: function(records){
		var toAdd = [];
		Ext.each(records, function(record){
			var guid = IdCache.getComponentId(record, null, 'reply'),
				add = true;
			if (record.getModelName() !== 'Note') {
				console.warn('can not at reply, it is not a note and I am not prepared to handle that.');
				add=false;
			}

			if (Ext.getCmp(guid)) {
				console.log('already showing this reply');
				add=false;
			}

			if(add){
				toAdd.push({record: record, id: guid});
			}
		});
		this.add(toAdd);
	},

	onEdit: function(){
		this.text.hide();
		this.editMode = true;
		this.editorActions.editBody(this.record.get('body'));
		this.activateReplyEditor();
	},


	onDelete: function(){
		var r = this.record;
		r.set('blod',['deleted']);
		r.clearListeners();
		r.placeHolder = true;

		if (r.children && r.children.length > 0){
			this.setPlaceholderContent();
		}
		else {
			this.destroy();
		}

		if(r.isModifiable()){
			r.destroy();
		}
		else {
			r.tearDownLinks();
		}
	},


	setPlaceholderContent: function() {
		this.wipeOutContent("THIS MESSAGE HAS BEEN DELETED");
	},


	wipeOutContent: function(replacementText) {
		this.time.update(replacementText);
		this.text.remove();
		this.responseBox.remove();
		this.avatar.remove();
		this.liked.remove();
		this.replyBox.toggleCls("deleted-reply");
	},


	onChat: function() {
		this.fireEvent('chat', this.record);
	},


	onFlag: function() {
		this.record.flag(this);
	}

},
function(){
	this.borrow(NextThought.view.annotations.note.Main, [
		'setContent',
		'generateClickHandler',
		'fillInUser',
		'fillInShare',
		'editorSaved',
		'scrollIntoView'
	]);


	this.prototype.renderTpl = Ext.DomHelper.markup([
			{
				cls: 'note-reply',
				cn: [{
					cls: 'avatar',
					cn:[{tag: 'img', src: Ext.BLANK_IMAGE_URL}]
				},
				{
					cls: 'meta',
					cn: [{
						cls: 'controls',
						cn: [{ cls: 'favorite-spacer' },{ cls: 'like' }]
					},{
						tag: 'span',
						cls: 'name'
					},{
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
		]);
});
