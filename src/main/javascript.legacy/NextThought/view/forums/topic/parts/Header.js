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
			{cls: 'page', cn: [
				{tag: 'span', cls: 'current', html: ''}, ' {{{NextThought.view.forums.topic.parts.Header.of}}} ', {tag: 'span', cls: 'total', html: ''}
			]},
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
		pageEl: '.header-container .page',
		currentEl: '.header-container .page .current',
		totalEl: '.header-container .page .total'
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this,
			forumTitle = this.forum.get('title'),
			topicTitle = (this.record && this.record.get) ? this.record.get('title') : getString('NextThought.view.forums.topic.parts.Header.new'), tpl;

		tpl = new Ext.XTemplate(me.pathTpl);
		tpl.insertFirst(me.headerEl, {path: forumTitle, title: topicTitle}, true);

		//make sure it defaults to hidden
		this.pageEl.hide();

		this.updateNavigation();

		this.mon(this.nextEl, 'click', 'goToNext');
		this.mon(this.prevEl, 'click', 'goToPrev');

		this.mon(this.pageSource, 'update', 'updateNavigation');

		this.mon(this.headerEl, {
			'click': 'closeView',
			'mouseover': 'showTabMenu',
			'mouseout': 'hideTabMenu'
		});
	},


	updateNavigation: function() {
		if (!this.rendered || !this.pageSource || this.pageSource.disabled) { return; }

		var current = this.pageSource.getPageNumber();

		//if we have a next or previous enable the navigation arrows.
		if (this.pageSource.hasNext()) {
			this.nextEl.removeCls('disabled');
		} else {
			this.nextEl.addCls('disabled');
		}

		if (this.pageSource.hasPrevious()) {
			this.prevEl.removeCls('disabled');
		} else {
			this.prevEl.addCls('disabled');
		}

		if (current) {
			this.pageEl.show();
			this.currentEl.update(current);
			this.totalEl.update(this.pageSource.getTotal());
		} else {
			this.pageEl.hide();
		}
	},


	goToNext: function(e) {
		if (!e.getTarget('.disabled')) {
			this.fireEvent('goto-record', this.pageSource.getNext(true));
		}
	},


	goToPrev: function(e) {
		if (!e.getTarget('.disabled')) {
			this.fireEvent('goto-record', this.pageSource.getPrevious(true));
		}
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
