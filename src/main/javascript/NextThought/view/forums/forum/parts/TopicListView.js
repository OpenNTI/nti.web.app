Ext.define('NextThought.view.forums.forum.parts.TopicListView', {
	extend: 'Ext.view.View',
	alias: 'widget.forums-forum-topic-list-view',

	require: [
		'NextThought.view.menus.Reports'
	],

	cls: 'topic-list list scrollable scroll-content',
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
						{ cls: 'like {likeState} {[values.LikeCount==0?\"\":"keep"]}', html: '{[values.LikeCount==0?\"\":values.LikeCount]}' },
						{ tag: 'tpl', 'if': 'this.showReport(values)', cn: { cls: 'reports off', 'data-qtip': 'Reports'} }
					]},
					{ cls: 'avatar', style: 'background: url({Creator:avatarURL})'},
					{ cls: 'header', cn: [
						{ cls: 'author', html: '{Creator:displayName}' },
						{ cls: 'title', html: '{title}'}
					]},
					{ cls: 'meta', cn: [
						{ tag: 'tpl', 'if': 'matches', cn: [
							{ tag: 'span', cls: 'matches', html: '{matches:plural("Match", "Matches")} for &ldquo;{searchTerm}&rdquo;'}
						]},
						{ tag: 'span', cls: 'count', html: '{PostCount:plural(parent.kind)}'},
						{ tag: 'tpl', 'if': 'values[\'NewestDescendant\'] && values[\'NewestDescendant\'].isComment', cn: [
							{ tag: 'span', cls: 'active', html: '{NewestDescendant.data.Creator:displayName("You")} replied {NewestDescendant.data.CreatedTime:ago}'}
						]},
						{ tag: 'tpl', 'if': '!values[\'NewestDescendant\'] || !values[\'NewestDescendant\'].isComment', cn: [
							{ tag: 'span', cls: 'active', html: '{Creator:displayName("You")} posted {CreatedTime:ago}'}
						]}
					]}
				]}
			]}
		]}
	]), {
		showReport: function(value) {
			var show = false;

			if (isFeature('analytic-reports')) {
				((value.Links && value.Links.asJSON()) || []).forEach(function(link) {
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
		html: 'There are no active discussions. Be the first to start one.'
	}),


	collectData: function() {
		var r = this.callParent(arguments);
		r.kind = 'Comment';
		return r;
	},


	initComponent: function() {
		var me = this;
		me.callParent(arguments);

		me.tpl.searchTerm = 'adsfasdf';

		me.updateView();

		if (!me.record.getLink('add')) {
			me.emptyText = Ext.DomHelper.markup({
				cls: 'empty-forum',
				html: 'There are currently no active discussions in this forum.'
			});
		}

		if (me.filterBar) {
			me.mon(me.filterBar, {
				'sorters-changed': 'updateView',
				'search-changed': 'updateView'
			});
		}

		if (me.header) {
			me.mon(me.header, 'page-change', function() {
				me.mon(this.store, {
					single: true,
					load: 'addGrouper'
				});
			});
		}
	},


	fillInData: function(records, search) {
		(records || []).forEach(function(record) {
			var newest = record.get('NewestDescendant'),
				creator = newest && newest.get('Creator');

			record.setMatchCount(search);

			if (creator) {
				UserRepository.getUser(creator, function(u) {
					newest.set('Creator', u);
					record.set('NewestDescendant', newest);
				});
			}
		});
	},


	onItemClick: function(record, node, index, e) {
		var controls = e.getTarget('.controls'),
			reports = e.getTarget('.reports');

		if (controls && controls !== e.getTarget()) {
			e.stopEvent();
			if (e.getTarget('.favorite')) {
				record.favorite();
			} else if (e.getTarget('.like')) {
				record.like();
			} else if (reports) {
				Ext.widget('report-menu', {
					links: record.getReportLinks(),
					showIfOne: true,
					showByEl: reports
				});
			}
			return;
		}

		if (record.get('isGroupHeader')) { return; }

		this.fireEvent('show-topic-list', this, this.record, record);
	},


	groupers: {
		active: {
			direction: 'DESC',
			property: 'NewestDescendantCreatedTime',
			sorterFn: function(a, b) {
				a = new Date(a.get('NewestDescendantCreatedTime')).setHours(0, 0, 0);
				b = new Date(b.get('NewestDescendantCreatedTime')).setHours(0, 0, 0);

				return a - b;
			},
			getGroupString: function(val) {
				var created = new Date(val.get('NewestDescendantCreatedTime'));

				created.setHours(0, 0, 0, 0);

				return TimeUtils.getTimeGroupHeader(created);
			}
		},
		created: {
			direction: 'DESC',
			property: 'CreatedTime',
			sorterFn: function(a, b) {
				a = new Date(a.get('CreatedTime')).setHours(0, 0, 0);
				b = new Date(b.get('CreatedTime')).setHours(0, 0, 0);

				return a - b;
			},
			getGroupString: function(val) {
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


	getSorter: function(by, searchTerm, batchAround) {
		var sort = this.sorters[by];

		sort.searchTerm = searchTerm || '';

		sort.batchAround = batchAround || '';

		return sort;
	},


	setGrouper: function(by) {

		function getHeader(name, value) {
			var header = NextThought.model.forums.CommunityHeadlineTopic.create();

			header.set(grouper.property, value);
			header.set('isGroupHeader', true);
			header.set('groupName', name);

			return header;
		}

		var me = this, headers = [],
			grouper = this.groupers[by];

		me.store.clearGrouping();

		me.store.each(function(rec) {
			if (rec.get('isGroupHeader')) {
				headers.push(rec);
			}
		});

		me.store.remove(headers);

		if (grouper) {
			me.store.sort({
				direction: 'DESC',
				sorterFn: function(a, b) {
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
			me.store.getGroups(false).forEach(function(g) {
				if (Ext.isEmpty(g.children) || g.name === 'Today') { return; }
				var child = g.children[0],
					header = getHeader(g.name, child.get(grouper.property));

				me.store.add(header);
			});
		}

		me.refresh();
	},


	addGrouper: function() {
		var by = this.filterBar.getSortBy();

		this.setGrouper(by);
	},


	reloadStore: function(sorter) {
		if (this.store.getCount() > 0) {
			this.store.removeAll(true);
			this.store.clearGrouping();
		}

		this.store.pageSize = 10;

		delete this.store.proxy.extraParams.sorters;

		this.store.proxy.extraParams = Ext.apply(this.store.proxy.extraParams || {}, sorter);

		this.mon(this.store, {
			single: true,
			load: 'updateView'
		});
		this.store.currentPage = 1;
		this.store.load();
	},


	updateView: function(store, records) {
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
	}
});
