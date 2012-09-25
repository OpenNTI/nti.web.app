Ext.define('NextThought.controller.Navigation', {
	extend: 'Ext.app.Controller',

	require: [
		'NextThought.providers.Location'
	],

	views: [
		'Navigation',
		'ViewSelect',
		'Views',
		'menus.Navigation'
	],

	init: function() {
		this.control({
			'navigation-collection': {
				'select': function(sm,rec){
					var ntiid = rec.get('NTIID');
					LocationProvider.setLastLocationOrRoot(ntiid);
				}
			},
			'notifications': {
				'navigation-selected': this.navigate
			},
			'activity-view': {
				'navigation-selected': this.navigate
			},
			'activity-preview': {
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



	navigate: function(ntiid, scrollToTargetId, reply) {
		var callback = Ext.emptyFn();
		if (scrollToTargetId) {
			callback = function(reader) {
				reader = (reader||ReaderPanel.get());
				var id = '',
					prefix = reader.prefix;

				function cid(id){ return IdCache.getComponentId(id, null, prefix); }

				if(Ext.isArray(scrollToTargetId)){

					Ext.each(scrollToTargetId, function(i){
						var c = null;
						if(IdCache.hasIdentifier(i)){
							id = cid(i);
							c = Ext.getCmp(id);
							if(c){
								c.fireEvent('open',scrollToTargetId.last(), reply? scrollToTargetId: undefined);
								return false; //stop iteration
							}
						}
						return true;
					});
				}
				else {
					id = cid(scrollToTargetId);
				}
                if (reader.scrollToTarget){
				    reader.scrollToTarget(id);
                }
			};
		}

		this.maybeLoadNewPage(ntiid, callback);
	},

	maybeLoadNewPage: function(id, cb){

		function loadPageId(pi){
			var pageId = pi.getId();

			if(LocationProvider.currentNTIID === pageId){
				Ext.callback(cb, this);
			}
			else {
				LocationProvider.setLocation(id, cb, this);
			}
		}

		function fail(){
			console.error('fail', arguments);
			Ext.callback(cb, this);
		}

		$AppConfig.service.getPageInfo(id, loadPageId, fail, this);
	},


	navigateAndScrollToTerm: function(ntiid,term){
		function callback(reader){
			(reader||ReaderPanel.get()).scrollToText(term);
		}

		LocationProvider.setLocation(ntiid, callback, this);
	},


	track: function(view){
		var query = 'view-select button[title='+Ext.String.capitalize(view)+'], view-select button[viewId='+view+']';
//			menus = Ext.getCmp('navigation-menu-container');
		try {

			Ext.ComponentQuery.query(query)[0].toggle(true);
//			menus.getLayout().setActiveItem(menus.down(view+'-menu'));

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
