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



	scrollToObject: function(target, reply){
		target = Ext.isArray(target)? target : [target];

		var me = this;


		function findExisting(prefix) {
			function cid(id){ return IdCache.getComponentId(id, null, prefix); }
			var id = null;
			Ext.each(target, function(i){
				var c = cid(i);
				if(Ext.getCmp(c)){
					id = c;
				}
				return !id;
			});
			return id;
		}


		function localCondition(id,reader){
			var c = Ext.getCmp(id);
			if(c){
				c.fireEvent('open',target.last(), reply? target: undefined);
			}

			if (reader.scrollToTarget){
				reader.scrollToTarget(id);
			}
		}



		return function(reader) {
			reader = (reader||ReaderPanel.get());
			var id = findExisting(reader.prefix),
				service = $AppConfig.service;



			function loaded(object){
                var c = object.get('ContainerId'),
                    inReplyTo = object.get('inReplyTo'),
                    s = LocationProvider.getStore(c).hasOwnProperty('data'),
                    ref, scrollToReplyId = undefined;

                function afterLoadedAgain(object){
                    if(!s){
                        console.warn('\n\n\n\n\n\n\nNo Store for: '+c+'\n\n\n\n\n\n');
                    }

                    Ext.widget('note-window', { scrollToId: scrollToReplyId, annotation: {getRecord:function(){return object;}}}).show();

                    reader.scrollToContainer(c);
                }

                //in cases where we are scrolling to a reply, attempt to reload here with the root.
                if (inReplyTo){
                    scrollToReplyId = object.getId();
                    ref = object.get('references').first();
                    if (!ref){
                         console.warn('inReplyTo set but no references found');
                    }
                    service.getObject(ref, afterLoadedAgain, function(){
                        afterLoadedAgain(object);
                        console.log('Root note unresolvable, using reply instead.');
                    }, me);
                }
                else {
                    afterLoadedAgain(object);
                }
			}


			function fail(){
				console.warn('failed?', arguments);
			}


			if(id){
				localCondition(id,reader);
				return;
			}

			service.getObject(target.last(), loaded, fail, me);
		};
	},


	navigate: function(ntiid, scrollToTargetId, reply) {
		var callback = Ext.emptyFn();
		if (scrollToTargetId) {
			callback = this.scrollToObject(scrollToTargetId, reply);
		}

		this.maybeLoadNewPage(ntiid, callback);
	},


	navigateAndScrollToTerm: function(ntiid,term){
		function callback(reader){
			(reader||ReaderPanel.get()).scrollToText(term);
		}

		LocationProvider.setLocation(ntiid, callback, this);
	},


	maybeLoadNewPage: function(id, cb){

		function loadPageId(pi){
			var pageId = pi.getId();

			if(LocationProvider.currentNTIID === pageId){
				Ext.callback(cb);
			}
			else {
				LocationProvider.setLocation(id, cb);
			}
		}

		function fail(){
			console.error('fail', arguments);
			Ext.callback(cb);
		}

		$AppConfig.service.getPageInfo(id, loadPageId, fail, this);
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
