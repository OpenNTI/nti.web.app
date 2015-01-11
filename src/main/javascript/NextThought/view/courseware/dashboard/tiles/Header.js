Ext.define('NextThought.view.courseware.dashboard.tiles.Header', {
	extend: 'Ext.Component',
	alias: 'widget.dashboard-header',

	cls: 'dashboard-header',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', cn: [
			{tag: 'span', cls: 'start'},
			'-',
			{tag: 'span', cls: 'end'}
		]}
	]),

	renderSelectors: {
		labelEl: '.label',
		startEl: '.start',
		endEl: '.end'
	},


	setUpcoming: function() {
		if (!this.rendered) {
			this.on('afterrender', this.setUpcoming.bind(this));
			return;
		}

		this.labelEl.update('Upcoming');
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
