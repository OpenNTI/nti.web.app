const Ext = require('@nti/extjs');
const { encodeForURI } = require('@nti/lib-ntiids');

const UIViewHeader = require('legacy/model/UIViewHeader');
const {isFeature} = require('legacy/util/Globals');
const WindowsActions = require('legacy/app/windows/Actions');

require('legacy/util/Parsing');
require('legacy/common/menus/Reports');

module.exports = exports = Ext.define('NextThought.app.forums.components.forum.Navigation', {
	extend: 'Ext.view.View',
	alias: 'widget.forums-forum-nav',
	cls: 'topic-list-nav forum-nav',
	itemSelector: '.outline-row',
	ID_TO_BOARD: {},

	selModel: {
		preventFocus: true,
		allowDeselect: false,
		toggleOnClick: false,
		deselectOnContainerClick: false
	},
	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'nav-outline forum-outline scrollable', cn: [
				{cls: 'header', html: '{{{NextThought.view.forums.forum.Navigation.header}}}'},
				{cls: 'outline-list' },
				{ cls: 'new-forum', html: '{{{NextThought.view.forums.forum.Navigation.addforum}}}' },
			]
		}
	]),

	tpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'tpl', 'for': '.', cn: [
			{tag: 'tpl', 'if': 'values.divider', cn: {
				cls: 'group-header outline-row', 'data-depth': '{depth}', 'data-board': '{attr}', html: '{label}'
			}},
			{tag: 'tpl', 'if': '!values.divider', cn: [
				{cls: 'outline-row', 'data-qtip': '{displayTitle}', cn: [
					{tag: 'tpl', 'if': 'this.showReport(values)', cn: [
						{cls: 'report-icon', 'data-qtip': '{{{NextThought.view.forums.forum.Navigation.reports}}}'}
					]},
					{cls: 'label', html: '{displayTitle}'}
				]}
			]}
		]
	}), {
		showReport: function (value, out) {
			var show = false;

			if (isFeature('analytic-reports')) {
				(value.Links.asJSON() || []).forEach(function (link) {
					if (link.rel.indexOf('report-') >= 0) {
						show = true;
						return false;
					}
				});
			}

			return show;
		}
	}),

	renderSelectors: {
		newForumEl: '.new-forum',
		frameBodyEl: '.outline-list'
	},

	getTargetEl: function () {
		return this.frameBodyEl;
	},

	initComponent () {
		this.callParent(arguments);

		this.WindowActions = WindowsActions.create();
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this;

		me.mon(me.el, {
			click: 'maybeShowNewForum'
		});

		const board = this.getBoardForSimplified();

		if (this.isSimplified() && board.hasLink('add')) {
			me.newForumEl.show();
		} else {
			me.newForumEl.hide();
		}

		me.on('select', me.selectForum.bind(this));
		me.mon(me.newForumEl, { click: 'createForum' });

		me.on('beforeselect', function (cmp, record) {
			//don't allow headers to be selected
			return !(record instanceof UIViewHeader);
		});
	},

	createForum () {
		const board = this.getBoardForSimplified();
		this.WindowActions.showWindow('new-forum', { board, onForumAdd: this.onForumAdd.bind(this)  });
	},


	getBoardForSimplified () {
		if (!this.forumList) { return; }

		const item = this.forumList[0] || {};

		if (item.board) {
			return item.board;
		}

		const forum = (item && item.children && item.children[0]) || {};
		return forum && forum.board;
	},


	getStoreForSimplified () {
		if (!this.forumList) { return {}; }

		const item = this.forumList[0] || {};

		if (item.store) {
			return item.store;
		}

		const forum = (item && item.children && item.children[0]) || {};
		return forum.store;
	},

	onForumAdd (forum) {
		const store = this.getStoreForSimplified();
		store.add(forum);
		this.buildStore(this.forumList);
	},

	canCreateForums: function (record) {
		return record;
	},

	buildStore: function (forumList) {
		if (forumList && forumList.isBoard) {
			forumList = [];
		}

		this.forumList = maybeSimplify(forumList);

		var me = this,
			store,
			items = [];

		function addList (list, level) {

			if (!Ext.isEmpty(list.title)) {
				items.push(UIViewHeader.create({
					label: list.title,
					depth: level,
					attr: list.board && list.board.getId()
				}));
			}

			if (list.store) {
				items = items.concat(list.store.getRange());
			}

			if (list.children) {
				list.children.forEach(function (child) {
					addList(child, level + 1);
				});
			}
		}

		(this.forumList || []).forEach(function (list) {
			addList(list, 0);

			if (list.board) {
				me.ID_TO_BOARD[list.board.getId()] = list.board;
			}
		});

		if (!me.store || me.store.storeId === 'ext-empty-store') {
			store = Ext.data.Store.create({
				model: 'NextThought.model.forums.CommunityForum',
				data: items
			});

			me.bindStore(store);
		} else {
			me.store.loadRecords(items);
		}
	},

	getFirstForum: function () {
		var first;

		this.store.each(function (record) {
			if (!(record instanceof UIViewHeader)) {
				first = record;
			}

			return !first;
		});

		return first;
	},

	setForumList: function (forumList) {
		this.buildStore(forumList);

		if (this.rendered) {
			const board = this.getBoardForSimplified();
			if (this.isSimplified() && board.hasLink('add')) {
				this.newForumEl.show();
			} else {
				this.newForumEl.hide();
			}
		}

		this.refresh();
	},

	selectRecord: function (id) {
		var record,
			selModel = this.getSelectionModel();

		if (id) {
			record = this.store.getById(id);
		}

		if (!id || !record) {
			record = this.getFirstForum();
		}

		selModel.select(record, false, true);

		return record;
	},

	maybeShowNewForum: function () {
		//TODO fill this in when we turn it back on
	},

	selectForum: function (cmp, record) {
		var id = record.getId();

		id = encodeForURI(id);


		this.pushRoute(record.get('title'), id, {
			forum: record
		});
	},

	onItemClick: function (record, node, index, e) {
		if (e.getTarget('.report-icon')) {
			e.stopEvent();

			Ext.widget('report-menu', {
				links: record.getReportLinks(),
				showIfOne: true,
				showByEl: node
			});

			return false;
		}
	},
});

function maybeSimplify (forumList) {
	//If we have more than one item, or its title is not Other Discussions we don't want to simplify it
	if (!forumList || forumList.length === 0 || forumList.length > 1 || forumList[0].title !== 'Other Discussions') { return forumList; }

	const forum = forumList[0];
	const children = forum.children;

	//If we only have one child for my section we don't need to show its title
	if (children.length === 1 && children[0].title === 'My Section') {
		children[0].title = '';
	}

	forum.title = '';

	return forumList;
}
