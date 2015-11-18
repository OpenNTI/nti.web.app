Ext.define('NextThought.app.course.overview.components.editing.contentlink.Preview', {
	extend: 'Ext.Component',
	alias: 'widget.editing-contentlink-preview',

	ui: 'content-card',
	cls: 'content-card preview',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'thumbnail', style: { backgroundImage: 'url({thumbnail})'} },
		{ cls: 'meta', cn: [
			{ cls: 'title', html: '{title}' },
			{ cls: 'byline creator', html: '{{{NextThought.view.cards.Card.by}}}' },
			{ cls: 'description', html: '{description}' }
		]}
	]),

	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, this.data);
	},


	update: function (values) {
		var el;

		console.log(values);
		for(var k in values) {
			if(values.hasOwnProperty(k)){
				el = this.el.down('.' + k);
				if (el) {
					el.setHTML(values[k]);
				}
			}
		}
	}
});