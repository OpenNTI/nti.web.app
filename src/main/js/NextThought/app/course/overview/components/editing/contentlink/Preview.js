Ext.define('NextThought.app.course.overview.components.editing.contentlink.Preview', {
	extend: 'Ext.Component',
	alias: 'widget.editing-contentlink-preview',

	ui: 'content-card',
	cls: 'content-card preview',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'thumbnail', style: { backgroundImage: 'url({thumbnail})'} },
		{ cls: 'meta', cn: [
			{ cls: 'title', html: '{title}' },
			{ cls: 'byline', html: '{{{NextThought.view.cards.Card.by}}}' },
			{ cls: 'description', html: '{description}' }
		]}
	]),

	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, this.data);
	},


	update: function (values) {
		// TODO: Update the preview as values changes.
	}
});