Ext.define('NextThought.common.components.Navigation', {
	extend: 'Ext.Component',

	requires: [
		'NextThought.common.menus.LabeledSeparator'
	],

	cls: 'content-navigation',

	TAB_MARGIN: 35, //TODO: figure out how to now have this hard coded

	tabsTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'ul', cls: 'tabs', cn: [
			{tag: 'tpl', 'for': 'tabs', cn: [
				{
					tag: 'li',
					'data-index': '{#}',
					'data-route': '{route}',
					'data-root': '{root}',
					'data-subroute': '{subRoute}',
					'data-title': '{title}',
					'data-text': '{text}',
					cls: 'tab{[values.active ? " active": ""]}',
					html: '{text}'
				}
			]}
		]},
		{cls: 'show-more'}
	])),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'content-container', cn: [
			{cls: 'content', cn: [
				{cls: 'active-content', html: ''},
				{cls: 'quick-links disabled', html: ''},
				{cls: 'wrapper', cn: [
					{cls: 'tab-container'}
				]},
				{cls: 'active-tab'}
			]}
		]}
	]),


	renderSelectors: {
		titleEl: '.content .active-content',
		quickLinksEl: '.content .quick-links',
		tabContainerEl: '.content .tab-container',
		activeTabEl: '.content .active-tab'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.tabContainerEl, 'click', this.onTabClick.bind(this));
		this.mon(this.quickLinksEl, 'click', this.onQuickLinksClicked.bind(this));
		this.mon(Ext.getBody(), 'click', this.maybeHideDropdown.bind(this));

		if (this.tabs) {
			this.setTabs(this.tabs, true);
		}

		wait()
			.then(this.maybeCollapse.bind(this));
	},

	/**
	 * Add a list of quick links to other pieces of content
	 * links config: {
	 * 		route: String, //the route for the object
	 * 		title: String, //the title of the route
	 * 		text: String, //the text to show for this link
	 * 		active: Boolean // if this is the active link
	 * 		isLabel: Boolean // if this is just suppose to be a label in the menu
	 * }
	 *
	 * @param {Array} links [description]
	 */
	setQuickLinks: function(links) {
		if (!this.rendered) {
			this.on('afterrender', this.setQuickLinks.bind(this, links));
			return;
		}

		var active, items = [];

		if (!links || !links.length) {
			this.quickLinksEl.addCls('hidden disabled');
			this.titleEl.removeCls('has-quick-link');
			return;
		}

		if (this.__quickLinkMenu) {
			this.__quickLinkMenu.destroy();
		}

		links.forEach(function(link) {
			if (link.active) {
				active = link;
			} else if (link.isLabel) {
				items.push({
					xtype: 'labeledseparator',
					cls: 'seperator',
					text: link.text,
					height: 1
				});
			} else {
				items.push(link);
			}
		});

		this.quickLinksEl.removeCls('hidden');

		if (items.length) {
			this.quickLinksEl.removeCls('disabled');

			this.__quickLinkMenu = Ext.widget('menu', {
				cls: 'section-menu quick-link-menu',
				ui: 'quick-link',
				floating: true,
				constrain: true,
				constrainTo: Ext.getBody(),
				defaults: {
					xtype: 'menucheckitem',
					group: 'quickLinkOption',
					cls: 'section-option',
					height: 30,
					plain: true,
					listeners: {
						scope: this,
						'checkchange': this.quickLinkSelected.bind(this)
					}
				},
				items: items
			});
		}

		if (active) {
			this.quickLinksEl.update(active.text);
			this.titleEl.addCls('has-quick-link');
		}
	},


	/**
	 * Take an array of tabs to render in the navigation
	 * tab config: {
	 * 		route: String, //the name of the route this tab activates
	 * 		title: String, //the title of the route this tab activates
	 * 		text: String, //the name of the tab,
	 * 		active: Boolean //if this is the active tab
	 * }
	 * @param {Array} tabs a list of tab configs to show
	 */
	setTabs: function(tabs) {
		if (!this.rendered) {
			this.tabs = tabs;
			return;
		}

		var me = this,
			container = me.tabContainerEl,
			tabs, active;

		function alignCurrentTab() {
			//if for some reason the element was removed before we could call this
			if (!me.activeTabEl || !active) { return; }
			active = active.getBoundingClientRect();
			container = container.getBoundingClientRect();

			me.activeTabEl.setStyle({
				width: active.width + 'px',
				left: active.left - container.left + 'px'
			});
		}

		container.dom.innerHTML = '';

		tabs = me.tabsTpl.append(container, {tabs: tabs}, true);
		tabs = tabs && tabs.dom;
		active = tabs && tabs.querySelector('.tab.active');
		container = container && container.dom;

		//if we are animating in, wait until we are finished to the the left will be correct
		if (me.hasCls('showing')) {
			wait(1500)
				.then(alignCurrentTab);
		} else {
			alignCurrentTab();
		}

		this.maybeCollapse();
	},


	updateRoute: function(route, subRoute) {
		if (!this.rendered) {
			this.on('afterrender', this.updateRoute.bind(this, route, subRoute));
			return;
		}

		route = Globals.trimRoute(route);
		subRoute = Globals.trimRoute(subRoute);

		var tab = this.el.dom.querySelector('[data-route="' + route + '"]');

		if (tab) {
			if (subRoute) {
				tab.setAttribute('data-subroute', subRoute);
			} else {
				tab.removeAttribute('data-subroute');
			}
		}
	},


	maybeHideDropdown: function(e) {
		if (!e.getTarget('.content-navigation')) {
			this.removeCls('show-dropdown');
		}
	},


	toggleDropdown: function() {
		this[this.hasCls('show-dropdown') ? 'removeCls' : 'addCls']('show-dropdown');
	},


	onTabClick: function(e) {
		if (e.getTarget('.show-more')) {
			this.toggleDropdown();
			return;
		}

		var tab = e.getTarget('.tab'),
			route = tab && tab.getAttribute('data-route'),
			subRoute = tab && tab.getAttribute('data-subroute'),
			root = tab && (tab.getAttribute('data-root') || '');

		route = Globals.trimRoute(route);
		subRoute = Globals.trimRoute(subRoute);
		root = Globals.trimRoute(root);

		if (!tab || !this.bodyView.onTabChange) { return; }

		//if we are active and we have a subroute, that means the tab is not at
		//its root so set the root route
		if (tab.classList.contains('active') && subRoute) {
			this.bodyView.onTabChange(tab.getAttribute('data-title'), route + '/' + root, tab);
		} else {
			this.bodyView.onTabChange(tab.getAttribute('data-title'), route + '/' + subRoute, tab);
		}
	},


	quickLinkSelected: function(item) {
		if (this.bodyView.onQuickLinkNav) {
			this.bodyView.onQuickLinkNav(item.title, item.route);
		}
	},


	onQuickLinksClicked: function(e) {
		var rect = this.quickLinksEl.dom.getBoundingClientRect();

		if (this.__quickLinkMenu) {
			this.__quickLinkMenu.showBy(this.quickLinksEl);

			this.__quickLinkMenu.el.dom.style.top = rect.bottom + 'px';
			this.__quickLinkMenu.el.dom.style.left = rect.left + 'px';
		}
	},


	maybeCollapse: function(navWidth, barWidth) {
		barWidth = barWidth || this.barWidth;
		this.barWidth = barWidth;

		if (!this.el) { return; }

		var tabs = this.el.dom.querySelectorAll('li.tab'),
			shouldCollapse = false, numberToShow, dropdowns = 0;

		function collapse(li) {
			if (!li.classList.contains('dropdown')) {
				li.classList.add('dropdown');
			}

			li.style.top = (35 + (dropdowns * 35)) + 'px';
			dropdowns += 1;
		}

		function unCollapse(li) {
			if (!li.classList.contains('dropdown')) { return; }

			li.classList.remove('dropdown');
			li.style.top = null;
		}

		tabs = Array.prototype.slice.call(tabs);

		if (barWidth <= 630) {
			numberToShow = 3;
			shouldCollapse = true;
		} else if (barWidth <= 740) {
			numberToShow = 4;
			shouldCollapse = true;
		} else if (barWidth <= 860) {
			numberToShow = 4;
		} else {
			numberToShow = tabs.length;
		}

		console.log('Number To Show: ', numberToShow);

		tabs.forEach(function(tab, i) {
			if (i + 1 <= numberToShow) {
				unCollapse(tab);
			} else {
				collapse(tab);
			}
		});

		if (numberToShow < tabs.length) {
			this.addCls('has-more');
		} else {
			this.removeCls('has-more');
		}

		return shouldCollapse;
	}
});
