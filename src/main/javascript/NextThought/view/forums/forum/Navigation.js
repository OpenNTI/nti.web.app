Ext.define('NextThought.view.forums.forum.Navigation', {
	extend: 'NextThought.view.forums.hierarchy.Navigation',
	alias: 'widget.forums-forum-nav',

	cls: 'topic-list-nav forum-nav',
	itemSelector: '.outline-row',
	tpl: Ext.DomHelper.markup({
		cls: 'nav-outline forum-outline', cn: [
			{cls: 'header', html: 'Forums'},
			{cls: 'outline-list', cn: [
				{tag: 'tpl', 'for': '.', cn: [
					{cls: 'outline-row', 'data-qtip': '{title}', cn: [
						{cls: 'label', html: '{title}'}
					]}
				]}
			]}
		]
	}),


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, 'mouseover', 'maybeShowMenu');
	},


	setCurrent: function(record, store) {
		this.record = record;
		this.bindStore(store);
	},


	onItemClick: function(record) {
		this.fireEvent('update-body', record);
	},


	setActiveRecord: function(record) {
		this.select([record]);
	},


	maybeShowMenu: function(e) {
		var header = e.getTarget('.header'), main;

		if (!e.getTarget('.has-alt-tabbar') || !header || this.hasNoTabbar) { return; }

		main = this.up('[getMainTabbarMenu]');

		if (!this.tabMenu) {
			this.tabMenu = main.getMainTabbarMenu();

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
	}
});
