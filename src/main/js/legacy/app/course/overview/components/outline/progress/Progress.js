const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.outline.progress.Progress', {
	extend: 'Ext.Component',
	alias: 'widget.overview-outline-progress',

	cls: 'outline-progress',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'progress-label', html: '<div class="{containerClass}">' +
			'<svg width="38" height="38" viewBox="0 0 36 36">' +
				'<path' +
					' d="M18 2.0845' +
					' a 15.9155 15.9155 0 0 1 0 31.831' +
					' a 15.9155 15.9155 0 0 1 0 -31.831"' +
					' fill="none"' +
					' stroke="#eee";' +
					' stroke-width="2";' +
					' stroke-dasharray="100, 100"' +
				'/><path' +
					' d="M18 2.0845' +
					' a 15.9155 15.9155 0 0 1 0 31.831' +
					' a 15.9155 15.9155 0 0 1 0 -31.831"' +
					' fill="none"' +
					' stroke="#3FB34F";' +
					' stroke-width="2";' +
					' stroke-dasharray="{pctComplete}, 100"' +
				'/>' +
			'</svg>' +
			'<div class="percentage-value">{pctComplete}</div>' +
			'<div class="label">' +
				'<div class="course-progress">Course Progress</div>' +
				'<div class="remaining">{subLabel}</div>' +
			'</div>' +
		'</div>'}
	]),

	initComponent () {
		this.callParent(arguments);
	},

	beforeRender () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			containerClass: this.containerClass,
			pctComplete: this.pctComplete,
			subLabel: this.subLabel
		});
	}
});
