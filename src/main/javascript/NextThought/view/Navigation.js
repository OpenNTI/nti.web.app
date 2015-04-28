Ext.define('NextThought.view.Navigation', {
	extend: 'Ext.Component',
	alias: 'widget.main-navigation',
	requires: [
		'NextThought.view.menus.Navigation',
		'NextThought.view.menus.MostRecentContent',
		'NextThought.view.library.Collection'
	],

	cls: 'main-navigation',

	listeners: {
		click: {
			element: 'el',
			fn: 'onClick'
		},
		mouseover: {
			element: 'el',
			fn: 'onMouseOver'
		},
		mouseout: {
			element: 'el',
			fn: 'onMouseOut'
		}
	},

	recordHistory: [],

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'jump-menu',
			cn: [
				{ cls: 'branding' },
				{
					'data-view': 'content',
					'data-qtip': '{{{NextThought.view.Navigation.content}}}',
					cls: 'content x-menu',
					cn: [
						{ cls: 'box' },
						{ cls: 'image' },
						{
							cls: 'wrap',
							cn: [
								{ cls: 'provider' },
								{ cls: 'title' },
								{ cls: 'provider-bottom'}
							]
						}
					]
				}
			]
		},
		{ cls: 'library', 'data-qtip': '{{{NextThought.view.Navigation.library}}}', 'data-view': 'library', cn: [
			{cls: 'box'}
		]},
		{ cls: 'forums', 'data-qtip': '{{{NextThought.view.Navigation.forums}}}', 'data-view': 'forums', cn: [
			{cls: 'box'}
		] },
		{ cls: 'contacts', 'data-qtip': '{{{NextThought.view.Navigation.contacts}}}', 'data-view': 'contacts', cn: [
			{cls: 'box'}
		] },
		{ cls: 'search x-menu', 'data-qtip': '{{{NextThought.view.Navigation.search}}}', 'data-view': 'search', cn: [
			{cls: 'box'}
		] }
	]),

	renderSelectors: {
		imgEl: '.content .image',
		providerEl: '.content .wrap .provider',
		providerBottomEl: '.content .wrap .provider-bottom',
		titleEl: '.content .wrap .title',
		jumpEl: '.jump-menu',
		brandingEl: '.jump-menu .branding'
	},


	touchLibraryOpen: false,


	afterRender: function() {
		this.callParent(arguments);
		if (!Service.canHaveForum()) {
			this.el.down('.forums').remove();
		}

		if (!Service.canShare()) {
			this.el.down('.contacts').remove();
		}

		this.contentSwitcher = Ext.widget({
			viewId: 'content',
			xtype: 'most-recent-content-switcher',
			ownerNode: this.el.down('.content')
		});

		this.mon(this.contentSwitcher, 'update-current', 'updateFromRestore');

		this.items.push(this.contentSwitcher);
		if (this.jumpEl) {
			this.jumpEl.setVisibilityMode(Ext.Element.DISPLAY).hide();
		}

		this.searchMenu = Ext.widget(
				{
					viewId: 'search',
					showOnHover: false,
					xtype: 'navigation-menu',
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					overflowX: 'hidden',
					overflowY: 'hidden',
					cls: 'search-menu',
					containerNode: this.el,
					ownerNode: this.el.down('.search'),
					startHide: Ext.emptyFn,
					items: [
						{
							xtype: 'nti-searchfield'
						},
						{
							xtype: 'container',
							autoScroll: true,
							id: 'search-results',
							hideMode: 'display',
							flex: 1
						}
					],
					listeners: {
						hide: function() {
							if (this.ownerNode.hasCls('active')) {
								this.ownerNode.removeCls('active');

								if (this.reactivate) {
									this.reactivate.addCls('active');
								}
							}
						},
						show: function(m) {
							var el = this.containerNode.down('.active');
							this.reactivate = el && el.removeCls('active');
							this.ownerNode.addCls('active');
							m.down('nti-searchfield').focus(true, true);
						}
					}
				});

		this.items.push(this.searchMenu);
	},


	initComponent: function() {
		this.callParent(arguments);
		this.items = [];
		this.timers = {};
	},

	getViewId: function(el) {
		var e = Ext.get(el),
				attr = 'data-view',
				q = '[' + attr + ']',
				viewId = e && e.getAttribute(attr);

		if (Ext.isEmpty(viewId)) {
			e = e && (e.down(q) || e.up(q));
			viewId = e && e.getAttribute(attr);
		}

		return viewId;
	},


	track: function(rec, pop) {
		console.debug('(ROOT) Tracking navigation: %o, pop: %s', rec, Boolean(pop));
		if (pop) {
			rec = this.currentRecord = this.recordHistory.pop();
			return rec;
		}

		if (this.currentRecord && this.currentRecord !== rec) {
			this.recordHistory.push(this.currentRecord);
			if (this.recordHistory.length > 5) {
				this.recordHistory.shift();
			}
		}

		if (this.contentSwitcher) {
			this.contentSwitcher.track(rec);
		}

		if (this.jumpEl) {
			this.jumpEl.show();
		}

		this.currentRecord = rec;
		return rec;
	},


	getRefItems: function(deep) {
		var items = this.items,
				len = items.length,
				i = 0,
				item,
				result = [];

		for (i; i < len; i++) {
			item = items[i];
			result.push(item);
			if (deep && item.getRefItems) {
				result.push.apply(result, item.getRefItems(true));
			}
		}

		return result;
	},


	updateCurrent: function(pop, rec) {
		console.debug('(ROOT) Update Menu: %o, pop: %s', rec, Boolean(pop));
		if (rec instanceof NextThought.model.ContentPackage && rec.get('isCourse')) {
			//figure out the course record?
			return this;
		}

		rec = this.track(rec, pop === true);

		if (rec) {
			this.updateUI(rec);
		}
		else {
			if (this.jumpEl) {
				this.jumpEl.hide();
			}
		}
		return this;
	},


	updateFromRestore: function(rec) {
		this.updateUI(rec);
		if (this.jumpEl) {
			this.jumpEl.show();
		}
	},


	updateUI: function(rec) {
		var cls = 'is-book',
			img = this.imgEl,
			data = rec.asUIData(),
			label = getString('library:branding navigation-label', data.label);

		img.removeCls(cls);
		img[data.isCourse ? 'removeCls' : 'addCls'](cls);
		img.setStyle('background-image', 'url(' + (data.thumb || data.icon) + ')');

		if (label !== data.label) {
			this.providerEl.update(label);
			this.providerBottomEl.update(data.label);
		} else {
			this.providerEl.update(label);
		}

		if (data.vendorIcon) {
			this.brandingEl.addCls('custom-vendor');
			this.brandingEl.setStyle({backgroundImage: 'url(' + data.vendorIcon + ')'});
		} else {
			this.brandingEl.removeCls('custom-vendor');
			this.brandingEl.setStyle({backgroundImage: undefined});
		}

		this.titleEl.update(data.title);
	},


	setActive: function(view) {
		var id = view && (view.associatedParent || view.id);
		if (!this.el) {
			console.error('too soon');
			return;
		}

		this.el.select('[data-view]').removeCls('active');
		this.el.select('[data-view="' + id + '"]').addCls('active');
	},


	maybeStopTimer: function(viewId) {
		var el = this.el.down('.active');
		if (el && el.getAttribute('data-view') === viewId) {
			return;
		}

		clearTimeout(this.timers[viewId]);
	},


	showMenu: function(menu, delay) {
		var hideTimer, handlers;
		if (!delay) {
			menu.show();
		} else {
			this.timers[menu.viewId] = Ext.defer(menu.show, 500, menu);
		}

		if (menu.viewId === 'search') {
			return;
		}

		handlers = this.mon(menu, {
			destroyable: true,
			single: true,
			'show': function() {
        //				if (Ext.is.iPad) {
        //					menu.show();
        //				}
        //				else {
				hideTimer = Ext.defer(menu.hide, 1500, menu);
        //				}
			},
			'mouseover': function() {
        //				if (!Ext.is.iPad) {
				clearTimeout(hideTimer);
        //				}
			},
			'hide': function() {
        //				if (!Ext.is.iPad) {
				handlers.destroy();
        //				}
			}
		});

	},


	onClick: function(e) {
		var menu, target = e.getTarget('[data-view]', null, true), viewId = this.getViewId(target);

		if (!Ext.isEmpty(viewId)) {
			if (viewId === 'search') {
				menu = this.ownerCt.down('[viewId="' + viewId + '"]');

        //                if (Ext.is.iPad) { // hasCls seems to be undefined on iPad -- wasn't sure if I should just replace it
        //                    if (target.classList.contains('active')) {
        //                        menu.hide();
        //                    }
        //                    else {
        //                        this.showMenu(menu, false);
        //                    }
        //                }
        //                else {
				if (target.hasCls('active')) {
					menu.hide();
				} else {
					this.showMenu(menu, false);
				}
      //                }
			} else {
				this.maybeStopTimer(viewId);
			}

			this.fireEvent('view-selected', viewId);
		}

		return true;
	},


	onMouseOver: function(e) {
		var viewId = this.getViewId(e.getTarget('[data-view]')),
				menu, hideTimer, handlers;

		if (!Ext.isEmpty(viewId)) {
			clearTimeout(this.timers[viewId]);
			menu = this.ownerCt.down('[viewId="' + viewId + '"]');
			if (menu && menu.showOnHover !== false) {
				this.showMenu(menu, true);
			}
		}
	},


	onMouseOut: function(e) {
		var viewId = this.getViewId(e.getTarget('[data-view]'));
		if (!Ext.isEmpty(viewId)) {
			clearTimeout(this.timers[viewId]);
			delete this.timers[viewId];
		}
	},


	onClickTouch: function(el) {
		return this.onClick({getTarget: function() {
			return el;
		} });
	},


	onMouseOverTouch: function(el) {
		return this.onMouseOver({getTarget: function() {
			return el;
		} });
	},


	onMouseOutTouch: function(el) {
		return this.onMouseOut({getTarget: function() {
			return el;
		} });
	}
});
