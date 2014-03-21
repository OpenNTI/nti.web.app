Ext.define('NextThought.view.courseware.info.Roster', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-roster',

	requires: [
		'NextThought.ux.FilterMenu'
	],

	ui: 'course-assessment',
	cls: 'course-performance make-white',

	layout: 'anchor',


	items: [
		{
			cls: 'course-performance-header',
			xtype: 'container',
			layout: 'auto',
			items: [
				{ xtype: 'grade-chart' },
				{ xtype: 'box', cls: 'label', html: 'Enrollment Breakdown' }
			]
		}, {
			xtype: 'grouping',
			title: 'Roster',
			anchor: '0 -200',
			layout: 'fit',
			cls: 'roster',
			tools: [{
				itemId: 'filtermenu',
				autoEl: { tag: 'span', cls: 'tool link arrow'}
			}],
			items: [
				{
					xtype: 'grid',
					scroll: 'vertical',
					columns: [
						{ text: 'Name', dataIndex: 'realname', flex: 1 },
						{ text: 'Username', dataIndex: 'username' },
						{ text: 'Status', dataIndex: 'status' },
						{ text: '', dataIndex: '' }//disclosure column
					]
				}
			]
		}, {
			xtype: 'filter-menupanel',
			minWidth: 250,
			searchPlaceHolderText: 'Search Students',
			filters: [
				{ text: 'All Students', filter: '*'},
				{ text: 'Enrolled Students', filter: 'ForCredit'},
				{ text: 'Open Students', filter: 'Open'}
			]
		}
	],


	afterRender: function() {
		this.callParent(arguments);
		this.filterMenu = this.down('filter-menupanel');
		this.filterLink = this.down('[itemId=filtermenu]');
		this.mon(this.filterLink, {
			el: {
				scope: this,
				click: 'onFilterClicked'
			}
		});

		this.filterMenu.setState('ForCredit');
	},


	updateFilterCount: function() {
		if (!this.rendered) {
			this.on('afterrender', 'updateFilterCount', this);
			return;
		}

		var el = this.filterLink.el;
		el.update(this.filterMenu.getFilterLabel());
		el.repaint();
	},


	onFilterClicked: function() {
		this.filterMenu.showBy(this.filterLink.el, 'tl-tl', [0, -39]);
	},


	setContent: function(instance) {
		var roster = instance && instance.getLink('CourseEnrollmentRoster'),
			smallRequestURLToGetCounts = Ext.String.urlAppend(
					roster,
					Ext.Object.toQueryString({
						batchSize: 1,
						batchStart: 0,
						filter: 'LegacyEnrollmentStatusForCredit'
					}));

		Service.request(smallRequestURLToGetCounts)
				.then(JSON.parse)
				.then(this.fillCounts.bind(this))
				.fail(this.clearCounts.bind(this));
	},


	clearCounts: function() {
		this.setCount('*', 0);
		this.setCount('Open', 0);
		this.setCount('ForCredit', 0);
	},


	setCount: function(field, count) {
		var m = this.down('filter-menupanel [filter="' + field + '"]');
		if (m) { m.setCount(count); }
		else { console.warn('Could not find filter: ' + field); }
	},


	fillCounts: function(serverResponse) {
		var totalKey = 'TotalItemCount',
			forCreditKey = 'Filtered' + totalKey,
			total = serverResponse[totalKey],
			forCredit = serverResponse[forCreditKey],
			open = total - forCredit;

		this.setCount('*', total);
		this.setCount('Open', open);
		this.setCount('ForCredit', forCredit);
		this.updateFilterCount();
	}
});
