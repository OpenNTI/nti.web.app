Ext.define('NextThought.view.forums.topic.parts.Header', {
	extend: 'Ext.Component',
	alias: 'widget.forums-topic-header',

	cls: 'forum-body-header',

	pathTpl: Ext.DomHelper.markup([
		{cls: 'path', cn: [
			{tag: 'span', cls: 'part toggle-opposite-tabs menu-dropdown back-part', html: 'discussions'},
			{tag: 'span', cls: 'part back-part', 'data-qtip': '{path}', html: '{path}'},
			{tag: 'span', cls: 'part title-part current', 'data-qtip': '{title}' , html: '{title}'}
		]}
	]),

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header-container', cn: { cls: '{headerCls} navigation-bar', cn: [
			{tag: 'span', cls: 'location', html: ''},
			{cls: 'pager', cn: [
				{cls: 'prev disabled'},
				{cls: 'next disabled'}
			]}
		]}}
	]),

	renderSelectors: {
		headerEl: '.navigation-bar',
		prevEl: '.header-container .pager .prev',
		nextEl: '.header-container .pager .next',
		locationEl: '.header-container .location'
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this,
			forumTitle = this.forum.get('title'),
			topicTitle = this.record ? this.record.get('title') : 'New Discussion', tpl;

		tpl = new Ext.XTemplate(me.pathTpl);
		tpl.insertFirst(me.headerEl, {path: forumTitle, title: topicTitle}, true);

		//if (this.current >= 0 && this.total) {
		//	this.locationEl.update((this.current + 1) + ' of ' + this.total);
		//}

		if (this.nextIndex) {
			this.nextEl.removeCls('disabled');
			this.mon(this.nextEl, 'click', 'goToNext');
		}

		//it might be the first element index 0
		if (this.previousIndex > -1) {
			this.prevEl.removeCls('disabled');
			this.mon(this.prevEl, 'click', 'goToPrev');
		}

		this.mon(this.headerEl, {
			'click': 'closeView',
			'mouseover': 'showTabMenu',
			'mouseout': 'hideTabMenu'
		});
	},


	goToNext: function() {
		this.fireEvent('goto-index', this.nextIndex);
	},


	goToPrev: function() {
		this.fireEvent('goto-index', this.previousIndex);
	},

	hideTabMenu: function() {
		if (this.tabMenu) {
			this.tabMenu.stopShow();
		}
	},


	showTabMenu: function(e) {
		var dropdown = e.getTarget('.menu-dropdown'), main;

		if (!dropdown || this.hasNoTabbar) { return; }

		main = this.up('[getMainTabbarMenu]');

		if (!this.tabMenu) {
			this.tabMenu = main.getMainTabbarMenu(200, 'Discussions');

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

		this.tabMenu.startShow(dropdown, 'tl-bl', [-10, -10]);
	},


	closeView: function(e) {
		if (!e.getTarget('.back-part')) {
			return;
		}

		if (e.getTarget('.menu-dropdown')) {
			this.fireEvent('pop-to-root');
		} else {
			this.fireEvent('pop-view');
		}
	}
});
