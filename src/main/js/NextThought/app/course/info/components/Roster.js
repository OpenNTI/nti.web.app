Ext.define('NextThought.app.course.info.components.Roster', {
extend: 'Ext.container.Container',
	alias: 'widget.course-info-roster',

	requires: [
		'NextThought.common.ux.FilterMenu',
		'NextThought.common.chart.Pie',
		'NextThought.proxy.courseware.Roster',
		'NextThought.common.menus.Reports'
	],

	ui: 'course-assessment',
	cls: 'course-info-roster course-performance make-white',

	layout: 'anchor',
	margin: '0 0 10 0',

	items: [
		{
			cls: 'nti-header',
			xtype: 'container',
			layout: 'auto',
			items: [
				{ xtype: 'pie-chart', cls: 'roster', title: getString('NextThought.view.courseware.info.Roster.breakdown'), series: [] }
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
					layout: 'fit',
					/*verticalScroller: {
						synchronousRender: true,
						scrollToLoadBuffer: 100,
						trailingBufferZone: 100,
						numFromEdge: 50,
						leadingBufferZone: 150
					},*/
					scroll: 'vertical',
					margin: '0 0 72 0',		// Add some margin to account for the space taken by the header.
					columns: [
						{
							text: getString('NextThought.view.courseware.info.Roster.student'),
							xtype: 'templatecolumn',
							dataIndex: 'realname',
							padding: '0 0 0 30',
							flex: 1,
							possibleSortStates: ['ASC', 'DESC'],//restore the default order of state(since the grid reverses it)
							tpl: Ext.DomHelper.markup({
								cls: 'padded-cell user-cell', cn: [
									'{Creator:avatar}',
									{ cls: 'name', html: '{Creator:displayName}'}
								]
							})
						},
						{ text: getString('NextThought.view.courseware.info.Roster.username'),
							dataIndex: 'username', renderer: function(v, col, rec) {
								return rec.get('OU4x4') || v;
							}
						},
						{ text: getString('NextThought.view.courseware.info.Roster.status'), sortable: false, 
							xtype: 'templatecolumn',
							dataIndex: 'LegacyEnrollmentStatus',
							tpl: Ext.DomHelper.markup({
								cls: 'right-aligned status', html: '{LegacyEnrollmentStatus}'
							}) 
						},
						{
							//disclosure column
							sortable: false,
							hidden: !isFeature('analytic-reports'),
							xtype: 'templatecolumn',
							width: 60,
							text: '', dataIndex: 'Creator',
							tpl: Ext.DomHelper.markup({
								cls: 'disclosure report'
							})
						}
					]
				}
			]
		}, {
			xtype: 'filter-menupanel',
			minWidth: 250,
			searchPlaceHolderText: getString('NextThought.view.courseware.info.Roster.search'),
			filters: [
				{ text: getString('NextThought.view.courseware.info.Roster.all'), filter: '*'},
				{ text: getString('NextThought.view.courseware.info.Roster.enrolled'), filter: 'ForCredit'},
				{ text: getString('NextThought.view.courseware.info.Roster.open'), filter: 'Open'}
			]
		}
	],


	initComponent: function() {
		this.callParent(arguments);
		this.filterMenu = this.down('filter-menupanel');
		this.grid = this.down('grid');

		this.mon(this.filterMenu, {
			filter: 'doFilter',
			search: {fn: 'doSearch', buffer: 450}
		});

		this.on('activate', this.onActivate.bind(this));
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
		Ext.EventManager.onWindowResize(this.onWindowResize, this, false);
	},


	onActivate: function(){
		var grid = this.down('grid');
		if(grid && grid.store){
			grid.getView().refresh();
			wait().then(this.adjustHeight.bind(this));
		}
	},


	updateFilterCount: function() {
		if (!this.rendered) {
			this.on('afterrender', 'updateFilterCount', this);
			return;
		}

		var el = this.filterLink.el;
		el.update(this.filterMenu.getFilterLabel(this.store.getTotalCount()));
		el.repaint();

		// Bind store after load.
		this.down('grid').bindStore(this.store);
		wait().then(this.adjustHeight.bind(this));
	},


	__getGridMaxHeight: function() {
		// deduct in order Top NavBar, paddingtop, roster header, roster grouping, column header. 
		// TODO: Find a better way to do this.
		return Ext.Element.getViewportHeight() - 70 - 20 - 200 - 72 - 30;
	},


	adjustHeight: function() {
		var grid = this.down('grid'),
			scrollTarget = grid && grid.getScrollTarget(),
			currentHeight = scrollTarget && scrollTarget.getHeight(),
			maxHeight = this.__getGridMaxHeight();

		if (currentHeight > maxHeight && scrollTarget) {
			scrollTarget.el.setHeight(maxHeight);
			grid.el.setHeight(maxHeight + 30);
		}
	},


	onWindowResize: function() {
		var grid = this.down('grid'),
			scrollTarget = grid && grid.getScrollTarget(),
			currentHeight = scrollTarget && scrollTarget.getHeight(),
			maxHeight = this.__getGridMaxHeight();

		if (maxHeight > 0 && scrollTarget) {
			scrollTarget.el.setHeight(maxHeight);
			grid.el.setHeight(maxHeight + 30);
		}
	},


	onFilterClicked: function() {
		this.filterMenu.showBy(this.filterLink.el, 'tl-tl', [0, -39]);
	},


	setContent: function(instance) {
		var roster = instance && instance.getLink('CourseEnrollmentRoster'),
			smallRequestURLToGetCounts = roster && !Ext.isEmpty(roster) && Ext.String.urlAppend(
					roster,
					Ext.Object.toQueryString({
						batchSize: 1,
						batchStart: 0,
						filter: 'LegacyEnrollmentStatusForCredit'
					}));

		this.down('grid').bindStore(Ext.getStore('ext-empty-store'));

		this.filterMenu.setState('*');

		if (Ext.isEmpty(roster) || !roster) {
			if (this.store) {this.store.destroyStore();}
			return;
		}

		this.buildStore(roster);

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
			this.currentFilter = filter;
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
		var disclosure = e.getTarget('.disclosure'), menu;

		if (!disclosure) {
			return;
		}

		menu = Ext.widget('report-menu', {
			links: record.get('Links'),
			showByEl: disclosure
		});
	}
});
