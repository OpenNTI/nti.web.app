export default Ext.define('NextThought.app.content.timeline.components.Header', {
	extend: 'Ext.Component',
	alias: 'widget.timeline-header',


	cls: 'nti-window-header',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'controls', cn: [
			{cls: 'tool close'}
		]},
		{tag: 'span', html: '{title}'}
	]),


	renderSelectors: {
		closeEl: '.close'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.title
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.closeEl, 'click', this.onCloseClick.bind(this));
	},


	onCloseClick: function() {
		if (this.doClose) {
			this.doClose();
		}
	}
});
