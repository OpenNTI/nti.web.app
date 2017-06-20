const Ext = require('extjs');

const WindowsActions = require('legacy/app/windows/Actions');
const WindowsStateStore = require('legacy/app/windows/StateStore');
const PromptActions = require('legacy/app/prompt/Actions');
const CourseInstanceEnrollment = require('legacy/model/courses/CourseInstanceEnrollment');
const Email = require('legacy/model/Email');
const {isFeature} = require('legacy/util/Globals');
const {getString} = require('legacy/util/Localization');

require('legacy/app/invite/Prompt');
require('legacy/common/chart/Pie');
require('legacy/common/menus/Reports');
require('legacy/common/ux/FilterMenu');
require('legacy/proxy/courseware/Roster');


module.exports = exports = Ext.define('NextThought.app.course.info.components.Roster', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-roster',
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
				{
					xtype: 'pie-chart', cls: 'roster',
					title: getString('NextThought.view.courseware.info.Roster.breakdown'),
					series: [
						{
							label: 'Loading',
							value: 100
						}
					]
				}
			]
		}, {
			xtype: 'grouping',
			anchor: '0 -200',
			layout: 'fit',
			cls: 'roster',
			tools: [{
				itemId: 'filtermenu',
				autoEl: { tag: 'div', cls: 'tool link arrow title-filter'}
			},{
				itemId: 'invite',
				autoEl: { tag: 'div', cls: 'tool link invite', html: 'Invite'}
			},{
				itemId: 'email',
				autoEl: {tag: 'div', cls: 'tool link email', html: 'Email'}
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
							tpl: new Ext.XTemplate(Ext.DomHelper.markup({
								cls: 'padded-cell user-cell', cn: [
									'{Creator:avatar}',
									{ cls: 'name', html: '{Creator:displayName}'},
									{ cls: 'controls', cn: [
										{tag: 'span', cls: 'link email', 'data-user': '{[this.getUsername(values)]}', html: 'Email'}
									]}
								]
							}), {
								getUsername: function (values) {
									var user = values && values.Creator;
									return user && user.get && user.get('Username');
								}
							})
						},
						{ text: getString('NextThought.view.courseware.info.Roster.username'),
							dataIndex: 'username', renderer: function (v, col, rec) {
								return rec.get('OU4x4') || v;
							}
						},
						{ text: getString('NextThought.view.courseware.info.Roster.status'), sortable: false,
							xtype: 'templatecolumn',
							dataIndex: 'LegacyEnrollmentStatus',
							tpl: Ext.DomHelper.markup({
								cls: 'status', html: '{LegacyEnrollmentStatus}'
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

	renderSelectors: {
		emailEl: '.tools .email',
		inviteEl: '.tools .invite'
	},

	initComponent: function () {
		this.callParent(arguments);
		this.filterMenu = this.down('filter-menupanel');
		this.grid = this.down('grid');

		this.mon(this.filterMenu, {
			filter: 'doFilter',
			search: {fn: 'doSearch', buffer: 450}
		});

		this.WindowActions = WindowsActions.create();
		this.WindowStore = WindowsStateStore.getInstance();
		this.PromptActions = PromptActions.create();
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this;
		this.filterLink = this.down('[itemId=filtermenu]');
		this.mon(this.filterLink, {
			el: {
				scope: this,
				click: 'onFilterClicked'
			}
		});

		this.mon(this.grid, 'itemClick', 'handleClick');
		Ext.EventManager.onWindowResize(this.onWindowResize, this, false);
		me.on('destroy', function () {
			Ext.EventManager.removeResizeListener(me.onWindowResize, me);
		});
		// this.mon(this.inviteEl, 'click', this.openInvite.bind(this));
	},

	onRouteActivate: function () {
		if (this.initialLoad) {
			this.loadStore();
		} else {
			this.refreshRosterGrid();
		}
	},

	refreshRosterGrid () {
		const {grid} = this;
		if (grid && grid.store) {
			const view = grid.getView();
			const range = (view && view.getViewRange()) || [];

			if (range.length > 0 && this.initialLoad) {
				view.refresh();
				this.initialLoad = false;
			}

			setTimeout(() => this.adjustHeight(), 1);
		}
	},


	loadStore () {
		if (this.store) {
			if (this.el) {
				this.el.mask('Loading...');
			}

			this.store.load();
		}
	},


	onStoreLoad () {
		if (this.el) {
			this.el.unmask();
		}

		this.updateFilterCount();

		if (this.grid.store !== this.store) {
			// Bind store after load.
			this.grid.bindStore(this.store);
		}

		this.refreshRosterGrid();
	},


	updateFilterCount: function () {
		if (!this.rendered) {
			this.on('afterrender', 'updateFilterCount', this, {once: true});
			return;
		}

		const {el} = this.filterLink;
		el.update(this.filterMenu.getFilterLabel(this.store.getTotalCount()));
		el.repaint();
	},

	__getGridMaxHeight: function () {
		// deduct in order Top NavBar, paddingtop, roster header, roster grouping, column header.
		// TODO: Find a better way to do this.
		return Ext.Element.getViewportHeight() - 70 - 40 - 200 - 72 - 30;
	},

	adjustHeight: function () {
		var grid = this.grid,
			scrollTarget = grid && grid.getScrollTarget(),
			currentHeight = scrollTarget && scrollTarget.getHeight(),
			maxHeight = this.__getGridMaxHeight();

		if (currentHeight > maxHeight && scrollTarget) {
			scrollTarget.el.setHeight(maxHeight);
			this.el.setHeight(Ext.Element.getViewportHeight() - 90 - 20);
		}
	},

	onWindowResize: function () {
		var grid = this.grid,
			scrollTarget = grid && grid.getScrollTarget(),
			scrollHeight = scrollTarget && scrollTarget.el && scrollTarget.el.dom.scrollHeight,
			maxHeight = this.__getGridMaxHeight();

		if (scrollHeight > maxHeight) {
			scrollTarget.el.setHeight(maxHeight);
			this.el.setHeight(Ext.Element.getViewportHeight() - 90 - 20);
		}
	},

	onFilterClicked: function () {
		this.filterMenu.showBy(this.filterLink.el, 'tl-tl', [0, 30]);
	},

	setContent: function (instance) {
		if (instance === this.currentBundle) {
			return;
		}

		var roster = instance && instance.getLink('CourseEnrollmentRoster'),
			smallRequestURLToGetCounts = roster && !Ext.isEmpty(roster) && Ext.String.urlAppend(
					roster,
					Ext.Object.toQueryString({
						batchSize: 1,
						batchStart: 0,
						filter: 'LegacyEnrollmentStatusForCredit'
					}));

		this.grid.bindStore(Ext.getStore('ext-empty-store'));
		this.grid.getView().refresh();

		this.filterMenu.setState('*');

		this.currentBundle = instance;
		this.setupEmail();
		this.setupInvite();
		this.initialLoad = true;

		if (Ext.isEmpty(roster) || !roster) {
			if (this.store) {this.store.destroyStore();}
			return;
		}

		this.buildStore(roster);

		Service.request(smallRequestURLToGetCounts)
				.then(JSON.parse)
				.then(this.fillCounts.bind(this))
				.catch(this.clearCounts.bind(this));
	},

	buildStore: function (url) {
		this.store = Ext.data.Store.create({
			model: CourseInstanceEnrollment,
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

		Ext.destroy(this.storeMonitors);
		this.storeMonitors = this.mon(this.store, {
			destroyable: true,
			load: () => this.onStoreLoad()
		});
	},

	setupEmail: function () {
		var me = this;
		this.onceRendered
			.then(function () {
				me.emailEl = me.emailEl || me.el.down('.tools .email');
				if (!me.emailListenerSet && me.emailEl && me.shouldAllowInstructorEmail()) {
					me.emailListenerSet = true;
					me.mon(me.emailEl, 'click', 'showEmailEditor');
				}
				me.maybeShowEmailButton();
			});
	},

	setupInvite () {
		var me = this;
		this.onceRendered
			.then(() => {
				me.inviteEl = me.inviteEl || me.el.down('.tools .invite');
				if (!me.inviteListenerSet && me.inviteEl /* && me.shouldAllowInvite */) {
					me.inviteListenerSet = true;
					me.mon(me.inviteEl, 'click', 'showInvitePrompt');
				}
				me.maybeShowInviteButton();
			});
	},

	shouldAllowInstructorEmail: function () {
		// Right now, we will only
		return isFeature('instructor-email') && this.currentBundle && this.currentBundle.getLink('Mail');
	},

	maybeShowInviteButton () {
		let inviteLink = this.currentBundle && this.currentBundle.getLink('SendCourseInvitations');

		if (inviteLink) {
			this.inviteEl.show();
		} else {
			this.inviteEl.hide();
		}
	},

	maybeShowEmailButton: function () {
		if (!this.emailEl) {return; }

		if (this.shouldAllowInstructorEmail()) {
			this.emailEl.show();
		}
		else {
			this.emailEl.hide();
		}
	},

	showEmailEditor: function (e) {
		var emailRecord = new Email(),
			scope = this.currentFilter || 'All';

		if (scope === '*') {
			scope = 'All';
		}

		// Set the link to post the email to
		emailRecord.set('url', this.currentBundle && this.currentBundle.getLink('Mail'));
		emailRecord.set('scope', scope);

		this.WindowActions.showWindow('new-email', null, e.getTarget(), null, {
			record: emailRecord
		});
	},


	showInvitePrompt () {
		this.PromptActions.prompt('invite', {record: this.currentBundle});
	},


	doSearch: function (str) {
		this.grid.getSelectionModel().deselectAll(true);
		this.store.filter([{id: 'search', property: 'usernameSearchTerm', value: str}]);
	},

	doFilter: function (filter) {
		try {
			this.currentFilter = filter;
			this.grid.getSelectionModel().deselectAll(true);
			this.store.filter([
				{id: 'LegacyEnrollmentStatus', property: 'LegacyEnrollmentStatus', value: filter}
			]);
			this.maybeShowEmailButton();
		} catch (e) {
			console.log('Meh');
		}
	},

	setSeries: function (total, open, forCredit) {
		this.down('pie-chart').setSeries([
			{value: open || 0, label: 'Open'},
			{value: forCredit || 0, label: 'For Credit'}
		]);
	},

	clearCounts: function () {
		this.setCount('*', 0);
		this.setCount('Open', 0);
		this.setCount('ForCredit', 0);
		this.setSeries();
	},

	setCount: function (field, count) {
		var m = this.down('filter-menupanel [filter="' + field + '"]');
		if (m) { m.setCount(count); }
		else { console.warn('Could not find filter: ' + field); }
	},

	fillCounts: function (serverResponse) {
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

	handleClick: function (grid, record, node, i, e) {
		var menu,
			disclosure = e.getTarget('.disclosure');

		if (disclosure) {
			menu = Ext.widget('report-menu', {
				links: record.getReportLinks(),
				showByEl: disclosure
			});

			this.on('destroy', menu.destroy.bind(menu));
		} else if (e.getTarget('.email')) {
			this.openIndividualEmail(e);
		}
	},

	openIndividualEmail: function (e) {
		var target = e && e.getTarget('.email'),
			user = target && target.getAttribute('data-user'),
			rec, mailLink, emailRecord, r, creator;

		if (!user) { return; }

		// NOTE: normally, it's better to use store.findBy but
		// since the store is a buffered store, the above fails.
		// Do it the brutal force way.
		for (var i = 0; i < this.store.getCount() && !rec; i++) {
			r = this.store.getAt(i);
			creator = r && r.get('Creator');
			if (creator && creator.get('Username') === user) {
				rec = r;
			}
		}

		if (rec && rec.getLink('Mail')) {
			mailLink = rec.getLink('Mail');

			emailRecord = new Email();

			// Set the link to post the email to
			emailRecord.set('url', mailLink);
			emailRecord.set('Receiver', rec.get('Creator'));

			this.WindowActions.showWindow('new-email', null, target, null, {
				record: emailRecord
			});
		}
	},

	openInvite () {
		this.PromptActions.prompt('invite');
	}
});
