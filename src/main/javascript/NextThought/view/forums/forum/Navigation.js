Ext.define('NextThought.view.forums.forum.Navigation', {
	extend: 'NextThought.view.forums.hierarchy.Navigation',
	alias: 'widget.forums-forum-nav',

	cls: 'topic-list-nav forum-nav',
	itemSelector: '.outline-row',

	selModel: {
		allowDeselect: false,
		toggleOnClick: false,
		deselectOnContainerClick: false
	},

	tpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'nav-outline forum-outline', cn: [
			{cls: 'header toggle-opposite-tabs', html: 'Forums'},
			{cls: 'outline-list', cn: [
				{tag: 'tpl', 'for': '.', cn: [
					{cls: 'outline-row', 'data-qtip': '{title}', cn: [
						{cls: 'label', html: '{title}'}
					]}
				]},
				{tag: 'tpl', 'if': 'this.showButton(values,out)', cn: [
					{cls: 'new-forum', html: 'Add a Forum'}
				]}
			]}
		]
	}), {
		showButton: function(value, out) {
			return this.canCreateForums;
		}
	}),


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, {
			mouseover: 'maybeShowMenu',
			mouseout: 'maybeHideShowMenu',
			click: 'maybeShowNewForum'
		});
	},


	setCurrent: function(record, store) {
		this.record = record;
		this.bindStore(store);

		this.tpl.canCreateForums = this.canCreateForums();
	},


	onItemClick: function(record) {
		this.fireEvent('update-body', record);
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
			this.tabMenu = main.getMainTabbarMenu(260);

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

		if (e.getTarget('.header')) {
			this.fireEvent('pop-view');
		}
	}
});
