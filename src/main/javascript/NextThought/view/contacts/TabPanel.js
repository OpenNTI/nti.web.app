Ext.define('NextThought.view.contacts.TabPanel', {
	extend: 'Ext.tab.Panel',
	alias: 'widget.contacts-tabs',
	requires: [
		'NextThought.view.contacts.Panel',
		'NextThought.view.contacts.Search'
	],

	defaultType: 'contacts-tabs-panel',
	plain: true,
	ui: 'contacts',
	minWidth: 550,

	tabBar: {
		plain: true,
		baseCls: 'nti',
		ui: 'contacts-tabbar',
		defaults: { plain: true, ui: 'contacts-tab' },
		xhooks: {
			afterRender: function () {
				this.callParent(arguments);
				var owner = this.up('contacts-tabs'),
					searchButtonEl = Ext.DomHelper.append(this.el, {cls: 'search', html: 'Search for contacts'}, true);
				owner.mon(searchButtonEl, 'click', owner.toggleSearch, owner);
				owner.searchBtn = searchButtonEl;

//Just in case the kiddos make it through to here don't give them search
				if (!$AppConfig.service.canFriend()) {
					searchButtonEl.hide();
				}
			}
		}
	},


	listeners: {
		tabchange: 'hideSearch'
	},


	initComponent: function () {
		var me = this;
		me.callParent(arguments);
		me.contactSearch = Ext.widget('contact-search', {floatParent: me, cls: 'contact-search large'});
		me.mon(me.contactSearch, {
			scope: me,
			show: me.onSearchShow,
			hide: me.onSearchHide
		});

		me.on('afterlayout', function () {
			me.contactSearch.setWidth(me.getWidth());
		});
	},


	afterRender: function () {
		this.callParent(arguments);
		if (Ext.is.iPad) {
			// Absorb event for scrolling
			this.getEl().dom.addEventListener('touchmove', function (e) {
				e.stopPropagation();
			});
		}
	},


	onAdded: function (parentCmp) {
		this.callParent(arguments);
		this.mon(parentCmp, 'deactivate', this.contactSearch.hide, this.contactSearch);
	},


	hideSearch: function () {
		var p = this.contactSearch;
		if (p) {
			p.hide();
		}
	},


	toggleSearch: function (e) {
		var p = this.contactSearch;

		if (e.getTarget('.search')) {
			p[p.isVisible() ? 'hide' : 'show']();
		}
		else {
			p.hide();
		}
	},


	onSearchShow: function (cmp) {
		var b = this.searchBtn,
			tab = this.tabBar.activeTab;

		if (!b) {
			return;
		}
		b.addCls('active');

		if (tab && tab.hasCls('x-tab-active')) {
			tab.removeCls('x-tab-active');
		}

		cmp.alignTo(b, 'tr-br', [0, -10]);
		Ext.defer(function () {
			cmp.down('simpletext').focus();
		}, 10);
	},


	onSearchHide: function () {
		var tab = this.tabBar.activeTab;
		if (this.searchBtn) {
			this.searchBtn.removeCls('active');
		}

		if (tab && !tab.hasCls('x-tab-active')) {
			tab.addCls('x-tab-active');
		}
	}
});
