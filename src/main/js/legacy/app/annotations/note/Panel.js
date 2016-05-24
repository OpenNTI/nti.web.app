const Ext = require('extjs');
const TemplatesForNotes = require('./Templates');
const IdCache = require('legacy/cache/IdCache');
const UserRepository = require('legacy/cache/UserRepository');
const AnalyticsUtil = require('legacy/util/Analytics');
const AnnotationUtils = require('legacy/util/Annotations');
const DomUtils = require('legacy/util/Dom');
const Globals = require('legacy/util/Globals');
const SharingUtils = require('legacy/util/Sharing');
const ParseUtils = require('legacy/util/Parsing');
const {wait} = require('legacy/util/Promise');
require('legacy/mixins/ProfileLinks');
require('legacy/mixins/LikeFavoriteActions');
require('legacy/mixins/FlagActions');
require('legacy/cache/UserRepository');
require('legacy/layout/component/Natural');
require('../../userdata/Actions');
require('../../sharing/Window');
require('../../context/StateStore');
require('../../context/components/cards/Content');
require('../../context/components/cards/Question');
require('../../context/components/cards/RelatedWork');
require('../../context/components/cards/Slide');
require('../../context/components/cards/Video');
require('legacy/app/contentviewer/Actions');


module.exports = exports = Ext.define('NextThought.app.annotations.note.Panel', {
	extend: 'Ext.container.Container',
	alias: 'widget.note-panel',

	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks',
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		flagActions: 'NextThought.mixins.FlagActions'
	},

	triggerAnalyticsViews: false,
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
				{cls: 'avatar-wrapper', cn: ['{user:avatar}']},
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
								{ cls: 'link reply', html: '{{{NextThought.view.annotations.note.Panel.reply}}}' },
								{ cls: 'link share', html: '{{{NextThought.view.annotations.note.Panel.share}}}' },
								{ cls: 'link more', 'data-qtip': '{{{NextThought.view.annotations.note.Panel.options}}}', html: '&nbsp;'}
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
		avatar: '.avatar-wrapper',
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
		this.UserDataActions = NextThought.app.userdata.Actions.create();
		this.ContextStore = NextThought.app.context.StateStore.getInstance();
	},

	replyIdPrefix: function () {
		return [this.xtype, 'reply'].join('-');
	},

	onBeforeDestroyCheck: function () {
		if (this.editor && this.editor.isActive()) {
			this.setPlaceholderContent();
			return false;//stop the destroy
		}

		if (this.sharingWindow) {
			this.sharingWindow.close();
			Ext.destroy(this.sharingWindow);
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

		me.startResourceTimer();

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

		if (Service.canShare()) {
			if (me.replyButton) { me.mon(me.replyButton, 'click', me.onReply, me); }
			if (me.shareButton) {
				me.mon(me.shareButton, 'click', me.onShare, me);
			}
		}
		else {
			if (me.replyButton) {
				me.replyButton.remove();
			}
			if (me.shareButton) {
				me.shareButton.remove();
			}
		}

		if (me.editorEl) {
			me.mon(me.editorEl.down('.cancel'), 'click', me.deactivateReplyEditor, me);
			me.mon(me.editorEl.down('.save'), 'click', me.editorSaved, me);

			me.mon(me.editorEl.down('.content'), {
				scope: me,
				keypress: me.editorKeyPressed,
				keydown: me.editorKeyDown
			});

			if (this.editorEl.down('.title')) {
				this.editorEl.down('.title').setVisibilityMode(Ext.dom.Element.DISPLAY);
			}
		}


		if (me.title) {
			me.mon(me.title, 'click', function (e) {
				var a = e.getTarget('a[href]');

				if (a) {
					e.stopEvent();
					NextThought.app.navigation.Actions.navigateToHref(a.href);
				}
			}, this);
		}

		if (me.replyToId === me.record.getId()) {
			me.onReply();
		}
	},

	createEditor: function () {
		//TODO: clean this up! We should be relying on the editor's events, not digging into its dom.
		this.editor = Ext.widget({
			xtype: 'nti-editor',
			ownerCt: this,
			renderTo: this.responseBox,
			record: this.record,
			enableTitle: this.enableTitle,
			enableFileUpload: true
		});
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

		function callback (snip, value) {
			if (snip && snip !== value) {
				me.title.set({'data-qtip': value});
			}
			me.title.update(snip);
		}

		this.record.resolveNoteTitle(callback, 46);
	},

	fillInUser: function (user) {
		this.user = user;
		this.renderData.user = user;
		this.avatar.setHTML(Ext.DomHelper.createTemplate('{user:avatar}').apply({user: user}));
		this.name.update(user.getName());

		//NOTE: this is probably not the best place where to set the more options menu.
		TemplatesForNotes.attachMoreReplyOptionsHandler(this, this.more, user, this.record);
	},

	fillInShare: function (sharedWith) {
		var me = this,
			tpl = Ext.DomHelper.createTemplate({tag: 'name', 'data-profile-idx': '{1}', html: '{0}'}),
			sharingInfo = SharingUtils.sharedWithToSharedInfo(SharingUtils.resolveValue(sharedWith));

		if (!me.responseBox || me.isDestroyed) {
			return;
		}

		me.responseBox[(sharedWith || []).length === 0 ? 'removeCls' : 'addCls']('shared');

		SharingUtils.getLongTextFromShareInfo(sharingInfo, tpl, 150)
			.then(function (str) {
				me.sharedTo.update(str);
				me.sharedTo.set({'data-qtip': str});
				me.sharedTo.select('name[data-profile-idx]').on('click', function (e) {
					var a = e.getTarget('name'),
						i = a && a.getAttribute('data-profile-idx'),
						u = a && sharedWith[i];

					e.stopEvent();

					if (a && !Ext.isEmpty(i) && u) {
							me.navigateToProfile(u);
						}
				});
			});
	},

	scrollIntoView: function () {
		var scroller = this.scrollingParent;

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
			r = me.record;

		function callback (success, record) {
			if (me.isDestroyed) {
				return;
			}
			if (success) {
				me.deactivateReplyEditor();
				if (me.recordUpdated) {
					me.recordUpdated(r);
				}
				AnnotationUtils.updateHistory(record);
			}
			me.editor.unmask();
		}

		function save () {
			let p;
			if (me.editMode) {
				p = me.UserDataActions.saveUpdatedNote(r, v.body || [], v.title)
						.then(function (response) {
							let rec = ParseUtils.parseItems(response)[0];
							r.fireEvent('updated', rec);
							callback(true, rec);
						})
						.catch(reason => {
							me.onReplySaveFailure(reason);
						});
			}
			else {
				p = me.UserDataActions.saveNewReply(r, v.body, [])
					.then(callback.bind(this, true))
					.catch(me.onReplySaveFailure.bind(me));
			}

			return p;
		}

		if (DomUtils.isEmpty(v.body)) {
			me.editor.markError(me.editorEl.down('.content'), getString('NextThought.view.annotations.note.Panel.empty-editor'));
			return;
		}
		me.editorEl.mask('Saving...');
		me.updateLayout();
		return wait().then(save);
	},

	onReplySaveFailure: function (err) {
		console.error(Globals.getError(err));
		this.editor.unmask();
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
		var me = this,
			r = newRecord || this.record;

		try {
			// Update only fields that changed. no point in redrawing everything.
			if (!Ext.isEmpty(modifiedFieldName)) {
				if (modifiedFieldName === 'LikeCount') {
					me.updateLikeCount(r);
				}
				if (modifiedFieldName === 'favorite') {
					me.markAsFavorited(modifiedFieldName, r.isFavorited());
				}
				return;
			}
			UserRepository.getUser(r.get('Creator'), me.fillInUser, me);

			if (me.sharedTo) {
				UserRepository.getUser(r.get('sharedWith').slice())
					.then(function (users) {
						me.fillInShare(users);
					});
			}


			me.time.update(r.getRelativeTimeString());
			me.noteBody.removeCls('deleted-reply');

			if (r.placeholder) {
				me.setPlaceholderContent();
			}

			me.reflectLikeAndFavorite(r);
		}
		catch (e1) {
			console.error(Globals.getError(e1));
		}
		//In case compiling the body content fails silently and doesn't call the callback,
		//blank us out so we don't ghost note bodies onto the wrong note.
		me.setContent('');
		if (r.compileBodyContent) {
			r.compileBodyContent(me.setContent, me, me.generateClickHandler, 226);
		}

		me.updateToolState();
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
			this.mun(this.record, 'child-added', this.onNewChild, this);
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
			this.initialRepliesLoad = this.fillInReplies();
		}


		this.updateToolState();
		this.mon(r, {
			'child-added': this.onNewChild,
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

	maybeApplyState: function () {
		if (this.state === 'reply') {
			this.onReply();
		} else if (this.state === 'edit') {
			this.onEdit();
		}
	},

	//Subclass can override it they care.
	updateCount: Ext.emptyFn,

	loadReplies: function (record) {
		var me = this, toMask = me.el ? me.el.down('.note-replies') : null;
		if (toMask) {
			toMask.mask('Loading...');
		}
		console.group('Loading Replies');

		return new Promise(function (fulfill, reject) {
			function setReplies (theStore) {
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

				me.maybeApplyState();

				if (me.hasCallback) {
					Ext.callback(me.hasCallback);
					delete me.hasCallback;
				}
				console.groupEnd('Loading Replies');
				fulfill();
			}

			record.getDescendants(setReplies);
		});
	},

	fillInReplies: function () {
		var r = this.record, me = this;
		this.removeAll(true);

		//Multiple containers/cmps involved here
		//So notice we do the bulkiest suspend resume
		//we can. Also getting this onto the next event pump
		//helps the app not seem like it is hanging
		return wait()
				.then(function () {
					if (me.isDestroyed) {
						return Promise.reject();
					}

					if (!r.hasOwnProperty('parent') && r.getLink('replies')) {
						return me.loadReplies(r);
					}

					// Adding replies is synchronous.
					me.addReplies(r.children);
					return Promise.resolve();
				});
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
		if (!this.rendered) {
			this.on({
				single: true,
				afterrender: Ext.bind(this.setContent, this, arguments)
			});
			return;
		}

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

				if (!Service.canShare()) {
					Ext.fly(wb).select('.overlay').setStyle({bottom: 0});
					Ext.fly(wb).select('.toolbar').remove();
				}
			},
			this);

		let attachments = this.text.select('.attachment-part');
		if (attachments && attachments.elements.length > 0) {
			attachments.on('click', this.click.bind(this));
		}
	},


	setContext: function (contextCmp) {
		var t, me = this;

		return me.onceRendered
				.then(function () {
					me.context.setHTML('');
					if (!Ext.isEmpty(contextCmp)) {
						//We have seen a case where we try and render a component twice.  That is a no no and causes
						//terrible crashes
						if (contextCmp.rendered) {
							console.error('Attempting to rerender a context cmp');
							return Promise.reject();
						}
						contextCmp.render(me.context);

						if (me.resizeMathJax && (Ext.isGecko || Ext.isIE9)) {
							me.resizeMathJax(me.context);
						}
					}
					else {
						t = me.context.up('.context') || me.context;
						// for no context, hide it.
						t.setVisibilityMode(Ext.dom.Element.DISPLAY);
						t.hide();
					}

					return Promise.resolve();
				});
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
	//cmp.	A cmp of null means the editor is no longer active
	checkAndMarkAsActive: function (cmp) {
		var root = this.getRoot();
		if (!root.editorActive()) {
			root.setEditorActive(cmp);
			return true;
		}
		return false;
	},

	deactivateEditor: function () {
		console.error('Who called this?');
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

	onNewChild: function (child) {
		if (child.get('inReplyTo') === this.record.getId()) {
			this.addNewChild(child);
			return true;
		}

		var children = this.items.items, i;

		for (i = 0; i < children.length; i++) {
			if (children[i].onNewChild(child)) {
				return true;
			}
		}

		return false;
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
				console.warn('cannot add item, it is not a note and I am not prepared to handle that.');
				add = false;
			}
			else if (this.getComponent(guid)) {
				console.log('already showing this reply');
				add = false;
			}

			if (add) {
				toAdd.push({record: record, id: guid, scrollingParent: this.scrollingParent});
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

	onEdit: function (e) {
		if (e && e.stopEvent) {e.stopEvent();}
		if (this.replyMode) { return; }

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
		//are any of the remaining panels not placeholders? If so, then we cannot safely remove this panel.
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

	onDelete: function (e) {
		if (e && e.stopEvent) {e.stopEvent();}
		this.record.destroy();
	},

	startResourceTimer: function () {
		if (!this.triggerAnalyticsViews || !this.record) { return; }

		AnalyticsUtil.getResourceTimer(this.record.getId(), {
			type: 'note-viewed',
			note_id: this.record.getId()
		});
	},

	onDestroy: function () {
		if (this.editor) {
			delete this.editor.ownerCt;
			this.editor.destroy();
		}

		if (this.triggerAnalyticsViews) {
			AnalyticsUtil.stopResourceTimer(this.record.getId(), 'note-viewed');
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
		this.time.update('This message has been deleted');
		this.noteBody.addCls('deleted-reply');

		if (fromUpdatedRecord) {
			console.debug('This record was updated to be a placeholder...references are now dirty, and disabling replys for all children');
			//When panels are being destroyed, disable their children (we can't reply to them now, not until the records are refreshed from the server)
			this.disable();
		}
	},

	onChat: function (e) {
		if (e && e.stopEvent) {e.stopEvent();}
		this.fireEvent('chat', this.record);
	},

	onFlag: function (e) {
		if (e && e.stopEvent) {e.stopEvent();}
		this.record.flag(this);
	},

	click: function (e) {
		if (e.getTarget('.whiteboard-container', null, true)) {
			this.handleWhiteboardClick(e);
		}
		else if (e.getTarget('.attachment-part', null, true)) {
			this.handleAttachmentClick(e);
		}
	},


	handleWhiteboardClick: function (e) {
		let t = e.getTarget('.whiteboard-container', null, true),
			guid = t && t.up('.body-divider').getAttribute('id');
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


	handleAttachmentClick: function (e) {
		let el = e.getTarget('.attachment-part'),
			part = this.getAttachmentPart(el);

		if (part && !e.getTarget('.download')) {
			let ContentViewerActions = NextThought.app.contentviewer.Actions.create();

			if (ContentViewerActions) {
				ContentViewerActions.showAttachmentInPreviewMode(part, this.record);
			}
		}
	},


	getAttachmentPart: function (el) {
		let name = el && el.getAttribute && el.getAttribute('name');

		if (!name || !this.record) {
			return null;
		}

		let body = this.record.get('body') || [], part;

		body.forEach(function (p) {
			if (p.name === name) {
				part = p;
				return false;
			}
		});

		return part;
	},


	onReply: function (e) {
		if (e && e.stopEvent) {e.stopEvent();}
		this.replyMode = true;
		this.activateReplyEditor();
	},

	onShare: function (e) {
		if (e && e.stopEvent) {e.stopEvent();}

		var bundle = this.ContextStore.getRootBundle();

		this.sharingWindow = Ext.widget('share-window', {
			record: this.record,
			bundle: bundle
		});

		this.sharingWindow.show();
	}
});
