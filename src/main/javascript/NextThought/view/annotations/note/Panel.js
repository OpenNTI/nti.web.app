Ext.define('NextThought.view.annotations.note.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.note-panel',

	requires: [
		'NextThought.layout.component.TemplatedContainer',
		'NextThought.cache.UserRepository',
		'NextThought.view.annotations.note.EditorActions',
		'NextThought.view.annotations.note.Templates'
	],

	ui: 'nt',
	cls: 'note-container',//note-reply-container
	layout: 'auto',
	componentLayout: 'templated-container',
	defaultType: 'note-panel',
	childEls: ['body'],
	getTargetEl: function () { return this.body; },


//	root: false,
	rootQuery: 'note-panel[root]',

	renderSelectors: {
		avatar: '.avatar img',
		noteBody: '.note',
		liked: '.meta .controls .like',
		favorites: '.meta .controls .favorite',
		favoritesSpacer: '.meta .controls .favorite-spacer',
		name: '.meta .name',
		time: '.time',
		text: '.body',
		sharedTo: '.shared-to',
		responseBox: '.respond',
		editor: '.respond .editor',
		replyOptions: '.respond .reply-options',
		replyButton: '.respond .reply',
		shareButton: '.respond .share',
		more: '.respond .reply-options .more'
	},


	onClassExtended: function(cls, data) {
		//merge with subclass's render selectors
		data.renderSelectors = Ext.applyIf(data.renderSelectors||{},cls.superclass.renderSelectors);
	},


	findWithRecordId: function(ntiid){
		var o = null;

		if(this.record && this.record.getId()===ntiid){return this;}

		this.items.each(function(c){
			o = c.findWithRecordId(ntiid);
			return !o;
		});

		return o;
	},


	initComponent: function(){
		this.wbData = {};
		this.addEvents('chat', 'share', 'save-new-reply','editorActivated','editorDeactivated');
		this.enableBubble('editorActivated', 'editorDeactivated');
		this.callParent(arguments);
		this.on('beforedestroy',this.onBeforeDestroyCheck,this);
	},


	onBeforeDestroyCheck: function(){
		if(this.editorActions.isActive()){
			this.setPlaceholderContent();
			return false;//stop the destroy
		}
		return true;//allow the destroy to continue
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);

		if(me.first){ me.noteBody.addCls('first'); }
		if(this.root){ me.noteBody.addCls('root'); }

		me.editorActions = new NoteEditorActions(me,me.editor);

		this.noteBody.hover(this.onMouseOver,this.onMouseOut,this);
		me.text.setVisibilityMode(Ext.dom.Element.DISPLAY);

		me.mon(me.editorActions,'droped-whiteboard',me.droppedWhiteboard,me);

		me.setRecord(me.record);

		if (me.record.placeholder) {
            me.setPlaceholderContent();
			return;
		}

		if (me.record.isFlagged()) {
			console.log('TODO - this is flagged, consider an indicator, or remove this log.');
		}

		if( $AppConfig.service.canShare() ){
			me.mon(me.replyButton,'click', me.activateReplyEditor, me);
			me.mon(me.shareButton,'click', me.onShare, me);
		}
		else{
			me.replyButton.remove();
			me.shareButton.remove();
		}

		me.mon(me.editor.down('.cancel'), 'click', me.deactivateReplyEditor, me);
		me.mon(me.editor.down('.save'), 'click', me.editorSaved, me);

		me.mon(me.editor.down('.content'),{
			scope: me,
			keypress: me.editorKeyPressed,
			keydown: me.editorKeyDown
		});

		me.mon(me.liked, 'click', function(){ me.record.like(me.liked); }, me);
		me.mon(me.favorites, 'click', function(){ me.record.favorite(me.favorites); },me);

		if(me.replyToId === me.record.getId()){
			me.activateReplyEditor();
		}
	},


	onMouseOver: function(){
		this.noteBody.addCls('hover');
	},


	onMouseOut: function(){
		this.noteBody.removeCls('hover');
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
        if( this.noteBody ){
            this.noteBody.addCls('hover');
        }
        this.responseBox.scrollIntoView(scroller);
    },


	droppedWhiteboard: function(guid){
		try {
			guid = guid.replace('-reply','');
			Ext.get(guid).down('.include').removeCls('checked');
		}
		catch(e){
			console.error('Whoops,..', e.message, e);
		}
	},


	editorSaved: function(){
		var v = this.editorActions.getValue(),
			me = this,
			r = me.record, re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g;

		function callback(success, record){
			me.editor.unmask();
			if (success) {
				me.deactivateReplyEditor();
				if (me.recordUpdated) {
					me.recordUpdated(r);
				}
                AnnotationUtils.updateHistory(record);
			}
		}

		function save(){
			//var currentShare = r.get('sharedWith')||[];
			if(me.editMode){
				r.set('body',v.body);
				//TODO: only do this if the user changed it. (figure out why the editor did not return the current value)
				//if(Ext.Array.intersect(currentShare, v.shareWith||[]).length !== currentShare.length){
				//	r.set('sharedWith',v.shareWith);
				//}

				r.save({callback: function(record, request){
					var success = request.success,
						rec = success ? request.records[0]: null;
					if(success){
						r.fireEvent('updated', rec);
						me.setRecord(rec);
					}
					Ext.callback(callback,me,[success,rec]);
				}});
				return;
			}

			try {
				me.fireEvent('save-new-reply', r, v.body, v.shareWith, callback);
			}
			catch(e){
				console.error(Globals.getError(e));
				//me.el.unmask();
				me.editor.unmask();
			}
		}

		if( !Ext.isArray(v.body) || v.body.join('').replace(re,'') === '' ){
			console.log('Dropping empty note body', v.body);
			me.deactivateReplyEditor();
			return;
		}
		me.editor.mask('Saving...');
		me.updateLayout();
		Ext.defer(save, 500);
	},


	updateToolState: function(){
		this.liked.set({'title':  this.record.isLiked() ? 'Liked' : 'Like'});
		if (this.record.isFlagged()){
			var flagItem = this.replyOptions.down('.flag');
			if(flagItem){
				flagItem.setHTML('Flagged');
			}
		}
	},


	//NOTE right now we are assuming the anchorable data won't change.
	//That is true in practice and it would be expensive to pull it everytime
	//some other part of this record is updated
	updateFromRecord: function(newRecord){
		var r = newRecord || this.record;

		try {
            UserRepository.getUser(r.get('Creator'),this.fillInUser,this);
		    UserRepository.getUser(r.get('sharedWith').slice(),this.fillInShare,this);
            this.time.update(r.getRelativeTimeString());
			this.noteBody.removeCls("deleted-reply");

			if(r.placeholder){
				this.setPlaceholderContent();
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
		//In case compiling the body content fails silently and doesn't call the callback,
		//blank us out so we don't ghost note bodies onto the wrong note.
		this.setContent('');
		r.compileBodyContent(this.setContent, this, this.generateClickHandler, 226 );

		this.updateToolState();
	},


	getRecord: function(){return this.record;},


	setRecord: function(r){
		//Remove the old listener
		if(this.record){
			this.mun(this.record, 'child-added', this.addNewChild, this);
			this.mun(this.record, 'destroy', this.wasDeleted, this);
            this.mun(this.record, 'changed', this.recordChanged, this);
            this.mun(this.record, 'updated', this.recordUpdated, this);
		}

		this.record = r;
		this.guid = IdCache.getIdentifier(r.getId());
		if(!this.rendered){return;}

		UserRepository.getUser(r.get('Creator'),this.fillInUser,this);

		//used by a controller in a component query
		this.recordIdHash = IdCache.getIdentifier(r.getId());

        try{
            this.updateFromRecord();
		}
		catch(e){
			console.error(Globals.getError(e));
			this.noteBody.remove(); //placeholder
		}

		if(this.editMode){
			this.onEdit();
		}

		Ext.suspendLayouts();
		this.removeAll(true);
		Ext.resumeLayouts(true);

		//Multiple containers/cmps involved here
		//So notice we do the bulkiest suspend resume
		//we can. Also getting this onto the next even pump
		//helps the app not seem like it is hanging
		Ext.defer(function(){
			Ext.suspendLayouts();
			if(!r.hasOwnProperty('parent')){
				this.loadReplies(r);
			}
			else {
				this.addReplies(r.children);
			}
			Ext.resumeLayouts(true);
		}, 1, this);


		this.updateToolState();
		this.mon(r, 'child-added', this.addNewChild, this);
        this.mon(r, {
	        single:true,
	        scope: this,
	        'changed': function(){ this.recordChanged(); },
            'updated': this.recordUpdated,
	        'destroy': this.wasDeleted
        });
	},


	loadReplies: function(record){
		var me = this, toMask = me.el.down('.note-replies');
		if(toMask){
			toMask.mask('Loading...');
		}
		console.group('Loading Replies');

		function setReplies(theStore){

			var items;

			console.log('Store load args', arguments);

			items = theStore.getItems();

			if(items.length === 1 && items[0].getId() === record.getId()){
				items = (items[0].children||[]).slice();
			}
			else {
				console.warn('There was an unexpected result from the reply store.');
			}

			console.log('Setting replies to ', items);

			record.children = items;
			Ext.each(items,function(i){
				i.parent = record;
			});

			//the store's count is the reply count.
			//update the count for next time the carousel renders
			record.set('ReferencedByCount',theStore.getCount());
			record.fireEvent('count-updated');

			me.addReplies(items);

			if(toMask){
				toMask.unmask();
			}
			if(me.hasCallback){
				Ext.callback(me.hasCallback);
				delete me.hasCallback;
			}
			console.groupEnd('Loading Replies');
		}

		record.getDescendants(setReplies);
	},


	maybeOpenReplyEditor: function(){
		var cmp;
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
    },


	setContent: function(text){
		var search = this.up('[getSearchTerm]'), re;
		if(search){ search = search.getSearchTerm(); }
		if(search){
			search = Ext.String.htmlEncode( search );
			re = new RegExp(['(\\>{0,1}[^\\<\\>]*?)(',RegExp.escape( search ),')([^\\<\\>]*?\\<{0,1})'].join(''), 'ig');
			text = text.replace(re,'$1<span class="search-term">$2</span>$3');
		}

		this.text.update(text);
		this.text.select('a[href]',true).set({target:'_blank'});


		Ext.each(this.text.query('.whiteboard-container'),
				function(wb){
					Ext.fly(wb).on('click', this.click, this);

					if(!$AppConfig.service.canShare()){
						Ext.fly(wb).select('.overlay').setStyle({bottom:0});
						Ext.fly(wb).select('.toolbar').remove();
					}
				},
				this);

	},


	generateClickHandler: function(id,data){ this.wbData[id] = data; },


	getRoot:function(){
		var cmp = this.is(this.rootQuery) ? this : this.up(this.rootQuery);
		if(!cmp){
			Ext.Error.raise('No root found');
		}
		return cmp;
	},


	editorActive: function(){
		return Boolean(this.getRoot().activeEditorOwner);
	},


	//Sets cmp as the component that contains the active editor
	setEditorActive: function(cmp){
		var active = Boolean(cmp),
			root = this.getRoot();
		console.log('Will mark Panel as having an ' + (active ? 'active' : 'inactive') + ' editor', cmp);
		if(root.editorActive() === active){
			console.warn('Panel already has an ' + (active ? 'active' : 'inactive') + ' editor. Unbalanced calls?', cmp);
			return;
		}
		delete root.activeEditorOwner;
		if(cmp){
			root.activeEditorOwner = cmp;
		}
		root.fireEvent(cmp ? 'editorActivated' : 'editorDeactivated', this);
	},


	//Checks to see if an editor is active for our root
	//and sets the active editor to be the one owned by the provided
	//cmp.  A cmp of null means the editor is no longer active
	checkAndMarkAsActive: function(cmp){
		var root = this.getRoot();
		if(!root.editorActive()){
			root.setEditorActive(cmp);
			return true;
		}
		return false;
	},


	deactivateEditor: function(){
		console.trace("Who called this?");
		this.deactivateReplyEditor.apply(this, arguments);
	},

	activateReplyEditor: function(e){
		var me = this;
		if(e){e.stopEvent();}

		if(me.noteBody && me.checkAndMarkAsActive(this)){
			me.replyToId = null;
			me.noteBody.addCls('editor-active');
			me.editorActions.activate();
			me.scrollIntoView();
			setTimeout(function(){me.editorActions.focus(true);}, 300);
			return true;
		}
		return false;
	},


	deactivateReplyEditor: function(){
		var root = this.getRoot();
		if(!root.editorActive()){
			return;
		}

		if(this.noteBody){
			this.noteBody.removeCls('editor-active');
			this.el.select('.whiteboard-container .checkbox').removeCls('checked');
			this.editorActions.deactivate();
			this.editorActions.setValue('');
		}
		if(this.editMode){
			this.text.show();
		}
		delete this.editMode;
		root.setEditorActive(null);
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


	canDelete: function(){
		var r = this.record;
		if(!r){
			return true;
		}

		return r.isModifiable();

// From Old Reply.js
//		return r.children === undefined || r.children.length === 0;

// From: Old Main.js
//		return !this.record || this.record.get('ReferencedByCount') === undefined
//              || this.record.get('ReferencedByCount') === 0;
	},


	addNewChild: function(child){
		if(child.get('inReplyTo') === this.record.getId()){
			this.addReplies([child]);
			if (!this.record.children){this.record.children = [];}
			this.record.children.push(child);
			child.parent = this.record;
			this.adjustRootsReferenceCount(child);
		}
		else {
			console.log('[reply] ignoring, child does not directly belong to this item:\n',
					this.record.getId(), '\n', child.get('inReplyTo'), ' <- new child');
		}
	},


	onBeforeAdd: function(cmp){
		this.callParent(arguments);
		cmp.addCls('child');
		//decide if it is the first in this container's list:
		if (this.items.getCount() === 0) {
			cmp.first = true;
		}
	},


	addReplies: function(records){
		var toAdd = [], recordCollection;

		//Shortcircuit
		if(Ext.isEmpty(records)){
			return;
		}

		recordCollection = new Ext.util.MixedCollection();
		recordCollection.addAll(records || []);

		recordCollection.sort({
			property: 'CreatedTime',
			direction: 'ASC',
			transform: Ext.data.SortTypes.asDate,
			root: 'data'
		});
		recordCollection.each(function(record){

			var guid = IdCache.getComponentId(record, null, 'reply'),
				add = true;

			if (record.getModelName() !== 'Note') {
				console.warn('can not add item, it is not a note and I am not prepared to handle that.');
				add=false;
			}
			else if (Ext.getCmp(guid)) {
				console.log('already showing this reply');
				add=false;
			}

			if(add){
				toAdd.push({record: record, id: guid});
			}
		});
		console.log('Adding note records', toAdd);

		//multiple components/containers involved here so
		//we batch them for the entire fwk
		Ext.batchLayouts(function(){
			this.add(toAdd);
		}, this);

		Ext.defer(this.maybeOpenReplyEditor, 1, this);
	},


	adjustRootsReferenceCount: function(r){
        var root = r.parent,
	        rootCmp = this.getRoot();

		while(root && root.parent){root = root.parent;}

		if(root){
			setTimeout(function(){
				/**
				 *  FIXME: for now we're counting the number of reply components to set the replyCount.
				 *  Obviously this will break once we start paging replies,
				 *  since we won't be displaying all replies at once.
				 **/
				var c = Ext.util.MixedCollection.create();
				c.addAll(Ext.Array.pluck(rootCmp.query('note-panel'),'record'));

				c = c.filter('placeholder','undefined');

				root.set({ReferencedByCount: c.getCount()});
				root.fireEvent('count-updated');
			},500);
		}
	},


	onEdit: function(){
		this.text.hide();
		this.editMode = true;
		this.editorActions.editBody(this.record.get('body'));
		this.activateReplyEditor();
	},


	onRemove: function(cmp){
		var c = this.items.getCount();
		console.log('removed child, it was deleting: ',cmp.deleting);
		if(c === 0 && (!this.record || this.record.placeholder)){
			this.deleting = Boolean(cmp.deleting);
			this.destroy();
		}
	},


	onDelete: function(){
		this.record.destroy();
		this.adjustRootsReferenceCount(this.record);
	},


	wasDeleted: function(){
		console.log('Deleting panel from record destroy, marking deleteing=true');
		this.deleting = true;
		this.destroy();
	},


	setPlaceholderContent: function() {
		var me = this,
			e = me.editor || {down:Ext.emptyFn},
			cancel = e.down('.cancel'),
			save = e.down('.save');

		me.time.update("This message has been deleted");
		me.noteBody.addCls("deleted-reply");

		if(me.editorActions.isActive()){
			me.editorActions.disable();

			me.mun(save, 'click', me.editorSaved, me);
			me.mon(cancel,'click', function(){
				me.deactivateReplyEditor();
				//if we didn't get a placeholder, then just let this leaf go
				if(!me.record.placeholder){
					me.destroy();
				}
			});
		}
	},


	onChat: function() { this.fireEvent('chat', this.record); },


	onFlag: function() { this.record.flag(this); },


	click: function(e){
		var t = e.getTarget('.whiteboard-container', null, true), guid;
		if(!t){ return;}

		guid = t.up('.body-divider').getAttribute('id');
		if(t && this.wbData[guid]){
			t = e.getTarget('.reply',null,true);
			if(t){
				t.up('.toolbar').down('.include').addCls('checked');
				this.activateReplyEditor();
				this.editorActions.addWhiteboard(Ext.clone(this.wbData[guid]),guid+'-reply');
			}
			else {
				t = e.getTarget('.include',null,true);
				if(t){
					t[t.hasCls('checked') ?'removeCls':'addCls']('checked');
					if(t.hasCls('checked')){
						this.editorActions.addWhiteboard(Ext.clone(this.wbData[guid]),guid+'-reply');
					}
					else {
						this.editorActions.removeWhiteboard(guid+'-reply');
					}
				}
				else {
					Ext.widget('wb-window',{ width: 802, value: this.wbData[guid], readonly: true}).show();
				}
			}
		}
	},


	onShare: function(){
		this.fireEvent('share', this.record);
	}


},function(){
	var proto = this.prototype;

	proto.recordUpdated = proto.recordChanged = proto.updateFromRecord;
//	proto.recordUpdated = proto.recordChanged = Ext.Function.createBuffered(proto.updateFromRecord, 100,null,null);

	proto.renderTpl = Ext.DomHelper.markup([{
		//cls: 'note-reply',
		cls: 'note',
		cn: [{
			cls: 'avatar',
			cn:[{tag: 'img', src: Ext.BLANK_IMAGE_URL}]
		},
			{
				cls: 'meta',
				cn: [{
					cls: 'controls',
					cn: [
						{ cls: 'favorite-spacer' },
						{ cls: 'favorite' },
						{ cls: 'like' }
					]
				},{
					tag: 'span',
					cls: 'name'
				},{ cls: 'shared-to' }]
			},{ cls: 'body' },{
				cls: 'respond',
				cn: [
					TemplatesForNotes.getReplyOptions(),
					{ tag: 'span', cls: 'time' },
					TemplatesForNotes.getEditorTpl()
				]
			}]
	},{
		id: '{id}-body',
		cls: 'note-replies',
		tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}')
	}]);
});
