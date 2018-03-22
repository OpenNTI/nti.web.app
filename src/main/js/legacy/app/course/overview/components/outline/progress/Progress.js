const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.outline.progress.Progress', {
	extend: 'Ext.Component',
	alias: 'widget.overview-outline-progress',

	cls: 'outline-progress',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'progress-label', cn: [{
			cls: '{containerClass}', cn:[
				{
					tag: 'tpl', 'if': 'isCompleted', cn: [{
						html:
							'<div class="progress progress-complete-container">' +
								'<div class="progress-completed"><i class="icon-check"></i></div>' +
							'</div>'
					}]
				},
				{
					tag: 'tpl', 'if': 'showProgress', cn: [{
						html:
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
							'</svg>'
					},
					{
						cls: 'percentage-value', 'if': 'showProgress', html: '{pctComplete}'
					}],
				},
				{
					cls: 'label', html: '<div class="course-progress">Course Progress</div><div class="remaining">{subLabel}</div>'
				}
			]}
		]}
	]),

	initComponent () {
		this.callParent(arguments);
	},

	beforeRender () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			containerClass: this.containerClass,
			pctComplete: this.pctComplete,
			subLabel: this.subLabel,
			showProgress: !this.isCompleted,
			isCompleted: this.isCompleted
		});
	}
});
