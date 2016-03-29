var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.Description', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-description',


	cls: 'enrollment-description',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'p', html: '{text}'}
	]),


	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			text: this.text
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		var anchors = this.el.query('a') || [];

		anchors.forEach(function (anchor) {
			if (anchor.host && anchor.host !== window.location.host) {
				anchor.setAttribute('target', '_blank');
			}
		});

		if (this.otherCls) {
			this.addCls(this.otherCls);
		}
	}
});
