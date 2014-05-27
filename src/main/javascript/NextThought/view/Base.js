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
		if (this.foceScrollZoneOut) {
			this.cssRule = CSSUtils.getRule('main-view-container-sytles', '#' + this.id);
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
		this.title = newTitle || this.title;
		if (this.isActive()) {
			document.title = this.title || 'NextThought';
		}
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


	activate: function(silent) {
		if (this.fireEvent('before-activate-view', this.getId()) && this.fireEvent('activate-view', this.getId(), Boolean(silent))) {
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


	getTitlePrefix: function() {return '';},


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
		if (this.rendered) {
			me.layout.setActiveItem(tab || me.defaultTab || 0);
			me.setTitle(me.getTitlePrefix());
		} else {
			me._setActiveTabAfterRender = me.mon(me, {
				destroyable: true, single: true,
				afterrender: function() {
					me.setActiveTab(tab);
					delete me._setActiveTabAfterRender;
				}
			});
		}
	}
});
