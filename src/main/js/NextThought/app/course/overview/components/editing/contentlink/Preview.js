Ext.define('NextThought.app.course.overview.components.editing.contentlink.Preview', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-contentlink-preview',

	ui: 'content-card',
	cls: 'content-card preview',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'thumbnail icon', style: { backgroundImage: 'url({icon})'} },
		{ cls: 'meta', cn: [
			{ cls: 'title label', html: '{label}' },
			{ cls: 'byline Creator', html: '{{{NextThought.view.cards.Card.by}}} {byline}' },
			{ cls: 'description', html: '{description}' }
		]}
	]),

	beforeRender: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, this.values);
	},


	update: function (values) {
		var el;

		console.log(values);
		for(var k in values) {
			if(values.hasOwnProperty(k)){
				el = this.el.down('.' + k);
				if (el) {
					if (k === 'icon') {
						el.setStyle('backgroundImage', 'url(' + values[k] + ')');
					}
					else {
						el.setHTML(values[k]);						
					}
				}
			}
		}
	}
});