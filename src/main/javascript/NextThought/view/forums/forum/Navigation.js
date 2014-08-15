Ext.define('NextThought.view.forums.forum.Navigation', {
	extend: 'NextThought.view.forums.hierarchy.Navigation',
	alias: 'widget.forums-forum-nav',

	requires: [
		'NextThought.view.menus.Reports'
	],

	cls: 'topic-list-nav forum-nav',
	itemSelector: '.outline-row',

	ID_TO_BOARD: {},

	selModel: {
		preventFocus: true,
		allowDeselect: false,
		toggleOnClick: false,
		deselectOnContainerClick: false
	},

	tpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'nav-outline forum-outline scrollable', cn: [
			{cls: 'header toggle-opposite-tabs {[this.getHeaderCls()]}', html: '{{{NextThought.view.forums.forum.Navigation.header}}}'},
			{cls: 'outline-list', cn: [
				{tag: 'tpl', 'for': '.', cn: [
					{tag: 'tpl', 'if': 'values.divider', cn: {
						cls: 'group-header outline-row', 'data-depth': '{depth}', 'data-board': '{attr}', html: '{label}'
					}},
					//{tag: 'tpl', 'if': 'values.divider && values.depth < 0', cn: {
					//	cls: 'group-header outline-row add-forum', html: 'Add Forum'
					//}},
					{tag: 'tpl', 'if': '!values.divider', cn: [
						{cls: 'outline-row', 'data-qtip': '{title}', cn: [
							{tag: 'tpl', 'if': 'this.showReport(values)', cn: [
								{cls: 'report-icon', 'data-qtip': '{{{NextThought.view.forums.forum.Navigation.reports}}}'}
							]},
							{cls: 'label', html: '{title}'}
						]}
					]}
				]}
			]}
		]
	}), {
		getHeaderCls: function() {
			return this.noPop ? 'no-pop' : '';
		},
		showReport: function(value, out) {
			var show = false;

			if (isFeature('analytic-reports')) {
				(value.Links.asJSON() || []).forEach(function(link) {
					if (link.rel.indexOf('report-') >= 0) {
						show = true;
						return false;
					}
				});
			}

			return show;
		}
	}),


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.mon(me.el, {
			mouseover: 'maybeShowMenu',
			mouseout: 'maybeHideShowMenu',
			click: 'maybeShowNewForum'
		});

		me.on('select', function(cmp, record) {
			me.fireEvent('update-body', record);
		});

		me.on('beforeselect', function(cmp, record) {
			//don't allow headers to be selected
			return !(record instanceof NextThought.model.UIViewHeader);
		});
	},


	convertToRoot: function() {
		var me = this;

		me.tpl.noPop = true;
	},


	canCreateForums: function(record) {
		return record;// && isFeature('mutable-forums') && record.getLink('add');
	},


	buildStore: function(forumList) {
		var me = this,
			items = [];

		function addList(list, level) {
			var title;

			if (!Ext.isEmpty(list.title)) {
				items.push(NextThought.model.UIViewHeader.create({
					label: list.title,
					depth: level,
					attr: list.board && list.board.getId()
				}));
			}

			//if we have a store add the store's items
			if (list.store) {
				items = items.concat(list.store.getRange());

				//if (me.canCreateForums(list.board)) {
				//	items.push(NextThought.model.UIViewHeader.create({
				//		label: 'Add Forum',
				//		cls: 'add-forum',
				//		depth: -1
				//	}));
				//}
			}

			if (list.children) {
				list.children.forEach(function(child) {
					addList(child, level + 1);
				});
			}
		}

		(forumList || []).forEach(function(list) {
			addList(list, 0);

			if (list.board) {
				me.ID_TO_BOARD[list.board.getId()] = list.board;
			}
		});

		return Ext.data.Store.create({
			model: 'NextThought.model.forums.CommunityForum',
			data: items
		});
	},


	getFirstForum: function() {
		var first;

		this.store.each(function(record) {
			if (!(record instanceof NextThought.model.UIViewHeader)) {
				first = record;
			}

			return !first;
		});

		return first;
	},


	setCurrent: function(forumList) {
		var me = this,
			store = me.buildStore(forumList),
			selModel = me.getSelectionModel();

		me.bindStore(store);

		wait()
			.then(function() {
				return me.onceRendered;
			})
			.then(function() {
				return wait(); //wait for the listeners to have a change to be set up
			})
			.then(function() {
				if (forumList.activeNTIID) {
					selModel.select(store.getById(forumList.activeNTIID));
				} else {
					selModel.select(me.getFirstForum());
				}
			});

		return store;
	},


	setActiveRecord: function(record) {
		this.select([record], false, true);
	},


	maybeHideShowMenu: function(e) {
		if (e.getTarget('.header') && this.tabMenu) {
			this.tabMenu.stopShow();
		}
	},


	maybeShowMenu: function(e) {
		var header = e.getTarget('.header'), main;

		if (!e.getTarget('.has-alt-tabbar') || !header || this.hasNoTabbar) { return; }

		main = this.up('[getMainTabbarMenu]');

		if (!this.tabMenu) {
			this.tabMenu = main.getMainTabbarMenu(260, 'Discussions');

			if (!this.tabMenu) {
				this.hasNoTabbar = true;
				return;
			}

			this.tabMenu.addCls('forum-nav-tabmenu');

			this.mon(this.tabMenu, {
				scope: this,
				click: function(menu, item) {
					console.log('tab item clicked: ', arguments);
					this.fireEvent('main-tab-clicked', item);
				}
			});

			this.on('destroy', 'destroy', this.tabMenu);
		}

		this.tabMenu.startShow(header, 'tl-tl');
	},


	maybeShowNewForum: function(e) {
		if (e.getTarget('.new-forum') && this.canCreateForums()) {
			this.fireEvent('new-forum', this);
		}

		if (e.getTarget('.header:not(.no-pop)')) {
			this.fireEvent('pop-view');
		}
	},


	onItemClick: function(record, node, index, e) {
		if (e.getTarget('.report-icon')) {
			e.stopEvent();

			Ext.widget('report-menu', {
				links: record.getReportLinks(),
				showIfOne: true,
				showByEl: node
			});

			return false;
		}
	}
});
