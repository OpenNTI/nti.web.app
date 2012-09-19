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
		avatar: 'img.avatar',
        canvas: 'canvas',
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
		shareButton: '.respond .share',
		more: '.respond .reply-options .more'
	},


	initComponent: function(){
		this.readOnlyWBsData = {};
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

			if( $AppConfig.service.canShare() ){
				me.mon(me.replyButton,{ scope: me, click: me.activateReplyEditor });
				me.mon(me.shareButton,{ scope: me, click: me.onShare });
			}
			else{
				me.replyButton.remove();
				me.shareButton.remove();
			}

			me.mon(me.editor.down('.cancel'),{ scope: me, click: me.deactivateReplyEditor });
			me.mon(me.editor.down('.save'),{ scope: me, click: me.editorSaved });

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

			this.mon(this.up('window'), 'editorDeactivated', function(w){
				var bRecord = me.bufferedRecord;
				if(bRecord){
					console.log('Setting buffered record');
					me.bufferedRecord = null;
					me.setRecord(bRecord);
				}
			});
		}
		catch(e){
			console.error(Globals.getError(e));
		}
	},

	click: function(e){
		var t = e.getTarget('img.whiteboard-thumbnail'), guid = t.parentNode.getAttribute('id');
		console.log(guid);
		if(t && this.readOnlyWBsData[guid]){
			var w = Ext.widget({ xtype: 'wb-window', height: '75%', width: '50%', value: this.readOnlyWBsData[guid], readonly: true});
			w.show();
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
		var suppressed, text, bodyText, sel, range, doc, start, end, likeTooltip, favoriteTooltip, objectInnerText, obj, me = this;

		//If we have an editor active for god sake don't blast it away
		if(this.up('window').editorActive()){
			console.log('Need to buffer set record', r);
			this.bufferedRecord = r;
			return;
		}

		try {
			if(this.record) {
				this.record.un('changed', this.recordChanged, this);
				this.record.un('updated', this.recordChanged, this);
				this.mun(this.record,'child-added',this.addNewChild,this);
			}
		}
		catch(errorUnlistening){
			console.log(errorUnlistening.message);
		}

		this.record = r;

		try {
			if(this.record){
				this.record.on('changed', this.recordChanged, this, {single:true});
				this.record.on('updated', this.recordChanged, this, {single:true});
				this.mon(this.record,'child-added',this.addNewChild,this);
			}
		}
		catch(errorListening){
			console.error(errorListening.message);
		}

		if(!this.rendered || !r){
			if(!r && this.up('window').getSearchTerm() !== ""){
				this.el.hide();
				this.up('window').down('note-responses').hide();
			}
			return;
		}
		if(r && !this.getEl().isVisible()){
			this.el.show();
			this.up('window').down('note-responses').show();
		}

		this.deactivateReplyEditor();
		this.ownerCt.getEl().dom.scrollTop = 0;

		try {
			UserRepository.getUser(r.get('Creator'),this.fillInUser,this);
			this.time.update(r.getRelativeTimeString());

			UserRepository.getUser(r.get('sharedWith'),this.fillInShare,this);

			this.liked.update(r.getFriendlyLikeCount());
			this.liked[(r.isLiked()?'add':'remove')+'Cls']('on');
			this.favorites[(r.isFavorited()?'add':'remove')+'Cls']('on');

			likeTooltip = r.isLiked() ? 'Liked' : 'Like';
			favoriteTooltip = r.isFavorited() ? 'Bookmarked' : 'Add to bookmarks';
			this.liked.set({'title': likeTooltip});
			this.favorites.set({'title': favoriteTooltip});
		}
		catch(e1){
			console.error(Globals.getError(e1));
		}

		try {
			suppressed = r.get('style') === 'suppressed';
			doc = ReaderPanel.get(this.prefix).getDocumentElement();
			range = Anchors.toDomRange(r.get('applicableRange'),doc);
			if(range){
                this.context.setHTML('');
                this.context.insertFirst(RangeUtils.expandRange(range, doc));
                if (!this.context.first().is('div')){
                    this.context.insertHtml('afterBegin', '[...] ');
                    this.context.insertHtml('beforeEnd', ' [...]');
                }
				this.context.select('a[href]',true).set({target:'_blank'});
                Ext.each(this.context.query('.application-highlight'), function(h){
                    if(this.record.isModifiable()){
                        Ext.fly(h).addCls('highlight-mouse-over');
                    }
                }, this);
                //for now, don't draw the stupid canvas...
                //this.canvas.width = Ext.fly(this.canvas).getWidth();
                //this.canvas.height = Ext.fly(this.canvas).getHeight();
                //AnnotationUtils.drawCanvas(this.canvas, this.context, range,
                //    this.context.down('.application-highlight').getStyle('background-color'), [-20, 30]);
			}

			if (Ext.isGecko || Ext.isIE9) { this.resizeMathJax(this.context); }

		}
		catch(e2){
			console.error(Globals.getError(e2));
		}

		r.compileBodyContent(this.setContent, this, this.generateClickHandler, 226 );

		if(this.editMode){
			this.onEdit();
		}

		if(this.isReply){
			this.activateReplyEditor();
		}


		me.up('window').down('note-responses').removeAll(true);
		this.loadReplies(r);
	},


	setContent: function(text){
		var search = this.up('window').getSearchTerm(), re;
		if(search){
			search = Ext.String.htmlEncode( search );
			re = new RegExp(['(\\>{0,1}[^\\<\\>]*?)(',RegExp.escape( search ),')([^\\<\\>]*?\\<{0,1})'].join(''), 'ig');
			text = text.replace(re,'$1<span class="search-term">$2</span>$3');
		}

		this.text.update(text);
		this.text.select('a[href]',true).set({target:'_blank'});

		Ext.each(this.text.query('.whiteboard-thumbnail'),
				function(wb){ Ext.fly(wb).on('click', this.click, this); },
				this);

		this.updateLayout();
	},

	generateClickHandler: function(id,data){
		this.readOnlyWBsData[id] = data;
		console.log("whiteboard id: ", id);
	},


	loadReplies: function(record){
		var me = this,
			store = NextThought.store.PageItem.create(),
			responses = me.up('window').down('note-responses');

		me.mask();

		function setReplies(){
			responses.setReplies(store.getItems());
			me.unmask();
		}

		store.proxy.url = record.getLink('replies');
		store.on('load', setReplies, me, { single: true });
		store.load({});
	},


	addNewChild: function(child){
		this.up('window').down('note-responses').addReplies([child]);
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


	resizeMathJax: function(node) {
		var e = Ext.select('div.equation .mi').add(Ext.select('div.equation .mn')).add(Ext.select('div.equation .mo'));
		e.setStyle('font-size','13px');
	},


	recordChanged: Ext.Function.createBuffered( function(){ this.setRecord(this.record); }, 10),


	fillInUser: function(user){
		this.name.update(user.getName());
		this.avatar.setStyle({backgroundImage: 'url('+user.get('avatarURL')+')'});
		TemplatesForNotes.updateMoreReplyOptionsLabels(this.more, user, this.record.isFlagged());
	},


	fillInShare: function(sharedWith){
		var val, names = [], others;

		this.responseBox[sharedWith.length===0?'removeCls':'addCls']('shared');

		Ext.each(sharedWith,function(u){
			names.push(u.getName());
			return names.join(',').length <= 150;
		});

		others = sharedWith.length - names.length;
		if(others){
			names.push(Ext.String.format('and {0} others.',others));
		}
		else if(names.length > 1){
			names.push(' and '+names.pop());
		}

		val = names.length? ('Shared with '+names.join(', ')) : '';

		this.sharedTo.update(val);
		this.sharedTo.set({title:val});
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
			r = me.record, re = /\w|(&nbsp;)|(<br>)|(<div>)|(<\/div>)*/g;

		function callback(success, record){
			me.el.unmask();
			if (success) {
				me.setRecord(r);
				me.deactivateReplyEditor();
			}
		}

		if( !Ext.isArray(v.body) || v.body.join('').replace(re,"") === "" ){
			me.deactivateReplyEditor();
			return;
		}
		me.el.mask('Saving...');

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

		if(!this.up('window').checkAndMarkAsActive()){
			return;
		}
		this.isReply = false;
		var me = this;
		this.up('window').down('note-carousel').addCls('editor-active');
		me.el.addCls('editor-active');
		me.editorActions.activate();
		me.updateLayout();
        me.scrollIntoView();
		setTimeout(function(){me.editorActions.focus();}, 100);
	},


	deactivateReplyEditor: function(){
		var myWindow = this.up('window');
		if(!myWindow.editorActive()){
			return;
		}

		this.text.show();
		this.editor.down('.content').update('');
		this.up('window').down('note-carousel').removeCls('editor-active');
		this.editorActions.deactivate();
		this.el.removeCls('editor-active');
		this.updateLayout();
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


	onChat: function() {
		this.up('window').fireEvent('chat', this.record);
		return;
	}

},
function(){
	this.prototype.renderTpl = Ext.DomHelper.markup([
		{
			cls: 'avatar',
			tag: 'img', src: Ext.BLANK_IMAGE_URL
		},
		{
			cls: 'meta',
			cn: [
				{ cls: 'controls', cn: [{ cls: 'favorite' },{ cls: 'like' }] },
				{ tag: 'span', cls: 'name' },{ tag: 'span', cls: 'time' },
				{ cls: 'shared-to' }
			]
		},
		{ cls: 'clear' },
		{ cls: 'context', cn: [
            {tag: 'canvas'},
            {tag: 'span', cls: 'text'}]
        },
		{ cls: 'body' },

		{
			cls: 'respond',
			cn: [
				TemplatesForNotes.getReplyOptions(),
				TemplatesForNotes.getEditorTpl()
			]
		}
	]);
});
