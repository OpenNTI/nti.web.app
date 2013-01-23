Ext.define('NextThought.controller.Navigation', {
	extend: 'Ext.app.Controller',

	require: [
		'NextThought.providers.Location',
		'NextThought.util.UserDataThreader'
	],

	views: [
		'Navigation',
		'ViewSelect',
		'Views',
		'menus.Navigation',
        'UserDataPanel'
	],

	init: function() {
		this.control({
			'navigation-collection': {
				'select': function(sm,rec){
					var ntiid = rec.get('NTIID');
					LocationProvider.setLastLocationOrRoot(ntiid);
				}
			},
			'activity-view': {
				'navigation-selected': this.navigate
			},
			'activity-preview': {
				'navigation-selected': this.navigate
			},
            'user-data-panel': {
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
                    ref,
		            scrollToReplyId;

                function afterLoadedAgain(object){
	                if( (object.get('MimeType').split('.') || []).pop() === "note" ){
		                Ext.widget('note-window', { scrollToId: scrollToReplyId, annotation: {getRecord:function(){return object;}}}).show();
	                }

	                //Lets resolve the range and try to scroll to that.
	                var range = Anchors.toDomRange(
			                object.get('applicableRange'),
			                reader.getDocumentElement(),
			                reader.getCleanContent(),
			                c);

	                if(range){
		                console.log('Scrolling to range:',range);
		                reader.scrollToNode(range.startContainer);
	                }
	                else {
                        reader.scrollToContainer(c);
	                }
                }

                //in cases where we are scrolling to a reply, attempt to reload here with the root.
                if (inReplyTo){
                    scrollToReplyId = object.getId();
                    ref = object.get('references').first();
                    if (!ref){
                         console.warn('inReplyTo set but no references found');
                    }
                    service.getObject(ref, afterLoadedAgain, function failure(){
						var mockThread;
	                    console.log('Root note unresolvable, Will build thread with only reply');
						mockThread = NextThought.util.UserDataThreader.threadUserData(object) || [];
						mockThread = !Ext.isEmpty(mockThread) ? mockThread.first() : object;
	                    afterLoadedAgain(mockThread);
                    }, me);
                }
                else {
                    afterLoadedAgain(object);
                }
			}


			function fail(req, resp){
				//FIXME: could not figure out the type of the object. Normally, that's what we want but it's hard to get with info we have.
				var objDisplayType = 'object',
					msgCfg = { msg: 'An unexpected error occurred loading the '+ objDisplayType };

				if(resp && resp.status){
					if(resp.status === 404){
						msgCfg.title = 'Not Found!';
						msgCfg.msg = 'The '+objDisplayType+' you are looking for no longer exists.';
					}
					else if(resp.status === 403){
						msgCfg.title = 'Unauthorized!';
						msgCfg.msg = 'You do not have access to this '+objDisplayType+'.';
					}
				}
				console.log("Could not retrieve rawData for: ", target);
				console.log("Error: ", arguments);
				alert(msgCfg);
			}

			function continueLoad(){
				service.getObject(target.last(), loaded, fail, me);
			}

			if(id){
				localCondition(id,reader);
				return;
			}

			if(reader.needsWaitingOnReadyEvent()){
				reader.on('should-be-ready',continueLoad,me,{single:true});
			}
			else {
				continueLoad();
			}
		};
	},


	/*
	 *	Navigates to the provided content, optionally targets the provided
	 *  rec using a set of optional options
	 */
	navigate: function(ntiid, rec, options) {
		var callback = Ext.emptyFn(),
			reply, targets;

		if (rec) {
			reply = (options || {}).reply;
			targets = (rec.get('references') || []).slice();
			targets.push( rec.getId() );

			//TODO instead of just passing in the record we provide the reference list and id
			//and then the callback turns around and fetches the object again.  It owuld
			//bo good to not do that, but if I recall at one point we had to do that
			//to make sure we didn't show a deleted object.  Is that still an issue?
			callback = this.scrollToObject(targets, reply);
		}

		this.maybeLoadNewPage(ntiid, callback);
	},


	navigateAndScrollToSearchHit: function(ntiid, result, fragment){
		function callback(reader){
			(reader||ReaderPanel.get()).scrollToSearchHit(result, fragment);
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
