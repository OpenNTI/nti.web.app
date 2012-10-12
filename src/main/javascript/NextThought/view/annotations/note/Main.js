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
            me.editorActions = new NoteEditorActions(me,me.editor);
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

			this.el.hover(this.onMouseOver,this.onMouseOut,this);

			this.mon(this.up('window'), 'editorDeactivated', function(w){
				var bRecord = me.bufferedRecord;
				if(bRecord){
					console.log('Setting buffered record');
					me.bufferedRecord = null;
					me.setRecord(bRecord);
				}
			});

			if(this.editorActions && this.replyToId === this.record.getId()){
				this.activateReplyEditor();
			}

		}
		catch(e){
			console.error(Globals.getError(e));
		}
	},

	click: function(e){
		var t = e.getTarget('img.whiteboard-thumbnail'), guid = t.parentNode.getAttribute('id');
		console.log(guid);
		if(t && this.readOnlyWBsData[guid]){
			Ext.widget('wb-window',{height: '75%', width: '50%', value: this.readOnlyWBsData[guid], readonly: true}).show();
		}
	},

	onMouseOver: function(){
		this.up('window').down('note-carousel').getEl().addCls('hover');
		this.el.addCls('hover');
	},


	onMouseOut: function(){
		this.up('window').down('note-carousel').getEl().removeCls('hover');
		this.el.removeCls('hover');
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

	//NOTE right now we are assuming the anchorable data won't change.
	//That is true in practice and it would be expensive to pull it everytime
	//some other part of this record is updated
	updateFromRecord: function(){
		var r = this.record;

		try {
            UserRepository.getUser(r.get('Creator'),this.fillInUser,this);
            this.time.update(r.getRelativeTimeString());

            if (this.fillInShare){
			    UserRepository.getUser(r.get('sharedWith').slice(),this.fillInShare,this);
            }

            if (this.liked){
                this.liked.update(r.getFriendlyLikeCount());
                this.liked[(r.isLiked()?'add':'remove')+'Cls']('on');
                this.liked.set({'title': r.isLiked() ? 'Liked' : 'Like'});
            }

            if(this.favorites){
	            this.favorites[(r.isFavorited()?'add':'remove')+'Cls']('on');
	            this.favorites.set({'title': r.isFavorited() ? 'Bookmarked' : 'Add to bookmarks'});
            }
		}
		catch(e1){
			console.error(Globals.getError(e1));
		}

		r.compileBodyContent(this.setContent, this, this.generateClickHandler, 226 );
	},

	setRecord: function(r){
		var suppressed, context;

		//If we have an editor active for god sake don't blast it away
		if(this.up('window').editorActive()){
			console.log('Need to buffer set record', r);
			this.bufferedRecord = r;
			return;
		}

		try {
			if(this.record) {
				this.record.un('changed', this.recordChanged, this);
				this.record.un('updated', this.recordUpdated, this);
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
				this.record.on('updated', this.recordUpdated, this, {single:true});
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
			this.context.setHTML('');
			suppressed = r.get('style') === 'suppressed';
			doc = ReaderPanel.get(this.prefix).getDocumentElement();
			range = Anchors.toDomRange(r.get('applicableRange'), doc, r.get('ContainerId'));
			if(range){
                this.context.insertFirst(RangeUtils.expandRange(range, doc));
                context = this.context.first();
                if (!context || !context.is('div')){ //context may be null if child is a text node
                    this.context.insertHtml('afterBegin', '[...] ');
                    this.context.insertHtml('beforeEnd', ' [...]');
                }
				this.context.select('.injected-related-items,.related,iframe,object').remove();
				this.context.select('a[href]').set({target:'_blank'});
				this.context.select('a[href^=tag]').set({href:undefined,target:undefined});
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

		this.updateFromRecord();

		if(this.editMode){
			this.onEdit();
		}

		if(this.editorActions && this.replyToId === this.record.getId()){
			 this.activateReplyEditor();
		}

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

	},

	generateClickHandler: function(id,data){
		this.readOnlyWBsData[id] = data;
		console.log("whiteboard id: ", id);
	},


	loadReplies: function(record){
		var me = this,
			store = NextThought.store.PageItem.create(),
			responses = me.up('window').down('note-responses');
		me.up('window').down('note-responses').removeAll(true);
		console.log('loading replies');
		me.mask();


		function setReplies(theStore){
			var cmp, items = theStore.getItems();
			console.log('Store load args', arguments);
			console.log('Setting replies to ', items);
			record.set('ReferencedByCount',theStore.getCount());//update the count for next time the carousel renders
			record.fireEvent('count-updated');
			responses.setReplies(items);

			function maybeOpenReplyEditor(){
                if(this.replyToId){
                    cmp = Ext.getCmp(IdCache.getComponentId(this.replyToId, null, 'reply'));
                    if(cmp){
                        cmp.activateReplyEditor();
                        delete this.replyToId;
                    }
                }
                else if(this.scrollToId) {
                    cmp = Ext.getCmp(IdCache.getComponentId(this.scrollToId, null, 'reply'));
                    if(cmp){
                        cmp.scrollIntoView();
                        delete this.scrollToId;
                    }
                }
            }

            Ext.defer(maybeOpenReplyEditor, 1, this);

			me.unmask();
			if(me.hasCallback){
				Ext.callback(me.hasCallback);
				delete me.hasCallback;
			}
		}

		store.proxy.url = record.getLink('replies');
        if (!store.proxy.url){
            //me.unmask();
            console.error('I think we are showing a deleted note.');
            return;
        }
		store.on('load', setReplies, me, { single: true });
		store.load({});
	},


	addNewChild: function(child){
		console.log('Adding new child', child);
		var r = this.record, c = 'ReferencedByCount';

		if(child.get('inReplyTo') === r.getId()){

			//update the count for next time the carousel renders (and to make share dialog readonly)
			r.set(c, (r.get(c)||0)+1);

			this.up('window').down('note-responses').addReplies([child]);
		}
		else {
			console.log('[top] ignoring, child does not directly belong to this item:\n', r.getId(), '\n', child.get('inReplyTo'), ' <- new child');
		}
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


	fillInUser: function(user){
		this.name.update(user.getName());
		this.avatar.setStyle({backgroundImage: 'url('+user.get('avatarURL')+')'});
		//NOTE: this is probably not the best place where to set the more options menu.
		TemplatesForNotes.attachMoreReplyOptionsHandler(this, this.more, user, this.record);
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
        var scroller = this.el.up('.note-content-container.scrollbody');
        if( this.replyBox ){
            this.replyBox.addCls('hover');
        }
        this.responseBox.scrollIntoView(scroller);
    },


	editorSaved: function(){
		var v = this.editorActions.getValue(),
			me = this,
			r = me.record, re = /(&nbsp;)|(<br>)|(<div>)|(<\/div>)*/g;

		function callback(success, record){
			me.el.unmask();
			if (success) {
					me.deactivateReplyEditor();
				if (me.recordUpdated) {
					me.recordUpdated(r);
				}
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
				if(success){
					r.fireEvent('changed');
				}
				Ext.callback(callback,me,[success,rec]);
			}});
			return;
		}

        try {
		    this.up('window').fireEvent('save-new-reply', r, v.body, v.shareWith, callback);
        }
        catch(e){
            me.el.unmask();
        }
	},


	activateReplyEditor: function(){

		if(!this.up('window').checkAndMarkAsActive()){
			return;
		}
		this.replyToId = null;
		var me = this;
		this.up('window').down('note-carousel').addCls('editor-active');
		me.el.addCls('editor-active');
		me.editorActions.activate();
        me.scrollIntoView();
		setTimeout(function(){me.editorActions.focus(true);}, 300);
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
    var p = this.prototype,
        ufr = p.updateFromRecord;
    Ext.apply(p, {
        recordChanged: Ext.Function.createBuffered(ufr, 100),
        recordUpdated: Ext.Function.createBuffered(ufr, 100)
    });
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
