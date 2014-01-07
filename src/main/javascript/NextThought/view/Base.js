Ext.define('NextThought.view.Base', {
	extend: 'Ext.container.Container',
	alias: 'widget.view-container',
	layout: 'fit',
	viewIdProperty: 'id',

	initComponent: function() {
		this.enableBubble('before-activate-view', 'activate-view', 'new-background');
		this.callParent(arguments);
		this.addCls('main-view-container make-white');
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


	onTabClicked: function(tabSpec) {
		if (!this.layout || !this.layout.getActiveItem) {
			return false;
		}

		var active = this.layout.getActiveItem(),
				targetView = /^([^\?]+)(\?)?$/.exec(tabSpec.viewId) || [tabSpec.viewId],
				vId = targetView[1],
				needsChanging = vId !== active[this.viewIdProperty],
		//only reset the view if we are already there and the spec flagged that it can be reset.
				reset = !!targetView[2] && !needsChanging;

		if (Ext.isEmpty(vId)) {
			return false;
		}

		if (needsChanging) {
			this.setActiveTab(vId);
			//			this.pushState({activeTab: vId});
		} else if (reset) {
			console.log('ignore reset');
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
