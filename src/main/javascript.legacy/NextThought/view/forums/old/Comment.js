Ext.define('NextThought.view.forums.old.Comment', {
	extend: 'Ext.Component',
	alias: 'widget.forums-topic-comment',
	requires: [
		'NextThought.editor.Editor'
	],

	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks',
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		flagActions: 'NextThought.mixins.FlagActions'
	},

	cls: 'topic-comment',
	ui: 'forum-comment',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'controls', cn: [
			{cls: 'favorite-spacer'},
			{cls: 'like'}
		]},
		{ cls: 'avatar', style: { backgroundImage: 'url({avatarURL});'}},
		{ cls: 'wrap', 'data-commentid': '{ID}', cn: [
			{ cls: 'meta', cn: [
				{ tag: 'span', html: '{displayName}', cls: 'name link'},
				{ tag: 'span', cls: 'datetime', html: '{CreatedTime:date("F j, Y")} at {CreatedTime:date("g:i A")}'}
			]},
			{ cls: 'body' },
			{ cls: 'foot', cn: [
				{ tag: 'tpl', 'if': 'isModifiable', cn: [
					{ tag: 'span', cls: 'edit link', html: 'Edit'},
					{ tag: 'span', cls: 'delete link', html: 'Delete'}
				]},
				{ tag: 'tpl', 'if': '!isModifiable', cn: [
					{ tag: 'span', cls: 'flag link', html: 'Report'}
				]}
			]},
			{ cls: 'editor-box' }
		] }
	]),


	renderSelectors: {
		bodyEl: '.body',
		nameEl: '.name',
		avatarEl: '.avatar',
		ctrlEl: '.controls',
		liked: '.controls .like',
		editEl: '.foot .edit',
		deleteEl: '.foot .delete',
		flagEl: '.foot .flag',
		editorBoxEl: '.editor-box',
		metaEl: '.meta',
		footEl: '.foot'
	},


	initComponent: function() {
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		this.mixins.flagActions.constructor.call(this);
		this.callParent(arguments);
		this.addEvents(['delete-post']);
		this.enableBubble(['delete-post']);
		this.mon(this.record, 'destroy', this.onRecordDestroyed, this);
	},


	beforeRender: function() {
		var me = this, r = me.record, rd;
		me.callParent(arguments);
		rd = me.renderData = Ext.apply(me.renderData || {}, r.getData());
		rd.LastModified = rd['Last Modified'];

		me.loadUser(r.get('Creator'));

		if (isMe(r.get('Creator'))) {
			this.addCls('me');
		}

		if (this.record.get('Deleted')) {
			this.addCls('deleted');
		}
	},

	loadUser: function(creator) {
		var me = this;
		UserRepository.getUser(creator, me.addUser, me);
	},

	addUser: function(u) {
		var me = this, r = me.record,
			rd = Ext.apply(me.renderData || {}, r.getData());
		rd.lastModified = rd['Last Modified'];
		me.userObject = u;
		Ext.applyIf(rd, u.getData());
		me.renderData = rd;
		if (me.rendered) {
			console.warn('Rendered late');
			me.nameEl.update(u.get('displayName'));
			me.avatarEl.setStyle('backgroundImage', 'url(' + u.get('avatarURL') + ')');
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		var bodyEl = this.bodyEl,
			ctrlEl = this.ctrlEl,
			metaEl = this.metaEl,
			footEl = this.footEl,
			hide, show;

		this.record.addObserverForField(this, 'body', this.updateContent, this);
		this.updateContent();
		bodyEl.selectable();

		if (this.deleteEl) {
			this.mon(this.deleteEl, 'click', this.onDeletePost, this);
		}

		if (this.editEl) {
			this.mon(this.editEl, 'click', this.onEditPost, this);
		}

		if (this.record) {
			this.enableProfileClicks(this.nameEl, this.avatarEl);
		}

		this.reflectLikeAndFavorite(this.record);
		this.listenForLikeAndFavoriteChanges(this.record);
		this.reflectFlagged(this.record);
		this.listenForFlagChanges(this.record);

		if (this.record.get('Deleted')) {
			this.tearDownFlagging();
		}

		bodyEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		ctrlEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		metaEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		footEl.setVisibilityMode(Ext.dom.Element.DISPLAY);

		hide = function() {
			bodyEl.hide();
			ctrlEl.hide();
			metaEl.hide();
			footEl.hide();
		};
		show = function() {
			bodyEl.show();
			ctrlEl.show();
			metaEl.show();
			footEl.show();
		};

		this.editor = Ext.widget('nti-editor', {record: this.record, ownerCt: this, renderTo: this.editorBoxEl});
		this.mon(this.editor, {
			scope: this,
			'activated-editor': hide,
			'deactivated-editor': show,
			'no-body-content': function(editor, el) {
				editor.markError(el, 'You need to type something');
				return false;
			}
		});
	},


	onDestroy: function() {
		if (this.editor) {
			delete this.editor.ownerCt;
			this.editor.destroy();
			delete this.editor;
		}
		this.callParent(arguments);
	},


	getRefItems: function() {
		return this.editor ? [this.editor] : [];
	},


	getRecord: function() {
		return this.record;
	},


	updateContent: function() {
		this.record.compileBodyContent(this.setContent, this);
	},


	setContent: function(html) {
		var el = this.bodyEl, me = this;

		el.update(html);
		DomUtils.adjustLinks(el, window.location.href);
		el.select('img.whiteboard-thumbnail').each(function(el) {
			el.replace(el.up('.body-divider'));
		});

		el.select('img').each(function(img) {
			img.on('load', function() {
				me.up('[record]').fireEvent('sync-height');
			});
		});
	},

	/*
	 * The normal pattern employed is to have the records destroy trigger this
	 * component to go away. But, for blog (and forum I assume) comments
	 * the server deletes them but then continues to return them as placeholder looking
	 * objects.  With a little work we could employ the placeholder logic we give to notes,
	 * where a delete turns certain records into placeholders.  However we drive many different views
	 * history, activity off of destroy events that don't get fired in that case.  Since the ds still
	 * does all its other deletion logic as normal we opt to do the same.
	 *
	 * For now, for simplicity, we just have the record destroy remove our record reference and update the UI components
	 * appropriately.  We tear down any observers first so we don't get events and fall down code paths
	 * requiring the record.
	 *
	 * FIXME I don't really like this way of handling this.  I really want to use the placeholder logic but sill have
	 * the ability for destroy and our store removal logic to kick in.
	 */
	onRecordDestroyed: function() {
		//First remove the delete and edit link listeners followed by the els
		if (this.deleteEl) {
			this.mun(this.deleteEl, 'click', this.onDeletePost, this);
			this.deleteEl.remove();
		}

		if (this.editEl) {
			this.mun(this.editEl, 'click', this.onEditPost, this);
			this.editEl.remove();
		}

		//Now tear down like and favorites
		this.tearDownLikeAndFavorite();


		//Now clear the rest of our field listeners
		this.record.removeObserverForField(this, 'body', this.updateContent, this);

		//Now update the body to the same text the server uses.
		if (this.bodyEl && this.bodyEl.dom) {
			this.bodyEl.update('This item has been deleted.');
		}
		this.addCls('deleted');
	},


	onDeletePost: function(e) {
		e.stopEvent();
		var me = this;
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		Ext.Msg.show({
			msg: 'This will permanently remove this comment.',
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': 'Delete'},
			title: 'Are you sure?',
			fn: function(str) {
				if (str === 'ok') {
					me.fireDeleteEvent();
				}
			}
		});
	},


	fireDeleteEvent: function() {
		this.fireEvent('delete-topic-comment', this.record, this);
	},


	onEditPost: function(e) {
		e.stopEvent();
		var parentCmp = this.up('forums-topic');
		if (parentCmp && parentCmp.clearSearchHit) {
			parentCmp.clearSearchHit();
		}
		this.editor.editBody(this.record.get('body'));
		this.editor.activate();
	}

});
