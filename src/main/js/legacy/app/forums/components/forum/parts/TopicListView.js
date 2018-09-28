const Ext = require('@nti/extjs');
const {Viewer} = require('@nti/web-reports');

const WindowsActions = require('legacy/app/windows/Actions');
const UserRepository = require('legacy/cache/UserRepository');
const CommunityHeadlineTopic = require('legacy/model/forums/CommunityHeadlineTopic');
const {isFeature, WAIT_TIMES} = require('legacy/util/Globals');
const {getString} = require('legacy/util/Localization');
const TimeUtils = require('legacy/util/Time');


require('legacy/mixins/UIHelpers');


module.exports = exports = Ext.define('NextThought.app.forums.components.forum.parts.TopicListView', {
	extend: 'Ext.view.View',
	alias: 'widget.forums-forum-topic-list-view',

	mixins: {
		UIHelpers: 'NextThought.mixins.UIHelpers'
	},

	require: [
		'NextThought.view.menus.Reports',
		'NextThought.app.windows.Actions'
	],

	// loadMask: {
	// 	hideMode: 'display',
	// 	msg: 'Loading...'
	// },

	cls: 'topic-list list scrollable',
	itemSelector: '.topic-list-item',
	preserveScrollOnRefresh: true,

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{ tag: 'tpl', 'for': '.', cn: [
			{ tag: 'tpl', 'if': 'isGroupHeader', cn: [
				{ cls: 'topic-list-header-item topic-list-item', html: '{groupName}'}
			]},
			{ tag: 'tpl', 'if': '!isGroupHeader', cn: [
				{ cls: 'topic-list-item', cn: [
					{ cls: 'controls', cn: [
						{ cls: 'favorite {favoriteState}' },
						{ cls: 'like {likeState} {[values.LikeCount==0?"":"keep"]}', html: '{[values.LikeCount==0?"":values.LikeCount]}' },
						{ tag: 'tpl', 'if': 'this.showReport(values)', cn: { cls: 'reports off', 'data-qtip': '{{{NextThought.view.forums.forum.parts.TopicListView.reports}}}'} }
					]},
					'{Creator:avatar()}',
					{ cls: 'header', cn: [
						{ cls: 'author', html: '{Creator:displayName}' },
						{ cls: 'title', html: '{title}'}
					]},
					{ cls: 'meta', cn: [
						{ tag: 'tpl', 'if': 'matches', cn: [
							{ tag: 'span', cls: 'matches', html: '{matches:plural("Match")} {{{NextThought.view.forums.forum.parts.TopicListView.for}}} &ldquo;{searchTerm}&rdquo;'}
						]},
						{ tag: 'span', cls: 'count', html: '{PostCount:plural(parent.kind)}'},
						{ tag: 'tpl', 'if': 'values[\'NewestDescendant\'] && values[\'NewestDescendant\'].isComment', cn: [
							{
								tag: 'span',
								cls: 'active',
								html: '{NewestDescendant.data.Creator:displayName("You")} {{{NextThought.view.forums.forum.parts.TopicListView.replied}}} {NewestDescendant.data.CreatedTime:ago}'
							}
						]},
						{ tag: 'tpl', 'if': '!values[\'NewestDescendant\'] || !values[\'NewestDescendant\'].isComment', cn: [
							{ tag: 'span', cls: 'active', html: '{Creator:displayName("You")} {{{NextThought.view.forums.forum.parts.TopicListView.posted}}} {CreatedTime:ago}'}
						]}
					]}
				]}
			]}
		]}
	]), {
		showReport: function (value) {
			var show = false;

			if (isFeature('analytic-reports')) {
				((value.Links && value.Links.asJSON()) || []).forEach(function (link) {
					if (link.rel.indexOf('report-') >= 0) {
						show = true;
						return false;
					}
				});
			}

			return show;
		}
	}),

	emptyText: Ext.DomHelper.markup({
		cls: 'empty-forum',
		html: getString('NextThought.view.forums.forum.parts.TopicListView.empty')
	}),


	collectData: function () {
		var r = this.callParent(arguments);
		r.kind = 'Comment';
		return r;
	},


	initComponent: function () {
		var me = this;
		me.callParent(arguments);

		me.tpl.searchTerm = 'adsfasdf';

		me.WindowActions = WindowsActions.create();

		if (!me.record.getLink('add')) {
			me.emptyText = Ext.DomHelper.markup({
				cls: 'empty-forum',
				html: getString('NextThought.view.forums.forum.parts.TopicListView.emptynoadd')
			});
		}

		if (me.filterBar) {
			me.mon(me.filterBar, {
				'sorters-changed': 'updateSort',
				'search-changed': 'updateSearch'
			});
		}

		if (me.header) {
			me.mon(me.header, {
				'page-change': 'updatePage',
				'new-topic': 'newTopic'
			});
		}
	},


	beforeRender: function () {
		this.callParent(arguments);

		this.loadMask.renderTo = this.ownerCt.el;
	},


	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.loadMask, {
			'beforeactivate': this.beforeLoadMask.bind(this),
			'beforehide': this.afterLoadMask.bind(this)
		});

		if (this.loadMask.isVisible) {
			this.beforeLoadMask();
		}

		this.fillElementToBottom(this.el.dom);
	},


	beforeLoadMask: function () {
		var top = this.el.dom.getBoundingClientRect().top,
			height = Ext.Element.getViewportHeight() - top;

		this.el.setStyle({height: height + 'px'});
		this.addCls('loading');
	},


	afterLoadMask: function () {
		this.el.setStyle({height: 'auto'});
		this.removeCls('loading');
	},


	fillInData: function (records, search) {
		(records || []).forEach(function (record) {
			var newest = record.get('NewestDescendant'),
				creator = newest && newest.get('Creator');

			record.setMatchCount(search);

			if (creator) {
				UserRepository.getUser(creator, function (u) {
					newest.set('Creator', u);
					record.set('NewestDescendant', newest);
				});
			}
		});
	},


	onItemClick: function (record, node, index, e) {
		var controls = e.getTarget('.controls'),
			reports = e.getTarget('.reports');

		if (controls && controls !== e.getTarget()) {
			e.stopEvent();
			if (e.getTarget('.favorite')) {
				record.favorite();
			} else if (e.getTarget('.like')) {
				record.like();
			} else if (reports) {
				record.getInterfaceInstance().then(newRecord => {
					Viewer.show(newRecord.Reports[0]);
				});
			}
			return;
		}

		if (record.get('isGroupHeader')) { return; }

		this.WindowActions.pushWindow(record, null, node, {}, {
			forum: this.record
		});
	},


	newTopic: function (header, forum, el) {
		this.WindowActions.showWindow('new-topic', null, el, null, {
			forum: forum
		});
	},


	groupers: {
		active: {
			direction: 'DESC',
			property: 'NewestDescendantCreatedTime',
			sorterFn: function (a, b) {
				a = new Date(a.get('NewestDescendantCreatedTime')).setHours(0, 0, 0);
				b = new Date(b.get('NewestDescendantCreatedTime')).setHours(0, 0, 0);

				return a - b;
			},
			getGroupString: function (val) {
				var created = new Date(val.get('NewestDescendantCreatedTime'));

				created.setHours(0, 0, 0, 0);

				return TimeUtils.getTimeGroupHeader(created);
			}
		},
		created: {
			direction: 'DESC',
			property: 'CreatedTime',
			sorterFn: function (a, b) {
				a = new Date(a.get('CreatedTime')).setHours(0, 0, 0);
				b = new Date(b.get('CreatedTime')).setHours(0, 0, 0);

				return a - b;
			},
			getGroupString: function (val) {
				var created = new Date(val.get('CreatedTime'));

				created.setHours(0, 0, 0, 0);

				return TimeUtils.getTimeGroupHeader(created);
			}
		}
	},


	sorters: {
		created: {
			sortOn: 'createdTime',
			sortOrder: 'descending'
		},
		creator: {
			direction: 'ASC',
			property: 'Creator'
		},
		active: {
			sortOn: 'NewestDescendantCreatedTime',
			sortOrder: 'descending'
		},
		title: {
			sortOn: 'title',
			sortOrder: 'descending'
		},
		comment: {
			sortOn: 'PostCount',
			sortOrder: 'descending'
		},
		likes: {
			sortOn: 'LikeCount',
			sortOrder: 'descending'
		}
	},


	setGrouper: function (by) {
		var me = this, headers = [],
			grouper = this.groupers[by];

		function getHeader (name, value) {
			var header = CommunityHeadlineTopic.create();

			header.set(grouper.property, value);
			header.set('isGroupHeader', true);
			header.set('groupName', name);

			return header;
		}

		me.store.clearGrouping();

		me.store.each(function (rec) {
			if (rec.get('isGroupHeader')) {
				headers.push(rec);
			}
		});

		me.store.remove(headers);

		if (grouper) {
			me.store.sort({
				direction: 'DESC',
				sorterFn: function (a, b) {
					if (a.get('isGroupHeader')) {
						return 1;
					}
					if (b.get('isGroupHeader')) {
						return -1;
					}

					return 0;
				}
			});

			me.store.group(grouper, 'DESC');
			me.store.getGroups(false).forEach(function (g) {
				if (Ext.isEmpty(g.children) || g.name === 'Today') { return; }
				var child = g.children[0],
					header = getHeader(g.name, child.get(grouper.property));

				me.store.add(header);
			});
		}

		me.refresh();
	},


	addGrouper: function () {
		var by = this.filterBar.getSortBy();

		this.setGrouper(by);
	},


	restoreState: function (state) {
		state.currentPage = state.currentPage || {};
		state.currentPage[this.record.getId()] = state.currentPage[this.record.getId()] || 1;
		state.sortBy = state.sortBy || 'active';

		this.currentState = state;

		return this.applyState(state);
	},


	applyState: function (state) {
		if (this.applyingState) { return Promise.resolve();}

		var me = this,
			store = me.store,
			params = me.store.proxy.extraParams,
			currentPage;

		me.applyingState = true;

		if (state.sortBy) {
			params = Ext.apply(params || {}, me.sorters[state.sortBy]);
		} else {
			delete params.sortOn;
			delete params.sortOrder;
			delete params.sorters;
		}

		if (state.search) {
			params.searchTerm = state.search;
		} else {
			delete params.searchTerm;
		}

		if (this.topic) {
			params.batchAround = this.topic;
		}

		if (state.currentPage) {
			currentPage = state.currentPage[this.record.getId()] || 0;
		}

		//The store adds a sorter for any groupers at load time.  Make sure
		//we clear them out, they get applied after load anyway.
		me.setGrouper('');
		me.store.sorters.removeAll();

		return new Promise(function (fulfill) {
			me.mon(store, {
				single: true,
				load: function (s, records) {
					delete params.batchAround;

					me.fillInData(records, state.search);

					me.setGrouper(state.sortBy);

					me.currentPage = state.currentPage[me.record.getId()];
					me.currentSortBy = state.sortBy;
					me.currentSearch = state.search;

					me.updateUI();

					me.initialLoad = true;
					delete me.applyingState;

					fulfill();
				}
			});

			if (me.el) {
				me.el.mask('Loading...');
			}

			if (params.batchAround) {
				store.load();
			} else if (currentPage) {
				store.loadPage(currentPage);
			} else {
				store.loadPage(1);
			}
		})
			.then(Promise.minWait(WAIT_TIMES.SHORT))
			.then(() => {
				if (me.el) {
					me.el.unmask();
				}
			});
	},


	updateUI: function () {
		this.filterBar.setSortBy(this.currentSortBy);
		this.filterBar.setSearch(this.currentSearch);
	},


	updateView: function (store, records) {
		//since this is called as an event handler the second arg may not be an array of records.
		records = (Ext.isArray(records) && records) || null;
		var by = this.filterBar.getSortBy(),
			search = this.filterBar.getSearch();

		if (!this.fromMe) {
			this.fromMe = true;
			this.reloadStore(this.getSorter(by, search));
			return;
		}

		this.tpl.searchTerm = search;

		if (records) {
			this.fillInData(records, search);
		}

		delete this.fromMe;

		this.setGrouper(by);
	},


	updateFilter: function () {
		var state = this.currentState || {},
			newPage = state.currentPage[this.record.getId()] !== this.currentPage;

		if (this.currentSearch) {
			state.search = this.currentSearch;
		} else {
			delete state.search;
		}

		if (this.currentSortBy) {
			state.sortBy = this.currentSortBy;
		} else {
			delete state.sortBy;
		}

		if (this.currentPage) {
			state.currentPage = state.currentPage || {};
			state.currentPage[this.record.getId()] = this.currentPage;
		} else {
			delete state.currentPage;
		}

		this.currentState = state;

		if (newPage) {
			this.pushRouteState(state);
		} else {
			this.replaceRouteState(state);
		}
	},


	updateSort: function (sort, search) {
		this.currentSortBy = sort;
		this.currentSearch = search;

		this.updateFilter();
	},


	updateSearch: function (search) {
		this.currentSearch = search;

		this.updateFilter();
	},


	updatePage: function (page) {
		this.currentPage = page;

		this.updateFilter();
	}
});
