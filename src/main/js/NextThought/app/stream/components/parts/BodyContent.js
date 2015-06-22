/**
 * Render the body of a record (namely notes and forums), expects
 *
 * Creator: Model or String,
 * BodyContent: Promise that fulfills with the compiled body content,
 * created: Date of the creation,
 * sharedWith: Array or Null, the entities this this is shared with
 * editable: Boolean, if this is editable
 * reportable: Boolean, if this is reportable
 * deletable: Boolean, if this is deletable
 * record: Object, for the like and favorite actions
 *
 * fires: show-object, edit, report, delete
 * @type {String}
 */
Ext.define('NextThought.app.stream.components.parts.BodyContent', {
	extend: 'Ext.Components',
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
				{tag: 'span', cls: 'list-item', html: '{Creator:displayName}'},
				{tag: 'span', cls: 'list-item', html: '{date}'},
				{tag: 'tpl', 'if': 'sharedWith', cn: [
					{tag: 'span', cls: 'list-item', html: '{shareWith}'}
				]}
			]}
		]},
		{cls: 'body', html: '{body}'},
		{cls: 'actions', cn: [
			{tag: 'tpl', 'if': 'commentCount', cn: [
				{tag: 'span', cls: 'list-item', html: '{commentCount:("Comment")}'}
			]},
			{tag: 'tpl', 'if': 'editAction', cn: [
				{tag: 'span', cls: 'list-item', html: 'Edit'}
			]},
			{tag: 'tpl', 'if': 'reportAction', cn: [
				{tag: 'span', cls: 'list-item', html: 'Report'}
			]},
			{tag: 'tpl', 'if': 'deleteAction', cn: [
				{tag: 'span', cls: 'list-item', html: 'Delete'}
			]}
		]}
	]),


	beforeRender: function() {
		this.callParent(arguments);
	}
});
