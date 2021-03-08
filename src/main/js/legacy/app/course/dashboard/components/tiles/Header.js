const { isSameMonth, format } = require('date-fns');

const Ext = require('@nti/extjs');

module.exports = exports = Ext.define(
	'NextThought.app.course.dashboard.components.tiles.Header',
	{
		extend: 'Ext.Component',
		alias: 'widget.dashboard-header',

		cls: 'dashboard-header',

		DATE_FORMAT: 'MMMM d',

		renderTpl: Ext.DomHelper.markup([
			{
				cls: 'label',
				cn: [
					{ tag: 'span', cls: 'start' },
					' &ndash; ',
					{ tag: 'span', cls: 'end' },
				],
			},
		]),

		renderSelectors: {
			labelEl: '.label',
			startEl: '.start',
			endEl: '.end',
		},

		setUpcoming: function () {
			if (!this.rendered) {
				this.on('afterrender', this.setUpcoming.bind(this));
				return;
			}

			this.labelEl.update('Upcoming');
		},

		setWeek: function (week) {
			if (!this.rendered) {
				this.on('afterrender', this.setWeek.bind(this, week));
				return;
			}

			if (isSameMonth(week.end, week.start)) {
				this.startEl.update(this.formatDate(week.start));
				this.endEl.update(format(week.end, 'd'));
			} else {
				this.startEl.update(this.formatDate(week.start));
				this.endEl.update(this.formatDate(week.end));
			}
		},

		formatDate: function (date) {
			return format(date, this.DATE_FORMAT);
		},

		addLoadingMask: function () {
			if (!this.rendered) {
				this.on('afterrender', this.addLoadingMask.bind(this));
				return;
			}

			this.addCls('loading');
			this.el.mask('loading...');
		},

		removeLoadingMask: function () {
			if (!this.rendered) {
				this.on('afterrender', this.removeLoadingMask.bind(this));
				return;
			}

			this.addCls('loading');
			this.el.unmask();
		},
	}
);
