Ext.define('NextThought.view.Base', {
	extend: 'Ext.container.Container',
	alias: 'widget.view-container',
	layout: 'fit',
	viewIdProperty: 'id',

	initComponent: function() {
		this.enableBubble('before-activate-view', 'activate-view', 'new-background');
		this.callParent(arguments);
		this.addCls('main-view-container make-white');
		this.on('added', 'monitorSizeAdjustments');
	},


	monitorSizeAdjustments: function(me, ct) {
		var sheet;
		if (this.forceScrollZoneOut) {
			this.cssRule = CSSUtils.getRule('main-view-container-styles', '#' + this.id);
			this.cssRule.style.setProperty('width', 'auto', 'important');
			this.cssRule.style.setProperty('left', '0', 'important');
			this.mon(ct, 'sides-adjusted', 'invertParentsPaddingToMargins');
		}
	},


	invertParentsPaddingToMargins: function(sides) {
		CSSUtils.set(this.cssRule, {
			marginLeft: (-sides.left) + 'px',
			marginRight: (-sides.right) + 'px'
		}, true);
	},


	setTitle: function(newTitle) {
		if (arguments.length > 0) {
			this.title = newTitle;
		}
		if (this.isActive()) {
			document.title = this.getTitle();
		}
	},


	getTitle: function() {
		var t = this.title;
		return this.getTitlePrefix() + (t ? (': ' + t) : '');
	},


	getFragment: function() {
		return null;
	},


	isActive: function() {
		return this.ownerCt ? (this.ownerCt.getLayout().getActiveItem() === this) : false;
	},


	beforeRestore: function() {
		return true;
	},


	activate: function(silent, force) {
		if (this.fireEvent('before-activate-view', this.getId(), force) && this.fireEvent('activate-view', this.getId(), Boolean(silent), force)) {
			this.setTitle();
			this.updateBackground();
			return true;
		}
		return false;
	},


	relayout: function() {
		this.updateLayout();
	},


	updateBackground: function() {
		this.fireEvent('new-background', this.backgroundUrl);
	},


	getTitlePrefix: function() {
		return getString('application.title-bar-prefix', 'NextThought');
	},


	getTabs: function() {
		var tabs = this.tabSpecs,
			active = this.layout && this.layout.getActiveItem && this.layout.getActiveItem(),
			activeId = active && active[this.viewIdProperty];

		Ext.each(tabs, function(t) {
			t.selected = (t.viewId.replace(/\?$/, '') === activeId);
		});

		return tabs;
	},


	parseTabSpec: function(tabSpec) {
		tabSpec = tabSpec || {};
		var re = this._tabSpecParser,
			r = {};
		if (!re) {
			re = this._tabSpecParser = /^([^\?]+)(\?)?$/;
		}

		re = re.exec(tabSpec.viewId) || ['', tabSpec.viewId];

		Ext.apply(r, {
			viewId: re[1],
			flagged: !!re[2]
		});


		return r;
	},


	onTabClicked: function(tabSpec) {
		if (!this.layout || !this.layout.getActiveItem) {
			return false;
		}
		var active = this.layout.getActiveItem(),
			target = this.parseTabSpec(tabSpec),
			vId = target.viewId,
			needsChanging = vId !== active[this.viewIdProperty],
		//only reset the view if we are already there and the spec flagged that it can be reset.
			reset = target.flagged && !needsChanging;

		if (Ext.isEmpty(vId)) {
			return false;
		}

		if (needsChanging) {
			this.setActiveTab(vId);
		} else if (reset) {
			console.log('ignore reset');
			return {};//truthy, but not "=== true"
		}

		return true;
	},


	updateTabs: function() {
		if (this.isVisible(true)) {
			this.fireEvent('update-tabs', this);
		}
	},


	setActiveTab: function(tab) {
		var me = this;
		return new Promise(function(fulfill) {
			if (me.rendered) {
				tab = me.getComponent(tab || me.defaultTab || 0);
				if (tab) {
					Promise.all([
						tab.onceRendered || Promise.resolve(tab),
						tab.onceLoaded || Promise.resolve([])
					]).then(fulfill);
				} else {
					fulfill();
				}

				me.layout.setActiveItem(tab);
				me.setTitle();
			} else {
				me._setActiveTabAfterRender = me.mon(me, {
					destroyable: true, single: true,
					afterrender: function() {
						delete me._setActiveTabAfterRender;
						me.setActiveTab(tab).then(fulfill);
					}
				});
			}
		});
	}
});
