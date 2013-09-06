Ext.define('NextThought.view.annotations.note.Panel', {
	extend: 'Ext.container.Container',
	alias: 'widget.note-panel',

	requires: [
		'NextThought.cache.UserRepository',
		'NextThought.view.annotations.note.Templates',
		'NextThought.layout.component.Natural'
	],

	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks',
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		flagActions: 'NextThought.mixins.FlagActions'
	},

	enableTitle: false,

	ui: 'nt',
	cls: 'note-container scrollable',
	componentLayout: 'natural',
	layout: 'auto',
	defaultType: 'note-panel',
	childEls: ['body'],
	getTargetEl: function () {
		return this.body;
	},
	autoFillInReplies: true,

	rootQuery: 'note-panel[root]',

	renderTpl: Ext.DomHelper.markup([
		{
			//cls: 'note-reply',
			cls: 'note',
			cn: [
				{
					cls: 'avatar',
					cn: [
						{tag: 'img', src: Ext.BLANK_IMAGE_URL}
					]
				},
				{
					cls: 'meta',
					cn: [
						{
							cls: 'controls',
							cn: [
								{ cls: 'favorite-spacer' },
								{ cls: 'favorite' },
								{ cls: 'like' }
							]
						},
						{ cls: 'title'
						},
						{ tag: 'span', cls: 'name'
						},
						{ cls: 'shared-to' }
					]
				},
				{ cls: 'body' },
				{
					cls: 'respond',
					cn: [
						{
							cls: 'reply-options',
							cn: [
								{ cls: 'reply', html: 'Reply' },
								{ cls: 'share', html: 'Share' },
								{ cls: 'more', 'data-qtip': 'Options', html: '&nbsp;'}
							]
						},
						{ tag: 'span', cls: 'time' }
					]
				}
			]
		},
		{
			id: '{id}-body',
			cls: 'note-replies',
			cn: ['{%this.renderContainer(out,values)%}']
		}
	]),

	renderSelectors: {
		avatar: '.avatar img',
		noteBody: '.note',
		liked: '.meta .controls .like',
		favorites: '.meta .controls .favorite',
		favoritesSpacer: '.meta .controls .favorite-spacer',
		title: '.meta .title',
		name: '.meta .name',
		time: '.time',
		text: '.body',
		canvas: '.context canvas',
		context: '.context .text',
		sharedTo: '.shared-to',
		responseBox: '.respond',
		replyOptions: '.respond .reply-options',
		replyButton: '.respond .reply',
		shareButton: '.respond .share',
		more: '.respond .reply-options .more'
	},


	onClassExtended: function (cls, data, hooks) {
		var onBeforeClassCreated = hooks.onBeforeCreated;

		//merge with subclass's render selectors
		data.renderSelectors = Ext.applyIf(data.renderSelectors || {}, cls.superclass.renderSelectors);
		if (data.cls) {
			data.cls = [cls.superclass.cls, data.cls].join(' ');
		}

		hooks.onBeforeCreated = function (cls, data) {
			if (data.cls) {
				data.cls = [cls.superclass.cls, data.cls].join(' ');
			}
			onBeforeClassCreated.call(this, cls, data, hooks);
		};
	},


	findWithRecordId: function (ntiid) {
		var o = null;

		if (this.record && this.record.getId() === ntiid) {
			return this;
		}

		this.items.each(function (c) {
			o = c.findWithRecordId(ntiid);
			return !o;
		});

		return o;
	},


	initComponent: function () {
		this.wbData = {};
		this.addEvents('chat', 'share', 'save-new-reply', 'editorActivated', 'editorDeactivated');
		this.enableBubble('editorActivated', 'editorDeactivated');
		this.callParent(arguments);
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		this.mixins.flagActions.constructor.call(this);
		this.on('beforedestroy', this.onBeforeDestroyCheck, this);
	},

	replyIdPrefix: function () {
		return [this.xtype, 'reply'].join('-');
	},


	onBeforeDestroyCheck: function () {
		if (this.editor && this.editor.isActive()) {
			this.setPlaceholderContent();
			return false;//stop the destroy
		}
		return true;//allow the destroy to continue
	},


	afterRender: function () {
		var me = this;
		me.callParent(arguments);

		if (me.first) {
			me.noteBody.addCls('first');
		}
		if (this.root) {
			me.noteBody.addCls('root');
		}

		this.createEditor();
		me.editorEl = me.editor.getEl();

		this.noteBody.hover(this.onMouseOver, this.onMouseOut, this);
		me.text.setVisibilityMode(Ext.dom.Element.DISPLAY);

		me.mon(me.editor, 'droped-whiteboard', me.droppedWhiteboard, me);

		me.setRecord(me.record);

		this.on('scroll', function (e) {
			Ext.emptyFn();
		});

		me.noteBody.on('scroll', function (e) {
			Ext.emptyFn();
		});

		if (me.record.placeholder) {
			//me.setPlaceholderContent();
			//just return, setPlaceholderContent is called from updateFromRecord, which is called by setRecord
			return;
		}

		if (this.record) {
			me.enableProfileClicks(me.name, me.avatar);
		}

		if (me.record.isFlagged()) {
			console.log('TODO - this is flagged, consider an indicator, or remove this log.');
		}

		if ($AppConfig.service.canShare()) {
			me.mon(me.replyButton, 'click', me.onReply, me);
			if (me.shareButton) {
				me.mon(me.shareButton, 'click', me.onShare, me);
			}
		}
		else {
			me.replyButton.remove();
			if (me.shareButton) {
				me.shareButton.remove();
			}
		}

		me.mon(me.editorEl.down('.cancel'), 'click', me.deactivateReplyEditor, me);
		me.mon(me.editorEl.down('.save'), 'click', me.editorSaved, me);

		me.mon(me.editorEl.down('.content'), {
			scope: me,
			keypress: me.editorKeyPressed,
			keydown: me.editorKeyDown
		});

		if (me.title) {
			me.mon(me.title, 'click', function (e) {
				var a = e.getTarget('a[href]');

				if (a) {
					e.stopEvent();
					me.fireEvent('navigate-to-href', me, a.href);
				}
			}, this);
		}

		if (this.editorEl.down('.title')) {
			this.editorEl.down('.title').setVisibilityMode(Ext.dom.Element.DISPLAY);
		}

		if (me.replyToId === me.record.getId()) {
			me.onReply();
		}
	},


	createEditor: function () {
		//TODO: clean this up! We should be relying on the editor's events, not digging into its dom.
		this.editor = Ext.widget({xtype: 'nti-editor', ownerCt: this, renderTo: this.responseBox, enableTitle: this.enableTitle});
	},


	disable: function () {
		var me = this,
			e = me.editorEl || {down: Ext.emptyFn},
			cancel = e.down('.cancel'),
			save = e.down('.save');

		me.replyOptions.remove();

		console.debug('disabling ' + me.record.getId() + ', Body: ' + me.text.getHTML());

		if (me.editor && me.editor.isActive()) {
			me.editor.disable();

			me.mun(save, 'click', me.editorSaved, me);
			me.mon(cancel, 'click', function () {
				me.deactivateReplyEditor();
				//if we didn't get a placeholder, then just let this leaf go
				if (!me.record.placeholder) {
					me.destroy();
				}
			});
		}
	},


	onMouseOver: function () {
		this.noteBody.addCls('hover');
	},


	onMouseOut: function () {
		this.noteBody.removeCls('hover');
	},


	fillInTitle: function () {
		var me = this;

		function callback(snip, value) {
			if (snip && snip !== value) {
				me.title.set({'data-qtip': value});
			}
			me.title.update(snip);
		}

		this.record.resolveNoteTitle(callback, 46);
	},


	fillInUser: function (user) {
		var HOST = Globals.HOST_PREFIX_PATTERN,
			avatarURL = user.get('avatarURL'),
			currentURL = this.avatar.getStyle('background-image').slice(4, -1), a, b, d;

		if(avatarURL && avatarURL.indexOf('//') === 0){
			avatarURL = location.protocol + avatarURL;
		}

		a = HOST.exec(avatarURL);
		b = HOST.exec(currentURL);
		d = HOST.exec(location)[0];//default host

		a = (a && a[0]) || d;
		b = (b && b[0]) || d;

		currentURL = currentURL.replace(HOST, '') === avatarURL.replace(HOST, '');

		this.userObject = user;
		this.name.update(user.getName());

		if (!currentURL || a !== b) {
			this.avatar.setStyle({backgroundImage: 'url(' + avatarURL + ')'});
		}
		//NOTE: this is probably not the best place where to set the more options menu.
		TemplatesForNotes.attachMoreReplyOptionsHandler(this, this.more, user, this.record);
	},


	fillInShare: function (sharedWith) {
		var val, names = [], others,
			tpl = Ext.DomHelper.createTemplate({tag: 'name', 'data-profile-idx': '{1}', html: '{0}'});

		this.responseBox[(sharedWith|| []).length === 0 ? 'removeCls' : 'addCls']('shared');
		if(Ext.isEmpty(sharedWith)){  return; }

		SharingUtils.getLongSharingDisplayText(sharedWith, function (str) {
			this.sharedTo.update(str);
			this.sharedTo.set({'data-qtip': str});

			this.sharedTo.select('name[data-profile-idx]').on('click', function (e) {
				var a = e.getTarget('name'),
					i = a && a.getAttribute('data-profile-idx'),
					u = a && sharedWith[i];

				e.stopEvent();
				if (a && !Ext.isEmpty(i) && u && u.getProfileUrl) {
					this.fireEvent('show-profile', u);
				}
			}, this);
		}, this, tpl, 150);
	},


	scrollIntoView: function () {
		var scroller = this.el.up('.note-content-container.scrollbody');
		if (this.noteBody) {
			this.noteBody.addCls('hover');
		}
		this.responseBox.scrollIntoView(scroller);
	},


	droppedWhiteboard: function (guid) {
		try {
			guid = guid.replace('-reply', '');
			Ext.get(guid).down('.include').removeCls('checked');
		}
		catch (e) {
			console.error('Whoops,..', e.message, e);
		}
	},


	editorSaved: function () {
		var v = this.editor.getValue(),
			me = this,
			r = me.record, re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g;

		function callback(success, record) {
			if (me.isDestroyed) {
				return;
			}
			me.editor.unmask();
			if (success) {
				me.deactivateReplyEditor();
				if (me.recordUpdated) {
					me.recordUpdated(r);
				}
				AnnotationUtils.updateHistory(record);
			}
		}

		function save() {
			//var currentShare = r.get('sharedWith')||[];
			if (me.editMode) {
				r.set('body', v.body);
				r.set('title', v.title);

				r.save({callback: function (record, request) {
					var success = request.success,
						rec = success ? request.records[0] : null;
					if (success) {
						r.fireEvent('updated', rec);
						me.setRecord(rec);
					}
					Ext.callback(callback, me, [success, rec]);
				}});
				return;
			}

			try {
				me.fireEvent('save-new-reply', r, v.body, [], callback);
			}
			catch (e) {
				console.error(Globals.getError(e));
				//me.el.unmask();
				me.editorEl.unmask();
			}
		}

		if (!Ext.isArray(v.body) || v.body.join('').replace(re, '') === '') {
			console.warn("Note's body is required");
			me.editor.markError(me.editorEl.down('.content'), 'Please enter text before you save');
			return;
		}
		me.editorEl.mask('Saving...');
		me.updateLayout();
		Ext.defer(save, 1);
	},


	updateToolState: function () {
		this.reflectLikeAndFavorite(this.record);
		this.reflectFlagged(this.record);
	},

	// In the future, we will want fieldName to be an array of all the fields that changed.
	recordUpdated: function (newRec, fieldName) {
		this.recordEvent = 'updated';
		var r = this.updateFromRecord(newRec, fieldName);
		delete this.recordEvent;
		return r;
	},


	recordChanged: function () {
		this.recordEvent = 'changed';
		var r = this.updateFromRecord();
		delete this.recordEvent;
		return r;
	},


	//NOTE right now we are assuming the anchorable data won't change.
	//That is true in practice and it would be expensive to pull it everytime
	//some other part of this record is updated
	updateFromRecord: function (newRecord, modifiedFieldName) {
		var r = newRecord || this.record;

		try {
			// Update only fields that changed. no point in redrawing everything.
			if (!Ext.isEmpty(modifiedFieldName)) {
				if (modifiedFieldName === 'LikeCount') {
					this.updateLikeCount(r);
				}
				if (modifiedFieldName === 'favorite') {
					this.markAsFavorited(modifiedFieldName, r.isFavorited());
				}
				return;
			}
			UserRepository.getUser(r.get('Creator'), this.fillInUser, this);

			if (this.sharedTo) {
				UserRepository.getUser(r.get('sharedWith').slice(), this.fillInShare, this);
			}


			this.time.update(r.getRelativeTimeString());
			this.noteBody.removeCls("deleted-reply");

			if (r.placeholder) {
				this.setPlaceholderContent();
			}

			this.reflectLikeAndFavorite(r);
		}
		catch (e1) {
			console.error(Globals.getError(e1));
		}
		//In case compiling the body content fails silently and doesn't call the callback,
		//blank us out so we don't ghost note bodies onto the wrong note.
		this.setContent('');
		if (r.compileBodyContent) {
			r.compileBodyContent(this.setContent, this, this.generateClickHandler, 226);
		}

		this.updateToolState();
	},


	getRecord: function () {
		return this.record;
	},


	//For subclasses
	addAdditionalRecordListeners: function (record) {

	},

	//For subclasses
	removeAdditionalRecordListeners: function (record) {

	},

	setRecord: function (r) {
		//Remove the old listener
		if (this.record) {
			this.mun(this.record, 'child-added', this.addNewChild, this);
			this.mun(this.record, 'child-removed', this.removedChild, this);
			this.mun(this.record, 'destroy', this.wasDeleted, this);
			this.mun(this.record, 'changed', this.recordChanged, this);
			this.mun(this.record, 'updated', this.recordUpdated, this);
			this.record.removeObserverForField(this, 'AdjustedReferenceCount', this.updateCount, this);
			this.stopListeningForLikeAndFavoriteChanges(this.record);
			this.stopListeningForFlagChanges(this.record);
			this.removeAdditionalRecordListeners(this.record);
		}

		this.record = r;
		this.guid = IdCache.getIdentifier(r.getId());
		if (!this.rendered) {
			return false;
		}

		UserRepository.getUser(r.get('Creator'), this.fillInUser, this);

		//used by a controller in a component query
		this.recordIdHash = IdCache.getIdentifier(r.getId());

		try {
			this.updateFromRecord();
		}
		catch (e) {
			console.error(Globals.getError(e));
			this.noteBody.remove(); //placeholder
		}

		if (this.editMode) {
			this.onEdit();
		}

		if (this.autoFillInReplies !== false) {
			this.fillInReplies();
		}


		this.updateToolState();
		this.mon(r, {
			'child-added': this.addNewChild,
			'child-removed': this.removedChild,
			scope: this
		});
		this.mon(r, {
			single: true,
			scope: this,
			'changed': function () {
				this.recordChanged();
			},
			'updated': this.recordUpdated,
			'destroy': this.wasDeleted
		});

		this.record.addObserverForField(this, 'AdjustedReferenceCount', this.updateCount, this);
		this.addAdditionalRecordListeners(r);
		this.listenForLikeAndFavoriteChanges(r);
		this.listenForFlagChanges(r);
		return true;
	},

	//Subclass can override it they care.
	updateCount: Ext.emptyFn,

	loadReplies: function (record) {
		var me = this, toMask = me.el ? me.el.down('.note-replies') : null;
		if (toMask) {
			toMask.mask('Loading...');
		}
		console.group('Loading Replies');

		function setReplies(theStore) {

			var items;

			console.log('Store load args', arguments);

			items = theStore.getItems();

			if (items.length === 1 && items[0].getId() === record.getId()) {
				items = (items[0].children || []).slice();
			}
			else {
				console.warn('There was an unexpected result from the reply store.');
			}

			console.log('Setting replies to ', items);

			record.children = items;
			Ext.each(items, function (i) {
				i.parent = record;
			});

			//the store's count is the reply count.
			//update the count for next time the carousel renders
			record.set('ReferencedByCount', theStore.getCount());
			record.fireEvent('count-updated');

			me.addReplies(items);

			if (toMask) {
				toMask.unmask();
			}
			if (me.hasCallback) {
				Ext.callback(me.hasCallback);
				delete me.hasCallback;
			}
			console.groupEnd('Loading Replies');
		}

		record.getDescendants(setReplies);
	},


	fillInReplies: function () {
		var r = this.record;
		this.removeAll(true);

		//Multiple containers/cmps involved here
		//So notice we do the bulkiest suspend resume
		//we can. Also getting this onto the next event pump
		//helps the app not seem like it is hanging
		Ext.defer(function () {
			if (this.isDestroyed) {
				return;
			}

			if (!r.hasOwnProperty('parent') && r.getLink('replies')) {
				this.loadReplies(r);
			}
			else {
				this.addReplies(r.children);
			}
		}, 1, this);
	},


	maybeOpenReplyEditor: function () {
		if (!this.getRoot()) {
			return;
		}

		var cmp, prefix = this.getRoot().replyIdPrefix();
		if (this.replyToId) {
			cmp = Ext.getCmp(IdCache.getComponentId(this.replyToId, null, prefix));
			if (cmp) {
				cmp.activateReplyEditor();
				delete this.replyToId;
			}
		}
		else if (this.scrollToId) {
			cmp = Ext.getCmp(IdCache.getComponentId(this.scrollToId, null, prefix));
			if (cmp) {
				cmp.scrollIntoView();
				delete this.scrollToId;
			}
		}
	},


	setContent: function (text) {
		var search = this.up('[getSearchTerm]'), re;
		if (search) {
			search = search.getSearchTerm();
		}
		if (search) {
			search = Ext.String.htmlEncode(search);
			re = new RegExp(['(\\>{0,1}[^\\<\\>]*?)(', RegExp.escape(search), ')([^\\<\\>]*?\\<{0,1})'].join(''), 'ig');
			text = text.replace(re, '$1<span class="search-term">$2</span>$3');
		}

		this.text.update(text);
		DomUtils.adjustLinks(this.text, window.location.href);

		if (this.title) {
			this.fillInTitle(this.record.get('title'), text);
		}

		Ext.each(this.text.query('.whiteboard-container'),
			function (wb) {
				Ext.fly(wb).on('click', this.click, this);

				if (!$AppConfig.service.canShare()) {
					Ext.fly(wb).select('.overlay').setStyle({bottom: 0});
					Ext.fly(wb).select('.toolbar').remove();
				}
			},
			this);

	},


	setContext: function (doc, cleanRoot) {
		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setContext, this, arguments), this, {single: true});
			return;
		}
		var r = this.record, newContext, reader = this.reader;
		try {
			this.context.setHTML('');
			if (!reader) {
				reader = Ext.ComponentQuery.query('reader-content')[0];
			}
			// The reader should know about the things it contains, so ask it for the context node.
			newContext = reader.getDomContextForRecord(r, doc, cleanRoot);

			if (newContext) {
				newContext = this.fixUpCopiedContext(newContext);
				this.context.appendChild(newContext);
			}

			if (Ext.isGecko || Ext.isIE9) {
				this.resizeMathJax(this.context);
			}

		}
		catch (e2) {
			console.error(Globals.getError(e2));
		}

	},


	//for subclasses
	fixUpCopiedContext: function (n) {
		return n;
	},


	generateClickHandler: function (id, data) {
		this.wbData[id] = data;
	},


	getRoot: function () {
		var cmp = this.is(this.rootQuery) ? this : this.up(this.rootQuery);
		if (!cmp) {
			console.error('No root found');
		}
		return cmp;
	},


	editorActive: function () {
		return Boolean(this.getRoot().activeEditorOwner);
	},


	//Sets cmp as the component that contains the active editor
	setEditorActive: function (cmp) {
		var active = Boolean(cmp),
			root = this.getRoot();
		console.log('Will mark Panel as having an ' + (active ? 'active' : 'inactive') + ' editor', cmp);
		if (root.editorActive() === active) {
			console.warn('Panel already has an ' + (active ? 'active' : 'inactive') + ' editor. Unbalanced calls?', cmp);
			return;
		}
		delete root.activeEditorOwner;
		if (cmp) {
			root.activeEditorOwner = cmp;
		}
		root.fireEvent(cmp ? 'editorActivated' : 'editorDeactivated', this);
	},


	//Checks to see if an editor is active for our root
	//and sets the active editor to be the one owned by the provided
	//cmp.  A cmp of null means the editor is no longer active
	checkAndMarkAsActive: function (cmp) {
		var root = this.getRoot();
		if (!root.editorActive()) {
			root.setEditorActive(cmp);
			return true;
		}
		return false;
	},


	deactivateEditor: function () {
		console.trace("Who called this?");
		this.deactivateReplyEditor.apply(this, arguments);
	},

	activateReplyEditor: function (e) {
		var me = this;
		if (e) {
			e.stopEvent();
		}

		this.replyMode = true;

		if (me.noteBody && me.checkAndMarkAsActive(this)) {
			me.replyToId = null;
			me.noteBody.addCls('editor-active');
			me.editor.activate();
			me.scrollIntoView();
			setTimeout(function () {
				me.editor.focus(true);
			}, 300);
			return true;
		}
		return false;
	},


	deactivateReplyEditor: function () {
		var root = this.getRoot();
		if (!root.editorActive()) {
			return;
		}

		if (this.noteBody) {
			this.noteBody.removeCls('editor-active');
			this.el.select('.whiteboard-container .checkbox').removeCls('checked');
			this.editor.deactivate();
			this.editor.setValue('');
		}
		if (this.editMode) {
			this.text.show();
		}
		this.editor.clearError();
		delete this.editMode;
		delete this.replyMode;
		root.setEditorActive(null);
	},


	editorKeyDown: function (event) {
		event.stopPropagation();
		var k = event.getKey();
		if (k === event.ESC) {
			this.deactivateReplyEditor();
			this.focus();
		}
	},


	editorKeyPressed: function (event) {
		event.stopPropagation();
	},


	canDelete: function () {
		var r = this.record;
		if (!r) {
			return true;
		}

		return r.isModifiable();
	},


	addNewChild: function (child) {
		var r = this.record;
		if (child.get('inReplyTo') === r.getId()) {
			this.addReplies([child]);
			if (!r.children) {
				r.children = [];
			}
			if (!Ext.Array.contains(r.children, child)) {
				r.children.push(child);
			}
			child.parent = r;
			this.adjustRootsReferenceCount(child, true);
		}
		else {
			console.log('[reply] ignoring, child does not directly belong to this item:\n',
				r.getId(), '\n', child.get('inReplyTo'), ' <- new child');
		}
	},


	removedChild: function (child) {
		if (child.get('inReplyTo') === this.record.getId()) {
			this.adjustRootsReferenceCount(child, false);
		}
	},


	onBeforeAdd: function (cmp) {
		this.callParent(arguments);
		cmp.addCls('child');
		//decide if it is the first in this container's list:
		if (this.items.getCount() === 0) {
			cmp.first = true;
		}
	},


	addReplies: function (records) {
		var toAdd = [], recordCollection, prefix = this.getRoot() ? this.getRoot().replyIdPrefix() : null;

		//Shortcircuit. Also check if we've been destroyed before adding replies.
		if (Ext.isEmpty(records) || this.isDestroyed || this.destroying) {
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
		recordCollection.each(function (record) {

			var guid = IdCache.getComponentId(record, null, prefix),
				add = true;

			if (record.getModelName() !== 'Note') {
				console.warn('can not add item, it is not a note and I am not prepared to handle that.');
				add = false;
			}
			else if (this.getComponent(guid)) {
				console.log('already showing this reply');
				add = false;
			}

			if (add) {
				toAdd.push({record: record, id: guid});
			}
		}, this);
		console.log('Adding note records', toAdd);

		this.add(toAdd);
		Ext.defer(this.maybeOpenReplyEditor, 1, this);
	},


	rootToCountComponentsFrom: function () {
		return this.getRoot();
	},


	adjustRootsReferenceCount: function (r, added) {
		var root = r.parent,
			rootCmp = this.rootToCountComponentsFrom();

		while (root && root.parent) {
			root = root.parent;
		}

		if (root) {
			root.notifyObserversOfFieldChange('AdjustedReferenceCount');
		}
	},


	onEdit: function () {
		if(this.replyMode){ return; }

		this.text.hide();
		this.editMode = true;
		this.editor.editBody(this.record.get('body'));
		this.activateReplyEditor();
	},


	onRemove: function (cmp) {
		//direct children count:
		var c = this.items.getCount(),
		//panels below this panel:
			children = this.query('note-panel') || [],
			pluck = Ext.Array.pluck,
			contains = Ext.Array.contains,
		//do any have the deleting flag?
			anyDeleting = contains(pluck(children, 'deleting'), true),
		//are any of the remaining panels not placeholders? If so, then we can not safely remove this panel.
		//safeToCleanMe means all the panels below this one are only placeholder panels.
			safeToCleanMe = !contains(Ext.Array.map(pluck(pluck(children, 'record'), 'placeholder'), Boolean), false),
		//if the component that was removed from this panel was deleting, or any panel below this was deleting.
			deleting = cmp.deleting || anyDeleting;

		console.debug('removed child, it was deleting: ', cmp.deleting,
			', or any child below me is deleting: ', anyDeleting,
			', alse we have ' + c + ' children. Safe to delete: ', safeToCleanMe);

		if ((c === 0 || safeToCleanMe) && (!this.record || this.record.placeholder)) {
			this.deleting = Boolean(deleting);
			console.debug('cleaning up placeholder panel now that all children are gone.', this);
			this.destroy();
		}
	},


	onDelete: function () {
		this.record.destroy();
	},

	onDestroy: function () {
		if (this.editor) {
			delete this.editor.ownerCt;
			this.editor.destroy();
		}
		this.callParent(arguments);
	},


	wasDeleted: function () {
		console.log('Deleting panel from record destroy, marking deleteing=true');
		this.deleting = true;
		this.destroy();
	},


	setPlaceholderContent: function () {
		var fromUpdatedRecord = Boolean(this.recordEvent);
		this.time.update("This message has been deleted");
		this.noteBody.addCls("deleted-reply");

		if (fromUpdatedRecord) {
			console.debug('This record was updated to be a placeholder...references are now dirty, and disabling replys for all children');
			//When panels are being destroyed, disable their children (we can't reply to them now, not until the records are refreshed from the server)
			this.disable();
		}
	},


	onChat: function () {
		this.fireEvent('chat', this.record);
	},


	onFlag: function () {
		this.record.flag(this);
	},


	click: function (e) {
		var t = e.getTarget('.whiteboard-container', null, true), guid;
		if (!t) {
			return;
		}

		guid = t.up('.body-divider').getAttribute('id');
		if (t && this.wbData[guid]) {
			t = e.getTarget('.reply:not(.profile-activity-reply-item)', null, true);
			if (t) {
				this.onReply();
				t.up('.toolbar').down('.include').addCls('checked');
				this.editor.addWhiteboard(Ext.clone(this.wbData[guid]), guid + '-reply');
			}
			else {
				t = e.getTarget('.include', null, true);
				if (t) {
					t[t.hasCls('checked') ? 'removeCls' : 'addCls']('checked');
					if (t.hasCls('checked')) {
						this.editor.addWhiteboard(Ext.clone(this.wbData[guid]), guid + '-reply');
					}
					else {
						this.editor.removeWhiteboard(guid + '-reply');
					}
				}
				else {
					Ext.widget('wb-window', { width: 802, value: this.wbData[guid], readonly: true}).show();
				}
			}
		}
	},

	onReply: function () {
		this.replyMode = true;
		this.activateReplyEditor();
	},


	onShare: function () {
		this.fireEvent('share', this.record);
	}


});
