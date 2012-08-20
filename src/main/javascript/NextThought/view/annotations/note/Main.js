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

	renderSelectors: {
		avatar: '.avatar img',
		liked: '.meta .controls .like',
		favorites: '.meta .controls .favorite',
		sharedTo: '.shared-to',
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


	destroy: function(){
		if( this.record ){
			this.record.un('change',this.recordChanged,this);
		}
		return this.callParent(arguments);
	},

	afterRender: function(){
		var me = this;
		me.callParent(arguments);
		me.text.setVisibilityMode(Ext.dom.Element.DISPLAY);
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
			me.mon(me.editorActions, { scope: me, 'size-changed': function(){ me.updateLayout(); } });

			this.el.hover(this.onMouseOver,this.onMouseOut,this);
		}
		catch(e){
			console.error(Globals.getError(e));
		}
	},

	onMouseOver: function(){
		this.up('window').down('note-carousel').getEl().addCls('hover');
		this.el.addCls('hover');
		this.updateLayout();
	},

	onMouseOut: function(){
		this.up('window').down('note-carousel').getEl().removeCls('hover');
		this.el.removeCls('hover');
		this.updateLayout();
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
		var suppressed, text, bodyText, sel, range, doc, start, end;

		try {
			if(this.record) {
				this.record.un('changed', this.recordChanged, this);
			}
		}
		catch(errorUnlistening){
			console.log(errorUnlistening.message);
		}

		this.record = r;

		try {
			if(this.record){
				this.record.on('changed', this.recordChanged, this, {single:true});
			}
		}
		catch(errorListening){
			console.error(errorListening.message);
		}

		if(!this.rendered || !r){return;}

		this.ownerCt.getEl().dom.scrollTop = 0;

		try {
			UserRepository.getUser(r.get('Creator'),this.fillInUser,this);
			this.time.update(r.getRelativeTimeString());

			UserRepository.getUser(r.get('sharedWith'),this.fillInShare,this);

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
				if(Ext.isGecko){
					text = range.toString();
					bodyText = range.commonAncestorContainer.ownerDocument.getElementById('NTIContent').textContent;
					start = bodyText.indexOf(text);
					end = start + text.length;
					start = Math.max(start - 50, 0);
					end += 50;

					//try to find word bounds:
					start = this.moveSubstringToWord(bodyText, start, true);
					end = this.moveSubstringToWord(bodyText, end, false);
					bodyText = Ext.String.trim(bodyText.substring(start, end));

					if (start){ bodyText = '[...] ' + bodyText;}
					if (end){ bodyText += ' [...]';}

					text = bodyText.replace(text, this.highlightTpl.apply([text]));
					text = this.replaceMathNodes(text, range.commonAncestorContainer);
				}
				else{
					text = range.toString();
					sel = doc.getSelection();
					sel.removeAllRanges();
					sel.addRange(range);
					Anchors.expandSelectionBy(sel, 50, true);
					Anchors.snapSelectionToWord(doc);
					range = sel.getRangeAt(0);
					bodyText = range.toString();
					sel.removeAllRanges();
					text = bodyText.replace(text, this.highlightTpl.apply([text]));
					text = this.replaceMathNodes(text, range.commonAncestorContainer);
					text = '[...] '+text+' [...]';
				}
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
				var search = this.up('window').getSearchTerm(), re;
				if(search){
					search = Ext.String.htmlEncode( search );
					re = new RegExp( RegExp.escape( search ), 'ig');
					text = text.replace(re,'<span class="search-term">'+search+'</span>');
				}

				this.text.update(text);
				this.text.select('a[href]',true).set({target:'_blank'});
			},this);
		}
		catch(e3){
			console.error(Globals.getError(e3));
		}
		if(this.editMode){
			this.onEdit();
		}

		this.up('window').down('note-responses').setReplies(this.record.children);
	},


	replaceMathNodes: function(rangeString, node){
		var maths = [], tempNode;
		Ext.each(Ext.dom.Query.select('div', node), function(div){
			if (Ext.fly(div).hasCls('math')) {
				tempNode = div.cloneNode(true);
				Anchors.purifyNode(tempNode);
				maths.push(tempNode);
			}
		});

		Ext.each(maths, function(m){
			if (rangeString.indexOf(m.textContent) >= 0) {
				rangeString = rangeString.replace(m.textContent, m.outerHTML);
			}
		});

		return rangeString;
	},


	recordChanged: Ext.Function.createBuffered( function(){ this.setRecord(this.record); }, 10),


	fillInUser: function(user){
		if(Ext.isArray(user)){user = user[0];}
		this.name.update(user.getName());
		TemplatesForNotes.updateMoreReplyOptionsLabels(this.more,user);
	},


	fillInShare: function(sharedWith){
		var val, names = [], custom = false;

		Ext.each(sharedWith,function(u){
			names.push(u.getName());
			if(!u.isGroup){
				custom = true;
			}
		});

		if(!custom){
			val = names.join(',');
		}
		else {
			val = 'Custom';
		}

		this.sharedTo.update(val);
		this.sharedTo.set({title:names.join(', ')});
	},

    scrollIntoView: function(){
        var scroller = this.ownerCt.getEl();
        if( this.replyBox ){
            this.replyBox.addCls('hover');
        }
        this.editor.scrollIntoView(scroller);
    },


	editorSaved: function(){
		var v = this.editorActions.getValue(),
			me = this,
			r = me.record;

		function callback(success, record){
			if (success) {
				me.deactivateReplyEditor();
			}
		}

		if(this.editMode){
			r.set('body',v.body);
			//todo: r.set('sharedWith',v.shareWith); -- only do this if the user changed it.
			r.save({callback: function(record, request){
				var success = request.success,
				rec = success ? record: null;
				if(success){r.fireEvent('changed');}
				Ext.callback(callback,me,[success,rec]);
			}});
			return;
		}

		this.up('window').fireEvent('save-new-reply', r, v.body, v.shareWith, callback);
	},


	activateReplyEditor: function(){
		var me = this;
		this.up('window').down('note-carousel').addCls('editor-active');
		me.el.addCls('editor-active');
		me.updateLayout();
        me.scrollIntoView();
		setTimeout(function(){me.editorActions.focus();}, 100);
	},

	deactivateReplyEditor: function(){
		this.text.show();
		this.editor.down('.content').update('');
		this.up('window').down('note-carousel').removeCls('editor-active');
		this.el.removeCls('editor-active');
		this.updateLayout();
		if(this.editMode){
			this.text.show();
		}
		delete this.editMode;
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


	onEdit: function(){
		this.text.hide();
		this.editMode = true;
		this.editorActions.editBody(this.record.get('body'));
		this.activateReplyEditor();
	},


	onShare: function(){
		this.up('window').fireEvent('share', this.record);
	},


	onFlag: function(){
		this.record.flag(this);
	},


	onDelete: function(){
		if( this.record && this.record.destroy){
			this.record.destroy();
		}
		this.up('window').close();
	},

	startChat: function() {
		this.up('window').fireEvent('chat', this.record);
	}

},
function(){
	this.prototype.renderTpl = Ext.DomHelper.markup([
			{
				cls: 'avatar', style: {display:'none'},
				cn:[{tag: 'img', src: Ext.BLANK_IMAGE_URL}]
			},
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
				},' ',{
					tag: 'span', cls: 'shared-to'
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
		]);
});
