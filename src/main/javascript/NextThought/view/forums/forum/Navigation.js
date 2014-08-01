Ext.define('NextThought.view.forums.forum.Navigation', {
	extend: 'NextThought.view.forums.hierarchy.Navigation',
	alias: 'widget.forums-forum-nav',

	requires: [
		'NextThought.view.menus.Reports'
	],

	cls: 'topic-list-nav forum-nav',
	itemSelector: '.outline-row',

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
					{cls: 'outline-row', 'data-qtip': '{title}', cn: [
						{tag: 'tpl', 'if': 'this.showReport(values)', cn: [
							{cls: 'report-icon', 'data-qtip': '{{{NextThought.view.forums.forum.Navigation.reports}}}'}
						]},
						{cls: 'label', html: '{title}'}
					]}
				]},
				{tag: 'tpl', 'if': 'this.showButton(values,out)', cn: [
					{cls: 'new-forum', html: '{{{NextThought.view.forums.forum.Navigation.addforum}}}'}
				]}
			]}
		]
	}), {
		showButton: function(value, out) {
			return this.canCreateForums;
		},
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
	},


	convertToRoot: function() {
		var me = this;

		me.tpl.noPop = true;
	},


	setCurrent: function(record, store) {
		this.record = record;
		this.bindStore(store);

		this.tpl.canCreateForums = this.canCreateForums();
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


	canCreateForums: function() {
		return isFeature('mutable-forums') && this.record.getLink('add');
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
