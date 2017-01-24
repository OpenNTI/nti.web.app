const Ext = require('extjs');

module.exports = exports = Ext.define('NextThought.app.forums.components.topic.parts.CommentControls', {
	extend: 'Ext.Component',
	alias: 'widget.forums-topic-comment-controls',

	cls: 'forums-topic-comment-controls',

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'span', cls: 'expand link', html: 'Expand All'},
		{ tag: 'span', cls: 'collapse link', html: 'Collapse All'}
	]),

	renderSelectors: {
		expandEl: '.expand',
		collapseEl: '.collapse'
	},


	afterRender () {
		this.callParent(arguments);

		if (this.expandEl) {
			this.mon(this.expandEl, 'click', () => this.onExpand());
		}

		if (this.collapseEl) {
			this.mon(this.collapseEl, 'click', () => this.onCollapse());
		}
	},


	setCommentCmp (cmp) {
		this.commentCmp = cmp;
	},


	onExpand () {
		if (this.commentCmp && this.commentCmp.expandAllCommentThreads) {
			this.commentCmp.expandAllCommentThreads();
		}
	},


	onCollapse () {
		if (this.commentCmp && this.commentCmp.collapseAllCommentThreads) {
			this.commentCmp.collapseAllCommentThreads();
		}
	}
});
