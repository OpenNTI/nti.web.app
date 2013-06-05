Ext.define('NextThought.controller.Navigation', {
	extend: 'Ext.app.Controller',

	require: [
		'NextThought.providers.Location',
		'NextThought.util.UserDataThreader',
		'NextThought.ux.WelcomeGuide'
	],

	views: [
		'Navigation',
		'ViewSelect',
		'Views',
        'UserDataPanel',
		'menus.Navigation',
		'menus.navigation.Collection',
		'library.menus.Collection'
	],

	init: function() {
		this.listen({
			component:{
				'library-collection': {
					'itemclick': 'selectLibraryEntry'
				},
				'activity-panel': {
					'navigation-selected': 'navigate',
					'navigate-to-blog': 'gotoBlog'
				},
				'activity-preview': {
					'navigation-selected': 'navigate',
					'navigate-to-blog': 'gotoBlog'
				},
				'activity-preview-blog':{
					'navigate-to-blog': 'gotoBlog'
				},
				'activity-preview-blog-reply':{
					'navigate-to-blog': 'gotoBlog'
				},
				'activity-preview-personalblogentry':{
					'navigate-to-blog': 'gotoBlog'
				},
				'activity-preview-note': {
					'navigation-selected': 'navigate'
				},
				'activity-preview-note-reply': {
					'navigation-selected': 'navigate'
				},
	            'user-data-panel': {
	                'navigation-selected': 'navigate',
		            'navigate-to-blog': 'gotoBlog'
	            },
				'main-views': {
					'activate-view': 'track',
					/** @private handler */
					'activate-main-view': function(id){
						//viewport is set by Application controller
						return this.viewport.views.switchActiveViewTo(id);
					}
				},
				'view-select button': {
					'view-selected': 'switchViews'
				},
				'slidedeck-view': {
					exited: 'slideViewExited'
				},
				'profile-activity *':{
					'navigation-selected': 'navigate'
				},
				'*': {
					'before-show-topic': 'beforeTopicShow',
					'navigate-to-href': 'navigateToHref'
				},
				'notfound':{
					'go-to-library': 'goToLibrary'
				},
				'welcome-guide':{
					'go-to-help': 'goToHelp'
				},
				'view-select menu':{
					'hide': 'syncButton'
				},
				'library-view-container' : {
					'navigation-failed': 'readerNavigationFailed'
				}
			},
			controller:{
				'*': {
					'show-ntiid': 'navigateToNtiid',
					'show-object': 'navigateToContent',
					'show-view': 'setView'
				}
			}
		});
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


		return function(reader, errorObject) {
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

			if(errorObject && errorObject.error){
				console.error('Navigation failed so not showing object.', arguments);
				return;
			}

			if(reader.needsWaitingOnReadyEvent && reader.needsWaitingOnReadyEvent()){
				reader.on('should-be-ready',continueLoad,me,{single:true});
			}
			else {
				continueLoad();
			}
		};
	},


	readerNavigationFailed: function(reader, ntiid, response){
		var notHandled = true;
		if(response && response.status === 403){
			notHandled = this.fireEvent('unauthorized-navigation', this, ntiid);
		}

		return notHandled;
	},


	slideViewExited: function(slideview, slide){
		var goTo = slide.get('ContainerId');

		if(goTo){
			this.maybeLoadNewPage(goTo, function(reader){
				var i = slide.getId(),
					t = slide.get('MimeType'),
					selector = 'object[type="'+t+'"][data-ntiid="'+i+'"] img';

				(reader||ReaderPanel.get()).scrollToSelector(selector);
			});
		}
	},

	selectLibraryEntry: function(view, rec){
		LocationProvider.setLastLocationOrRoot(rec.get('NTIID'));
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

	/**
	 * Navigates to a profile blog or profile blog comment
	 */

	gotoBlog: function(user, postId, commentId, params){
		var title = 'Thoughts',
			state = this.getController('State'),
			fragment,
			args = [title];

		if(postId){
			args.push(postId);
		}

		if(postId && commentId){
			args.push('comments');
			args.push(commentId);
		}

		fragment = user.getProfileUrl.apply(user, args);
		if(params){
			fragment = fragment + '?' + Ext.Object.toQueryString(params);
		}

		if(state.changeHash){
			state.changeHash(fragment);
		}
	},


	beforeTopicShow: function(){
		console.log('implement beforeTopicShow...about to set the Forums View');
		return this.setView('forums');
	},


	navigateAndScrollToSearchHit: function(ntiid, result, fragment){
		function callback(reader){
			(reader||ReaderPanel.get()).scrollToSearchHit(result, fragment);
		}

		LocationProvider.setLocation(ntiid, callback, this);
	},


	maybeLoadNewPage: function(id, cb){
		LocationProvider.setLocation(id, cb);
	},


	viewSelectButton: function(id){

		if(!id){return null;}

		var query = 'view-select button[title='+Ext.String.capitalize(id)+'], view-select button[viewId='+id+']',
			btns = Ext.ComponentQuery.query(query);
		if(!Ext.isEmpty(btns)){
			return btns.first();
		}
		return null;
	},


	track: function(id){
		var btn = this.viewSelectButton(id),silent=true; //calling toggle with silent=false recursively calls toggle crashing the browser.
		try {
			if(btn.alternateId){
				btn = this.viewSelectButton(btn.alternateId);
				silent = true;
			}
			btn.toggle(true,silent);
		}
		catch(e){
			console.error('Looks like the "'+id+'" button was not included or was typo\'ed', e.stack);
		}
	},


	syncButton: function(){
		var mainViews = this.viewport.views,
			activeItem = mainViews.getActive(),
			activeId = activeItem ? activeItem.id : null,
			btns = Ext.ComponentQuery.query('view-select-button');

		Ext.each(btns,function(b){b.toggle(false,true);});

		this.track(activeId);
	},


	setView: function(id){
		//This smells funny...
		return this.viewport.activateView(id);
	},


	goToLibrary: function(){
		this.setView('library');
	},


	goToHelp: function(){
		var helpIndex = Library.getStore().findBy(function(r){
			return (/nextthought/i).test(r.get('author'));
		});

		if(helpIndex >= 0){
			this.navigate(Library.getStore().getAt(helpIndex).get('NTIID'));
		}
	},


	switchViews: function(button, state){
		var id = button.viewId || button.title.toLowerCase();
		if(state){
			try {
				this.track(id);//always switch the menus even if the view is already active
				//search doesn't have a "view"...just a menu
				if(button.switchView !== false){
					if(!this.setView(id)){
						this.syncButton();
					}
				}
			}
			catch(e){
				console.debug('Oops, a view button was defined, but the related view was not added: '+id);
			}
		}
	},

	/**
	 * The idea here is that navigation to an href (which may be an absolute external url,
	 * an internal url, an app state fragment, a fragment, or even an ntiid) can be triggered
	 * by calling this function with a sender and an href.  Objects will usually trigger this
	 * function by firing an event in something like an anchor click handler.  We first try and parse the href as
	 * an ntiid.  If it parses and resolves to an object we may be able to navigate to the canonical
	 * location of that object. After that we attempt to identify external urls and open them in a new
	 * tab.  Internal urls and app state fragments are handled inside the application.  Lastly all other
	 * fragments will be handled by calling sender.navigateToFragment, if it exists, with the provided href.
	 *
	 * @param sender The object requesting navigation
	 * @param href A string representing the location to navigate to
	 *
	 * @return a boolean indicating whether navigation was handled
	 *
	 * TODO Work an error callback into here.  Right now we are at the mercy of many of the
	 * same problems that plague error callbacks in the LocationProvider
	 */
	navigateToHref: function(sender, href){
		var parts = href.split('#'),
			newBase = parts[0],
			newFragment = parts[1],
			currentLocation = window.location.href,
			currentParts = currentLocation.split('#'),
			currentBase = currentParts[0],
			currentFragment = currentParts[1],
			state = this.getController('State');

		//Are we an nttid?
		if(ParseUtils.parseNtiid(newBase)){
			this.navigateToNtiid(newBase, newFragment);
			return true;
		}

		//Is href an exteranl url whose base does not match the current base (i.e. not in our app)?
		if(ContentUtils.isExternalUri(href) && newBase.indexOf(currentBase) !== 0){
			try {
				window.open(href, '_blank');
			}
			catch(er){
				console.error('Unable to open ', href, 'with target _blank.  Falling back to hash change', Globals.getError(href));
				//I think we can be certain that this shouldn't just be a hash change, so this may not make sense
				//as a fallback anymore.  When we get to Ext 4.2 use controller event and drop this tight coupling
				state.changeHash(href);
			}
			return true;
		}

		//Ok so at this point we should be an internal url that amounts to either a has change
		//or a fragment internal to who called us
		if(newBase.indexOf(currentBase) === 0){
			//ok so we are a fragment change.  if the new href is the same as the current href
			//bail we don't want to reload/navigate to the same location
			if(newFragment !== currentFragment){
				if(newFragment.indexOf('!') === 0){
					//When we get to Ext 4.2 use controller event and drop this tight coupling
					state.changeHash('#'+newFragment);
					return true;
				}

				if(Ext.isFunction(sender.navigateToFragment)){
					sender.navigateToFragment(newFragment);
					return true;
				}
			}
			return false;
		}

		console.error('Expected href to be an interal url/hash change but it was', href, currentLocation);
		return false;
	},

	navigateToNtiid: function(ntiid, fragment){
		var object = ntiid.isModel ? ntiid : undefined;
		var me = this;

		function onSuccess(obj){
			me.fireEvent('show-object', obj, fragment);
		}

		function onFailure(){
			//TODO failure callback here
			console.error('An error occurred resolving ntiid as object for navigation', ntiid, arguments);
		}

		if(!object){
			$AppConfig.service.getObject(ntiid, onSuccess, onFailure, this);
		}
		else{
			onSuccess(object);
		}

	},

	navigateToContent: function(obj, fragment){
		if(obj.isPageInfo){
			//FIXME Use the callback here for error handling once it supports
			//an error callback.
			LocationProvider.setLocation(obj, function(content){
				if(content && fragment) {
					content.scrollToTarget(fragment);
				}
			});
			return false;
		}
		console.log('Dont know how to navigate to object', obj);
		return true;
	}
});
