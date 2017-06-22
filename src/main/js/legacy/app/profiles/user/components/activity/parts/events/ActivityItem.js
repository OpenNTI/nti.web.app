const Ext = require('extjs');

const ContainerContext = require('legacy/app/context/ContainerContext');
const {isMe} = require('legacy/util/Globals');

require('legacy/app/annotations/note/Panel');
require('legacy/mixins/note-feature/GetLatestReply');
require('./ActivityItemReply');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.parts.events.ActivityItem', {
	extend: 'NextThought.app.annotations.note.Panel',

	alias: [
		'widget.profile-activity-item',
		'widget.profile-activity-default-item',
		'widget.profile-activity-note-item'
	],

	mixins: {
		getLatestReply: 'NextThought.mixins.note-feature.GetLatestReply'
	},

	defaultType: 'profile-activity-item-reply',
	autoFillInReplies: false,

	renderSelectors: {
		liked: '.controls .like',
		favorites: '.controls .favorite',
		favoritesSpacer: '.controls .favorite-spacer',
		locationEl: '.location',
		contextEl: '.context',
		context: '.context',
		title: '.subject',
		subjectEl: '.subject',
		locationIcon: '.icon',
		itemEl: '.item',
		commentsEl: '.comments',
		footEl: '.foot',
		editEl: '.foot .edit',
		flagEl: '.foot .flag',
		deleteEl: '.foot .delete',
		contextWrapEl: '.content-callout',
		responseBox: '.respond > div'
	},

	initComponent: function () {
		if (!this.record || !this.record.isModel) {
			Ext.Error.raise('We need a record for this component');
		}

		this.callParent(arguments);
	},

	setRecord: function (record) {
		this.callParent(arguments);
		this.maybeFillIn();
	},

	updateFromRecord: function () {
		this.callParent(arguments);
	},

	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			user: this.user
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		if (this.commentsEl && this.commentsEl.dom) {
			this.mon(this.commentsEl, 'click', this.clickedRevealAllReplies, this);
		}

		if (this.replyButton && this.replyButton.dom) {
			this.mon(this.replyButton, 'click', this.clickedRevealAllReplies, this);
		}

		this.mon(this.editEl, 'click', 'onEdit', this);
		this.mon(this.deleteEl, 'click', this.onDelete, this);
		this.mon(this.contextWrapEl, 'click', this.goToObject, this);
		this.on('reveal-replies', this.clickedRevealAllReplies);

		//NOTE: We run into a case where a reply to one of our replies doesn't trigger opening the reply editor.
		// It was mainly a timing issue, so now listen to add events.
		this.on('add', function (cmp, child) {
			if (this.replyToId && child.record && child.record.getId() === this.replyToId) {
				Ext.defer(this.maybeOpenReplyEditor, 1, this);
			}
		});
	},

	createEditor: function () {
		if (this.xtype === 'profile-activity-note-item') {
			this.enableTitle = true;
		}

		this.callParent();

		var title = this.editor.el.down('.title');

		if (title) {
			title.addCls('small');
		}
	},

	addAdditionalRecordListeners: function (record) {
		this.callParent(arguments);
		this.mon(record, 'convertedToPlaceholder', this.destroy, this);
		this.mon(record, 'deleted', this.destroy, this);
	},

	removeAdditionalRecordListeners: function (record) {
		this.callParent(arguments);
		this.mun(record, 'convertedToPlaceholder', this.destroy, this);
		this.mun(record, 'deleted', this.destroy, this);
	},

	onBeforeAdd: function (cmp) {
		this.callParent(arguments);
		if (!this.isExpanded()) {
			if (this.items.last()) {
				this.items.last().destroy();
			}
		}
	},

	updateCount: function () {
		if (this.commentsEl) {
			var c = this.record.getReplyCount() || 0;
			console.log('count was update to: ', c);
			this.commentsEl.update(Ext.util.Format.plural(c, 'comment'));
		}
	},

	clickedRevealAllReplies: function () {
		this.mun(this.replyButton, 'click', this.clickedRevealAllReplies, this);
		if (!this.commentsEl) {
			return;
		}
		delete this.commentsEl;

		this.shouldShowReplies();
	},

	shouldShowReplies: function () {
		this.suspendLayouts();
		this.removeAll();
		this.resumeLayouts();

		Ext.defer(function () {
			Ext.suspendLayouts();
			this.addReplies(this.record.children);
			Ext.resumeLayouts(true);
		}, 1, this);
	},

	onDelete: function () {
		var me = this;

		Ext.Msg.show({
			msg: 'The following action will delete your note',
			//We need to bitwise OR these two, so stop the lint.
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL, //eslint-disable-line no-bitwise
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': 'Delete'},
			title: 'Are you sure?',
			fn: function (str) {
				if (str === 'ok') {
					me.record.destroy();
					me.adjustRootsReferenceCount(me.record);
					me.destroy();
				}
			}
		});
	},

	isExpanded: function () {
		return !this.commentsEl;
	},

	setRecordTitle: function () {
		var me = this;

		function callback (snip, value) {
			if (snip && snip !== value) {
				me.subjectEl.set({'data-qtip': value});
			}
			me.subjectEl.update(snip || 'Subject');
			if (!snip) {
				me.subjectEl.addCls('no-subject');
				me.name.addCls('no-subject');
			}
		}

		me.record.resolveNoteTitle(callback);
	},

	fillIn: function () {},

	maybeFillIn: function () {
		var me = this,
			D = Ext.dom.Element.DISPLAY,
			loaded = me.loaded,
			onScreen = loaded || (me.el && me.el.first().isOnScreenRelativeTo(Ext.getBody(), {bottom: 1000}));

		if (loaded || !onScreen) {
			return;
		}

		me.loaded = true;

		me.fillIn();

		me.getItemReplies();
		this.setRecordTitle();

		me.flagEl.setVisibilityMode(D);
		me.deleteEl.setVisibilityMode(D);
		me.editEl.setVisibilityMode(D);
		me.footEl.setVisibilityMode(D);

		if (isMe(me.record.get('Creator'))) {
			me.flagEl.hide();
		}
		else {
			me.deleteEl.hide();
			me.editEl.hide();
			me.flagEl.addCls('last');
		}

		if (me.root) {
			me.contextEl.show();
			me.contextEl.mask('Loading...');
			me.loadContext()
				.then(function (context) {
					me.setContext(context);

					if (me.contextEl) {
						me.contextEl.unmask();
						me.contextEl.select('input').addCls('preview').set({readonly: true});
					}
				})
				.catch(function (error) {
					if (me.contextEl) {
						me.contextEl.unmask();
					}
				});
		}
	},

	onEdit: function () {
		this.callParent(arguments);

		if (!this.replyMode) {
			this.footEl.hide();
		}

		if (this.xtype === 'profile-activity-note-item') {
			this.editor.setTitle(this.record.get('title'));
		}

		this.editor.showTitle();
	},

	activateReplyEditor: function () {
		this.editor.hideTitle();
		this.callParent(arguments);
		this.addCls('has-active-editor');
	},

	deactivateReplyEditor: function () {
		this.callParent(arguments);
		this.removeCls('has-active-editor');
		this.footEl.show();
	},

	setContext: function () {
		this.callParent(arguments);
		if (this.context) {
			this.context.select('iframe').remove();
			this.context.select('object').remove();
		}
	},

	loadContext: function () {
		var context = ContainerContext.create({
			container: this.record.get('ContainerId'),
			range: this.record.get('applicableRange'),
			contextRecord: this.record
		});

		return context.load('list');
	},

	goToObject: function (e) {
		var rec = this.record,
			t = e && e.target,
			externalLink = t && t.getAttribute('target');

		if (externalLink === '_blank') {
			return;
		}

		this.navigateToObject(rec);
	},

	setLocation: function (meta) {
		if (!meta) {
			return;
		}

		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setLocation, this, arguments), this, {single: true});
			return;
		}

		var me = this;

		try {
			meta.getPathLabel()
				.then(function (label) {
					me.locationEl.update(label);
				});

			let icon = meta.getIcon(),
				url = icon && (icon.url || icon);
			this.locationIcon.setStyle({
				backgroundImage: Ext.String.format('url({0})', url)
			});

			this.locationEl.hover(
				function () {
					Ext.fly(this).addCls('over');
				},
				function () {
					Ext.fly(this).removeCls('over');
				});

			this.locationEl.on('click',
				Ext.bind(this.fireEvent, this, ['navigation-selected', meta.NTIID, null, null]));
		} catch (e) {
			console.error(e.stack || e.message || e);
		}
	}
}, function () {

	this.prototype.renderTpl = Ext.DomHelper.markup([
		{
			cls: 'note profile-activity-item',
			cn: [
				{ cls: 'content-callout context', onclick: 'void(0)'},
				{ cls: 'item', cn: [
					{cls: 'avatar-wrapper', cn: ['{user:avatar}']},
					{ cls: 'controls', cn: [
						{ cls: 'favorite-spacer' },
						{ cls: 'favorite' },
						{ cls: 'like' }
					]},
					{ cls: 'meta', cn: [
						{ cls: 'subject', html: '' },
						{ cls: 'stamp', cn: [
							{tag: 'span', cls: 'name link'},
							{tag: 'span', cls: 'time'},
							{tag: 'span', cls: 'shared-to link', html: 'Private'}
						]}
					]},
					{ cls: 'body' },
					{
						cls: 'foot',
						cn: [
							{ cls: 'comments', 'data-label': ' Comment', html: ' ' },
							{ cls: 'edit', html: 'Edit' },
							{ cls: 'flag', html: 'Report' },
							{ cls: 'delete', html: 'Delete' }

						]
					}
				]
				}
			]
		},
		{
			id: '{id}-body',
			cls: 'note-replies',
			cn: ['{%this.renderContainer(out,values)%}']
		},
		{
			cls: 'respond', cn: {
				cn: [
					{
						cls: 'reply-options',
						cn: [
							{ cls: 'link reply', html: 'Add a comment' }
						]
					}
				]}
		}
	]);
});
