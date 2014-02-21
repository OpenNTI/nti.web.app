Ext.define('NextThought.view.forums.topic.parts.Header', {
	extend: 'Ext.Component',
	alias: 'widget.forums-topic-header',

	cls: 'forum-body-header',

	pathTpl: Ext.DomHelper.markup([
		{cls: 'path', cn: [
			{tag: 'span', cls: 'part toggle-opposite-tabs menu-dropdown', html: 'discussions'},
			{tag: 'span', cls: 'part back-part', html: '{path}'},
			{tag: 'span', cls: 'part title-part current', html: '{title}'}
		]}
	]),

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header-container', cn: { cls: '{headerCls} navigation-bar', cn: [
			{cls: 'pager', cn: [
				{cls: 'prev disabled'},
				{cls: 'next disabled'}
			]}
		]}}
	]),

	renderSelectors: {
		headerEl: '.navigation-bar',
		prevEl: '.header-container .pager .prev',
		nextEl: '.header-container .pager .next'
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this,
			forumTitle = this.forum.get('title'),
			topicTitle = this.record ? this.record.get('title') : 'New Discussion', tpl;

		tpl = new Ext.XTemplate(me.pathTpl);
		tpl.insertFirst(me.headerEl, {path: forumTitle, title: topicTitle}, true);

		if (this.nextIndex) {
			this.nextEl.removeCls('disabled');
			this.mon(this.nextEl, 'click', 'goToNext');
		}

		if (this.previousIndex) {
			this.prevEl.removeCls('disabled');
			this.mon(this.prevEl, 'click', 'goToPrev');
		}

		this.mon(this.headerEl, {
			'click': 'closeView',
			'mouseover': 'showTabMenu'
		});
	},


	goToNext: function() {
		this.fireEvent('goto-index', this.nextIndex);
	},


	goToPrev: function() {
		this.fireEvent('goto-index', this.previousIndex);
	},


	showTabMenu: function(e) {
		var dropdown = e.getTarget('.menu-dropdown'), main;

		if (!dropdown || this.hasNoTabbar) { return; }

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

		this.tabMenu.startShow(dropdown, 'tl-bl');
	},


	closeView: function(e) {
		if (!e.getTarget('.back-part')) {
			return;
		}
		this.fireEvent('pop-view');
	}
});
