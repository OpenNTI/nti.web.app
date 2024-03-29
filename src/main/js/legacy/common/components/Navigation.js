const React = require('react');

const Ext = require('@nti/extjs');
const { wait } = require('@nti/lib-commons');
const { Navigation } = require('@nti/web-commons');
const { LinkTo } = require('@nti/web-routing');
const Globals = require('internal/legacy/util/Globals');

require('internal/legacy/overrides/ReactHarness');
require('../menus/LabeledSeparator');

module.exports = exports = Ext.define(
	'NextThought.common.components.Navigation',
	{
		extend: 'Ext.Component',
		cls: 'navigation content-navigation',
		TAB_MARGIN: 35,

		//TODO: figure out how to now have this hard coded

		tabsTpl: new Ext.XTemplate(
			Ext.DomHelper.markup([
				{
					tag: 'ul',
					cls: 'tabs',
					cn: [
						{
							tag: 'tpl',
							for: 'tabs',
							cn: [
								{
									tag: 'li',
									'data-index': '{#}',
									'data-route': '{route}',
									'data-root': '{root}',
									'data-subroute': '{subRoute}',
									'data-title': '{title}',
									'data-text': '{text}',
									cls: 'tab{[values.active ? " active": ""]}',
									html: '{text}',
								},
							],
						},
					],
				},
				{ cls: 'show-more' },
			])
		),

		quickLinksTpl: new Ext.XTemplate(
			Ext.DomHelper.markup([
				{
					tag: 'ul',
					cn: [
						{
							tag: 'tpl',
							for: 'links',
							cn: [
								{
									tag: 'li',
									cls: 'link',
									'data-index': '{#}',
									'data-route': '{route}',
									'data-title': '{title}',
									html: '{text}',
								},
							],
						},
					],
				},
			])
		),

		renderTpl: Ext.DomHelper.markup([
			{
				cls: 'content-container',
				cn: [
					{
						cls: 'content',
						cn: [
							{
								cls: 'active-content',
								'data-testid': 'content-context-switcher',
								cn: [
									{ cls: 'label' },
									{
										cls: 'title',
										'aria-label': 'recent courses',
									},
								],
							},
							{ cls: 'wrapper', cn: [{ cls: 'tab-container' }] },
							{ cls: 'active-tab' },
						],
					},
				],
			},
		]),

		previewTagTpl: new Ext.XTemplate(
			Ext.DomHelper.markup([
				{ tag: 'span', cls: 'preview', html: '{preview}' },
			])
		),

		renderSelectors: {
			activeContentEl: '.content .active-content',
			titleContainerEl: '.content .active-content .title',
			titleEl: '.content .active-content .title',
			labelEl: '.content .active-content .label',
			quickLinksEl: '.content .active-content .quick-links',
			tabContainerEl: '.content .tab-container',
			activeTabEl: '.content .active-tab',
		},

		afterRender: function () {
			this.callParent(arguments);

			this.mon(this.tabContainerEl, 'click', this.onTabClick.bind(this));
			this.mon(
				this.activeContentEl,
				'click',
				this.onActiveContentClicked.bind(this)
			);
			this.mon(Ext.getBody(), 'click', this.maybeHideDropdown.bind(this));

			if (this.tabs) {
				this.setTabs(this.tabs, true);
			}

			if (this.title) {
				this.updateTitle(this.title);
			}

			wait().then(this.maybeCollapse.bind(this));
		},

		beforeDestroy() {
			if (this.commonTabs) {
				this.commonTabs.destroy();
				delete this.commonTabs;
			}
		},

		updateTitle: function (newTitle) {
			if (!this.rendered) {
				this.title = newTitle;
				return;
			}

			this.titleEl.update(newTitle);
		},

		onMouseEnterTitle: function () {
			var el = this.titleContainerEl.dom,
				span = el.querySelector('span');

			//if we are wide enough to show the whole title don't do anything
			if (el.clientWidth >= span.offsetWidth) {
				return;
			}

			el.style.textIndent = el.clientWidth - span.offsetWidth + 'px';
		},

		onMouseLeaveTitle: function () {
			var el = this.titleContainerEl.dom;

			el.style.textIndent = 0;
		},

		/**
		 * Take an array of tabs to render in the navigation
		 * tab config: {
		 *		route: String, //the name of the route this tab activates
		 *		title: String, //the title of the route this tab activates
		 *		text: String, //the name of the tab,
		 *		active: Boolean //if this is the active tab
		 * }
		 *
		 * @param {Array} tabs a list of tab configs to show
		 * @returns {void}
		 */
		setTabs: function (tabs) {
			if (!this.rendered) {
				this.tabs = tabs;
				return;
			}

			var me = this,
				container = me.tabContainerEl,
				active;

			function alignCurrentTab() {
				//if for some reason the element was removed before we could call this
				if (!me.activeTabEl || !active) {
					return;
				}
				active = active.getBoundingClientRect();
				container = container.getBoundingClientRect();

				me.maybeCollapse();

				me.activeTabEl.setStyle({
					width: active.width + 'px',
					left: active.left - container.left + 'px',
				});
			}

			if (this.commonTabs) {
				this.commonTabs.destroy();
				delete this.commonTabs;
			}

			container.dom.innerHTML = '';

			tabs = me.tabsTpl.append(container, { tabs: tabs }, true);
			tabs = container && container.dom;
			active = tabs && tabs.querySelector('.tab.active');
			container = container && container.dom;

			//if we are animating in, wait until we are finished to the the left will be correct
			if (me.hasCls('showing')) {
				wait(1500).then(alignCurrentTab);
			} else {
				alignCurrentTab();
			}

			me.maybeCollapse();
		},

		useCommonTabs() {
			if (!this.rendered) {
				this.on('afterrender', this.useCommonTabs.bind(this));
				return;
			}

			if (this.commonTabs) {
				return;
			}

			const container = this.tabContainerEl;

			container.dom.innerHTML = '';

			function RenderTab(tabCmp, { route }) {
				return React.createElement(LinkTo.Path, { to: route }, tabCmp);
			}

			this.commonTabs = Ext.widget({
				xtype: 'react',
				addHistory: true,
				component: Navigation,
				renderTab: RenderTab,
				renderTo: container,
			});
		},

		updateRoute: function (route, subRoute) {
			if (!this.rendered) {
				this.on(
					'afterrender',
					this.updateRoute.bind(this, route, subRoute)
				);
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

		maybeHideDropdown: function (e) {
			if (!e.getTarget('.content-navigation')) {
				this.hideDropdown();
			}

			this.onBodyClick(e);
		},

		toggleDropdown: function () {
			this[this.hasCls('show-dropdown') ? 'removeCls' : 'addCls'](
				'show-dropdown'
			);
		},

		hideDropdown: function (e) {
			this.removeCls('show-dropdown');
		},

		onTabClick: function (e) {
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

			this.hideDropdown();

			if (!tab || !this.bodyView.onTabChange) {
				return;
			}

			//if we are active and we have a subroute, that means the tab is not at
			//its root so set the root route
			if (tab.classList.contains('active') && subRoute) {
				this.bodyView.onTabChange(
					tab.getAttribute('data-title'),
					route + '/' + root,
					tab
				);
			} else {
				this.bodyView.onTabChange(
					tab.getAttribute('data-title'),
					route + '/' + subRoute,
					tab
				);
			}
		},

		onActiveContentClicked: function (e) {},
		onBodyClick: function (e) {},

		maybeCollapse: function (navWidth, barWidth) {
			barWidth = barWidth || this.barWidth;
			this.barWidth = barWidth;

			if (!this.el) {
				return;
			}

			var tabs = this.el.dom.querySelectorAll('li.tab'),
				activeTabEl = this.activeTabEl,
				seeMoreEl = this.el.dom.querySelector('.show-more'),
				shouldCollapse = false,
				numberToShow,
				dropdowns = 0;

			function collapse(li) {
				if (!li.classList.contains('dropdown')) {
					li.classList.add('dropdown');
				}

				if (li.classList.contains('active')) {
					seeMoreEl.classList.add('active');
					activeTabEl.addCls('hidden');
				}

				li.style.top = 25 + dropdowns * 25 + 'px';
				dropdowns += 1;
			}

			function unCollapse(li) {
				if (li.classList.contains('active')) {
					seeMoreEl.classList.remove('active');
					activeTabEl.removeCls('hidden');
				}

				if (!li.classList.contains('dropdown')) {
					return;
				}

				li.classList.remove('dropdown');
				li.style.top = null;
			}

			tabs = Array.prototype.slice.call(tabs);

			if (navWidth <= 290) {
				numberToShow = 2;
				shouldCollapse = true;
			} else if (navWidth <= 410) {
				numberToShow = 3;
				shouldCollapse = true;
			} else if (navWidth <= 518) {
				numberToShow = 4;
				shouldCollapse = true;
			} else {
				numberToShow = tabs.length;
			}

			// if (barWidth <= 650) {
			//	numberToShow = 3;
			//	shouldCollapse = true;
			// } else if (barWidth <= 750) {
			//	numberToShow = 4;
			//	shouldCollapse = true;
			// } else if (barWidth <= 865) {
			//	numberToShow = 4;
			// } else {
			//	numberToShow = tabs.length;
			// }

			tabs.forEach(function (tab, i) {
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
		},
	}
);
