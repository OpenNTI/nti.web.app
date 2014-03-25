Ext.define('NextThought.view.courseware.info.Roster', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-roster',

	requires: [
		'NextThought.ux.FilterMenu',
		'NextThought.chart.Pie',
		'NextThought.proxy.courseware.Roster'
	],

	ui: 'course-assessment',
	cls: 'course-info-roster course-performance make-white',

	layout: 'anchor',


	items: [
		{
			cls: 'nti-header',
			xtype: 'container',
			layout: 'auto',
			items: [
				{ xtype: 'pie-chart', cls: 'roster', title: 'Enrollment Breakdown', series: [] }
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
					/*verticalScroller: {
						synchronousRender: true,
						scrollToLoadBuffer: 100,
						trailingBufferZone: 100,
						numFromEdge: 50,
						leadingBufferZone: 150
					},*/
					scroll: 'vertical',
					columns: [
						{
							text: 'Student',
							xtype: 'templatecolumn',
							dataIndex: 'realname',
							padding: '0 0 0 30',
							flex: 1,
							possibleSortStates: ['ASC', 'DESC'],//restore the default order of state(since the grid reverses it)
							tpl: Ext.DomHelper.markup({
								cls: 'padded-cell user-cell', cn: [
									{ cls: 'avatar', style: {backgroundImage: 'url({Creator:avatarURL})'} },
									{ cls: 'name', html: '{Creator:displayName}'}
								]
							})
						},
						{ text: 'Username', dataIndex: 'username' },
						{ text: 'Status', sortable: false, dataIndex: 'LegacyEnrollmentStatus' },
						{
							//disclosure column
							sortable: false,
							hidden: !isFeature('roster-reports'),
							xtype: 'templatecolumn',
							width: 60,
							text: '', dataIndex: 'Creator',
							tpl: Ext.DomHelper.markup({
								cls: 'disclosure'
							})
						}
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


	initComponent: function() {
		this.callParent(arguments);
		this.filterMenu = this.down('filter-menupanel');
		this.grid = this.down('grid');

		this.buildDisclosureMenu();

		this.on({
			el: {
				mousewheel: 'onPushScroll',
				DOMMouseScroll: 'onPushScroll'
			}
		});

		this.filterMenu.setState('ForCredit');

		this.mon(this.filterMenu, {
			filter: 'doFilter',
			search: {fn: 'doSearch', buffer: 450}
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.filterLink = this.down('[itemId=filtermenu]');
		this.mon(this.filterLink, {
			el: {
				scope: this,
				click: 'onFilterClicked'
			}
		});

		this.mon(this.grid, 'itemClick', 'maybeShowDisclosureMenu');
	},


	buildDisclosureMenu: function() {
		var me = this,
			items = [
				{ text: 'Participation Report', handler: Ext.bind(me.showParticipationReport, me)}
			];

		me.disclosureMenu = Ext.widget('menu', {
			cls: 'roster-disclosure-menu',
			width: 200,
			ownerCt: this,
			offset: [0, 0],
			defaults: {
				ui: 'nt-menuitem',
				xtype: 'menuitem',
				cls: 'roster-disclosure-option',
				height: 40,
				plain: true
			},
			items: items
		});

		me.mon(me.disclosureMenu, {
			close: function() {
				delete me.activeParticipationLink;
			}
		});
	},


	onPushScroll: function pushScroll(e) {
		var d = e.getWheelDelta();

		console.debug(d);
	},


	updateFilterCount: function() {
		if (!this.rendered) {
			this.on('afterrender', 'updateFilterCount', this);
			return;
		}

		var el = this.filterLink.el;
		el.update(this.filterMenu.getFilterLabel(this.store.getTotalCount()));
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

		this.buildStore(roster);
		this.filterMenu.setState('*');

		Service.request(smallRequestURLToGetCounts)
				.then(JSON.parse)
				.then(this.fillCounts.bind(this))
				.fail(this.clearCounts.bind(this));
	},


	buildStore: function(url) {
		this.store = Ext.data.Store.create({
			fields: [
				{name: 'id', type: 'string', mapping: 'Username'},
				{name: 'username', type: 'string', mapping: 'Username', convert: function(v, r) {
					return (r.raw.LegacyEnrollmentStatus === 'ForCredit' && v) || ''; }},
				{name: 'Creator', type: 'singleItem', mapping: 'UserProfile' },
				{name: 'LegacyEnrollmentStatus', type: 'string'},
				{name: 'Links', type: 'auto'}
			],
			proxy: {
				type: 'nti.roster',
				url: url,
				source: '*'
			},
			pageSize: 50,
			buffered: true,
			remoteSort: true,
			remoteFilter: true
		});

		this.down('grid').bindStore(this.store);
		//TODO: only load if we're visible!
		this.store.load();
		Ext.destroy(this.storeMonitors);
		this.storeMonitors = this.mon(this.store, {destroyable: true, load: 'updateFilterCount'});
	},


	doSearch: function(str) {
		this.down('grid').getSelectionModel().deselectAll(true);
		this.store.filter([{id: 'search', property: 'usernameSearchTerm', value: str}]);
	},


	doFilter: function(filter) {
		try {
			this.down('grid').getSelectionModel().deselectAll(true);
			this.store.filter([
				{id: 'LegacyEnrollmentStatus', property: 'LegacyEnrollmentStatus', value: filter}
			]);
		} catch (e) {
			console.log('Meh');
		}
	},


	setSeries: function(total, open, forCredit) {
		this.down('pie-chart').setSeries([
			{value: open || 0, label: 'Open'},
			{value: forCredit || 0, label: 'For Credit'}
		]);
	},


	clearCounts: function() {
		this.setCount('*', 0);
		this.setCount('Open', 0);
		this.setCount('ForCredit', 0);
		this.setSeries();
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
		this.setSeries(total, open, forCredit);
		this.updateFilterCount();
	},


	maybeShowDisclosureMenu: function(grid, record, node, i, e) {
		var disclosure = e.getTarget('.disclosure'),
			pdfLink;

		if (!disclosure) {
			return;
		}

		(record.get('Links') || []).forEach(function(link) {
			if (link.rel === 'report-StudentParticipationReport.pdf') {
				pdfLink = link.href;
			}
		});

		if (!pdfLink) {
			console.error('No link for the student participation report');
			return;
		}

		this.activeParticipationLink = pdfLink;

		this.disclosureMenu.showBy(disclosure);

	},


	showParticipationReport: function() {
		if (!this.activeParticipationLink) {
			console.error('Cant open the particitpation report without a link');
			return;
		}

		var win = Ext.widget('iframe-window', {
			width: 700,
			saveText: 'Save Report',
			link: this.activeParticipationLink
		});

		win.show();
	}
});
