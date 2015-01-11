Ext.define('NextThought.view.courseware.dashboard.tiles.Header', {
	extend: 'Ext.Component',
	alias: 'widget.dashboard-header',

	cls: 'dashboard-header',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'span', cls: 'start'},
		'-',
		{tag: 'span', cls: 'end'}
	]),

	renderSelectors: {
		startEl: '.start',
		endEl: '.end'
	},


	setWeek: function(week) {
		if (!this.rendered) {
			this.on('afterrender', this.setWeek.bind(this, week));
			return;
		}

		this.startEl.update(week.start);
		this.endEl.update(week.end);
	}
});