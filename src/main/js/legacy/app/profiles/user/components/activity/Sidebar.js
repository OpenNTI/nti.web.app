const { subDays } = require('date-fns');

const Ext = require('@nti/extjs');

require('internal/legacy/app/stream/components/Filter');
require('internal/legacy/mixins/State');

module.exports = exports = Ext.define(
	'NextThought.app.profiles.user.components.activity.Sidebar',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.profile-user-activity-sidebar',

		STATE_KEY: 'profile-activity-filters',

		mixins: {
			State: 'NextThought.mixins.State',
		},

		layout: 'none',
		cls: 'activity-sidebar',

		items: [],

		getDefaultState() {
			return {
				sort: 'CreatedTime',
				batchAfter: 'anytime',
				accepts: 'all',
			};
		},

		getFilters() {
			function batchAfterGenerator(value) {
				let date = value && subDays(new Date(), value);

				if (date) {
					date = Math.floor(date.getTime() / 1000);
				}

				return date || null;
			}

			return [
				{
					displayText: 'Sort By',
					type: 'select',
					cls: 'sort-group',
					key: 'sort',
					items: [
						{
							displayText: 'Date Created',
							stateValue: 'CreatedTime',
							value: {
								on: 'CreatedTime',
								order: 'descending',
							},
						},
						{
							displayText: 'Recent Activity',
							stateValue: 'LastModified',
							value: {
								on: 'Last Modified',
								order: 'descending',
							},
						},
						{
							displayText: 'Most Commented',
							stateValue: 'ReferencedByCount',
							value: {
								on: 'ReferencedByCount',
								order: 'descending',
							},
						},
						{
							displayText: 'Most Liked',
							stateValue: 'RecursiveLikeCount',
							value: {
								on: 'RecursiveLikeCount',
								order: 'descending',
							},
						},
					],
				},
				{
					displayText: 'Date Range',
					type: 'single-select',
					cls: 'modifier',
					key: 'batchAfter',
					items: [
						{
							displayText: 'Anytime',
							stateValue: 'anytime',
							value: null,
						},
						{
							displayText: 'Past Week',
							stateValue: 'pastweek',
							value: batchAfterGenerator(7),
						},
						{
							displayText: 'Past Month',
							stateValue: 'pastmonth',
							value: batchAfterGenerator(30),
						},
						{
							displayText: 'Past 3 Months',
							stateValue: 'pastthreemonths',
							value: batchAfterGenerator(90),
						},
						{
							displayText: 'Past Year',
							stateValue: 'pastyear',
							value: batchAfterGenerator(360),
						},
					],
				},
				{
					displayText: 'Activity Type',
					type: 'multi-select',
					cls: 'activities',
					key: 'accepts',
					allParam: '*/*',
					paramRequired: true,
					items: [
						{
							displayText: 'Discussions',
							stateValue: 'discussions',
							value: [
								'application/vnd.nextthought.forums.dflheadlinetopic',
								'application/vnd.nextthought.forums.communityheadlinetopic',
								'application/vnd.nextthought.forums.generalforumcomment',
								'application/vnd.nextthought.forums.communityheadlinetopic',
							].join(','),
						},
						{
							displayText: 'Notes',
							stateValue: 'notes',
							value: 'application/vnd.nextthought.note',
						},
						{
							displayText: 'Thoughts',
							stateValue: 'thoughts',
							value: [
								'application/vnd.nextthought.forums.personalblogentry',
								'application/vnd.nextthought.forums.personalblogcomment',
							].join(','),
						},
						{
							displayText: 'Chat',
							stateValue: 'chat',
							value: 'application/vnd.nextthought.transcriptsummary',
						},
					],
				},
			];
		},

		initComponent() {
			this.callParent(arguments);

			this.filterCmp = this.add({
				xtype: 'stream-filter',
				filters: this.getFilters(),
				setState: this.setFilterState.bind(this),
			});
		},

		userChanged(entity) {
			// if (this.activeEntity !== entity) {
			// 	this.resetFilters();
			// 	this.updateFilterUI();
			// }

			this.activeEntity = entity;
			this.restoreState();
		},

		restoreState() {
			this.applyState(this.getCurrentState() || this.getDefaultState());
		},

		setStreamCmp(stream) {
			this.filterCmp.bindToStream(stream);
		},

		setFilterState(state) {
			this.setState(state);
		},

		applyState(state) {
			let url =
				this.activeEntity && this.activeEntity.getLink('Activity');

			if (url) {
				state.url = url;
				this.filterCmp.applyState(state);
			}
		},
	}
);
