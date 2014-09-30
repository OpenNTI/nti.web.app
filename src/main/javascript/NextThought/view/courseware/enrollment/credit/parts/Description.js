Ext.define('NextThought.view.courseware.enrollment.credit.parts.Description', {
	extend: 'Ext.Component',
	alias: 'widget.credit-description',


	cls: 'credit-description',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'p', html: '{text}'}
	]),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			text: this.text
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var anchors = this.el.query('a') || [];

		anchors.forEach(function(anchor) {
			if (anchor.host && anchor.host !== window.location.host) {
				anchor.setAttribute('target', '_blank');
			}
		});
	}
});
