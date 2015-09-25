export default Ext.define('NextThought.app.course.dashboard.components.tiles.Header', {
	extend: 'Ext.Component',
	alias: 'widget.dashboard-header',

	cls: 'dashboard-header',

	DATE_FORMAT: 'MMMM D',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', cn: [
			{tag: 'span', cls: 'start'},
			' &ndash; ',
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

		var start = moment(week.start),
			end = moment(week.end);

		if (start.isSame(end, 'month')) {
			this.startEl.update(this.formatDate(start));
			this.endEl.update(end.format('D'));
		} else {
			this.startEl.update(this.formatDate(start));
			this.endEl.update(this.formatDate(end));
		}
	},

	formatDate: function(date) {
		return moment(date).format(this.DATE_FORMAT);
	},


	addLoadingMask: function() {
		if (!this.rendered) {
			this.on('afterrender', this.addLoadingMask.bind(this));
			return;
		}

		this.addCls('loading');
		this.el.mask('loading...');
	},


	removeLoadingMask: function() {
		if (!this.rendered) {
			this.on('afterrender', this.removeLoadingMask.bind(this));
			return;
		}

		this.addCls('loading');
		this.el.unmask();
	}
});
