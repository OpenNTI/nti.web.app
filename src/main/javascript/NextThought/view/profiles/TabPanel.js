Ext.define('NextThought.view.profiles.TabPanel',{
	extend: 'Ext.tab.Panel',
	alias: 'widget.profile-tabs',

	plain: true,
	ui: 'profile',
	
	componentLayout: 'profiletabpanel',

	tabBar: {
		plain: true,
		baseCls: 'nti',
		ui: 'profile-tabbar',
		cls: 'profile-tabs',
		defaults: { plain: true, ui: 'profile-tab' }
	}

});

/**
 * We need to prevent the layout manager from moving the tab panel back into its original dom position because we're
 * changing it in {@link NextThought.view.profiles.Panel#handleScrollHeaderLock}
 *
 * @see NextThought.view.profiles.Panel#handleScrollHeaderLock
 * @private Do not use this class anywhere else, it is very specific to THIS tab panel.
 */
Ext.define('NextThought.layout.component.ProbileTabPanelLayout', {
	extend: 'Ext.layout.component.Dock',
	alias: 'layout.profiletabpanel',
	type: 'profiletabpanel',

	/**
	 * The crux. The layout decideds to re-home the tabbar element if this method returns false.
	 *
	 * @param item {Ext.Component/HTMLElement/Ext.Element}
	 * @param target {Element/Ext.Element}
	 * @param position {Object} Ignored by this override
	 * @returns {boolean}
	 */
	isValidParent: function(item, target, position) {
		if (target.hasCls('x-panel-profile')) {
			return true;
		}

		return this.callParent(arguments);
	}
});
