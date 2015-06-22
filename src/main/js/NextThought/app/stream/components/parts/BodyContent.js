/**
 * Render the body of a record (namely notes and forums), expects
 *
 * Creator: Model or String,
 * BodyContent: Promise that fulfills with the compiled body content,
 * title: String, the title of the body content
 * created: Date of the creation,
 * sharedWith: Array or Null, the entities this this is shared with
 * replyable: Boelean, if this is replyable
 * editable: Boolean, if this is editable
 * reportable: Boolean, if this is reportable
 * deletable: Boolean, if this is deletable
 * record: Object, for the like and favorite actions
 *
 * fires: show-object, edit, report, delete
 * @type {String}
 */
Ext.define('NextThought.app.stream.components.parts.BodyContent', {
	extend: 'Ext.Component',
	alias: 'widget.stream-parts-bodycontent',

	mixins: {
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	cls: 'body-content',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'controls', cn: [
			{cls: 'favorite-space'},
			{cls: 'favorite'},
			{cls: 'like'}
		]},
		{cls: 'meta', cn: [
			'{Creator:avatar}',
			{cls: 'content', cn: [
				{cls: 'title', html: '{title}'},
				{tag: 'span', cls: 'list-item name blue', html: '{Creator:displayName}'},
				{tag: 'span', cls: 'list-item', html: '{date:ago}'},
				{tag: 'tpl', 'if': 'sharedWith', cn: [
					{tag: 'span', cls: 'list-item blue', html: '{shareWith}'}
				]}
			]}
		]},
		{cls: 'body', html: '{body}'},
		{cls: 'actions', cn: [
			{tag: 'tpl', 'if': 'commentCount || commentCount === 0', cn: [
				{tag: 'span', cls: 'list-item blue', html: '{commentCount:plural("Comment")}'}
			]},
			{tag: 'tpl', 'if': 'replyAction', cn: [
				{tag: 'span', cls: 'list-item blue', html: 'Reply'}
			]},
			{tag: 'tpl', 'if': 'editAction', cn: [
				{tag: 'span', cls: 'list-item blue', html: 'Edit'}
			]},
			{tag: 'tpl', 'if': 'reportAction', cn: [
				{tag: 'span', cls: 'list-item blue', html: 'Report'}
			]},
			{tag: 'tpl', 'if': 'deleteAction', cn: [
				{tag: 'span', cls: 'list-item blue', html: 'Delete'}
			]}
		]}
	]),


	renderSelectors: {
		avatarEl: '.meta .avatar',
		nameEl: '.meta .name',
		bodyEl: '.body',

		liked: '.controls .like',
		favorites: '.controls .favorite',
		favoritesSpacer: '.controls .favorite-spacer'
	},


	beforeRender: function() {
		this.callParent(arguments);

		var rd = {
			Creator: this.Creator,
			title: this.title,
			date: this.created,
			replyAction: this.replyable,
			editAction: this.editable,
			reportAction: this.reportable,
			deleteAction: this.deleteAction,
			commentCount: this.commentCount
		};

		if (!this.Creator.isModel) {
			UserRepository.getUser(this.Creator)
				.then(this.setUser.bind(this));
		}

		this.BodyContent.then(this.setBody.bind(this));

		this.mixins.likeAndFavoriteActions.constructor.call(this);

		this.renderData = Ext.apply(this.renderData || {}, rd);
	},


	setUser: function(user) {
		if (!this.rendered) {
			this.on('afterrender', this.setUser.bind(this, user));
			return;
		}

		var profilePic = this.avatarEl.down('.profile');

		profilePic.setStyle({backgroudImage: 'url(' + user.get('avatarURL') + ')'});
		this.nameEl.update(user.getName());
	},


	setBody: function(html) {
		if (!this.rendered) {
			this.on('afterrender', this.setBody.bind(this, html));
			return;
		}

		var me = this,
			el = me.bodyEl;

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

		el.select('.whiteboard-container .toolbar').remove();
		el.select('.whiteboard-container .overlay').remove();
	}
});
