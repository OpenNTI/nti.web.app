Ext.define('NextThought.controller.Navigation', {
	extend: 'Ext.app.Controller',

	require: [
		'NextThought.providers.Location'
	],

	views: [
		'menus.Flyout',
		'ViewSelect',
		'Views',
		'menus.account.Notifications'
	],

	init: function() {
		this.control({
			'nav-flyout': {
				'navigation-selected': function(ntiid){
					LocationProvider.setLocation(ntiid);
				}
			},
			'notifications-menuitem': {
				'navigation-selected': this.navigate
			},
			'contact-activity': {
				'navigation-selected': this.navigate
			},
			'main-views': {
				'activate-view': this.track
			},
			'view-select button': {
				toggle: this.switchViews
			}
		},{});
	},



	navigate: function(ntiid, scrollToTargetId) {
		var callback = Ext.emptyFn();
		if (scrollToTargetId) {
			callback = function(reader) {
				reader.scrollToTarget(IdCache.getComponentId(scrollToTargetId, null, reader.prefix));
			};
		}
		LocationProvider.setLocation(ntiid, callback, this);
	},


	track: function(view){
		var query = 'view-select button[title='+Ext.String.capitalize(view)+'], view-select button[viewId='+view+']',
			menus = Ext.getCmp('navigation-menu-container');
		try {

			Ext.ComponentQuery.query(query)[0].toggle(true);
			menus.getLayout().setActiveItem(menus.down(view+'-menu'));

		}
		catch(e){
			console.error('Looks like the "'+view+'" button was not included or was typo\'ed', e.stack);
		}
	},


	switchViews: function(button, state){
		var id = button.viewId || button.title.toLowerCase();
		if(state){
			try {
				this.track(id);//always switch the menus even if the view is already active
				Ext.getCmp(id).activate();
			}
			catch(e){
				console.log('Oops, a view button was defined, but the related view was not added: '+id);
			}
		}
	}
});
