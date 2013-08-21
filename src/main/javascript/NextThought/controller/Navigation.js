Ext.define('NextThought.controller.Navigation', {
    extend: 'Ext.app.Controller',

    require: [
        'NextThought.util.UserDataThreader',
        'NextThought.ux.WelcomeGuide'
    ],

    views: [
        'Main',
        'Navigation',
        'Views',
        'UserDataPanel',
        'menus.Navigation',
        'navigation.Collection',
        'library.Collection',
        'account.history.Panel'
    ],

    refs: [
        {ref: 'viewport', selector: 'master-view'},
        {ref: 'navigationBar', selector: 'main-navigation'}
    ],


    init: function () {
        this.listen({
            component: {
                'slidedeck-view': {
                    exited: 'slideViewExited'
                },
                '*': {
                    'before-show-topic': 'beforeTopicShow',
                    'go-to-library': 'goToLibrary',
                    'go-to-help': 'goToHelp',
                    'navigation-selected': 'navigate',
                    'navigate-to-href': 'navigateToHref',
                    'navigate-to-blog': 'gotoBlog',
                    'navigation-failed': 'readerNavigationFailed',
                    'view-selected': 'setView',
                    'navigate-to-course-discussion': 'goToCourseForum',
	                'set-forum-location': 'setForumLocation'
                },
                'library-collection': {
                    'select': 'trackContentChange'
                },
                'view-container': {
                    'activate': 'trackActiveNavTab'
                }
            },
            controller: {
                '*': {
                    'show-ntiid': 'navigateToNtiid',
                    'show-object': 'navigateToContent',
                    'show-view': 'setView'
                }
            }
        });
    },


    trackActiveNavTab: function (to) {
        this.getNavigationBar().setActive(to);
    },


    trackContentChange: function (s, r) {
        this.getNavigationBar().updateCurrent(s, r);
    },


    setView: function (id, silent) {
        var cmp = id && (id.isComponent ? id : Ext.getCmp(id));
        if (!cmp) {
            console.warn('no view', arguments);
            console.trace();
            return false;
        }

        return cmp.activate(silent);
    },


    goToLibrary: function () {
        this.setView('library');
    },


    scrollToObject: function (target, reply) {
        target = Ext.isArray(target) ? target : [target];

        var me = this;

        function openWindow(reader, rec, scrollToId, replyToId, isEdit) {
            if (Ext.isArray(replyToId)) {
                replyToId = replyToId.slice(-1);
                replyToId = replyToId.length > 0 ? replyToId[0] : null;
            }

            try {
                me.lastNote = Ext.widget({
                    autoShow: true,
                    xtype: 'note-window',
                    record: rec,
                    reader: reader,
                    scrollToId: scrollToId,
                    replyToId: replyToId && !isEdit ? replyToId : null,
                    isEdit: isEdit
                });
            }
            catch (er) {
                console.warn('Could not open a new note view because:', er);
            }
        }


        function findExisting(prefix) {
            function cid(id) {
                return IdCache.getComponentId(id, null, prefix);
            }

            var id = null;
            Ext.each(target, function (i) {
                var c = cid(i);
                if (Ext.getCmp(c)) {
                    id = c;
                }
                return !id;
            });
            return id;
        }


        function localCondition(id, reader) {
            var c = Ext.getCmp(id);
            if (c && c.isNote) {
                openWindow(reader, c.getRecord(), target.last(), reply ? target : undefined);
            }
            else if (me.lastNote) {
                try {
                    me.lastNote.destroy();
                    delete me.lastNote;
                }
                catch (closeAbort) {
                    console.warn('aborted close because:', closeAbort);
                    return;
                }
            }

            if (reader && reader.getScroll && reader.getScroll().toTarget) {
                reader.getScroll().toTarget(id);
            }
        }


        return function (cmp, errorObject) {
            var reader = (cmp || ReaderPanel.get()),
                id = findExisting(reader.prefix),
                service = $AppConfig.service;

            function loaded(object) {
                var c = object.get('ContainerId'),
                    inReplyTo = object.get('inReplyTo'),
                    ref,
                    scrollToReplyId;

                function afterLoadedAgain(object) {
                    if ((object.get('MimeType').split('.') || []).pop() === "note") {
                        openWindow(reader, object, scrollToReplyId);
                    }

                    //Lets resolve the range and try to scroll to that.
                    var range = Anchors.toDomRange(
                        object.get('applicableRange'),
                        reader.getDocumentElement(),
                        reader.getCleanContent(),
                        c);

                    if (range) {
                        console.log('Scrolling to range:', range);
                        reader.getScroll().toNode(range.startContainer);
                    }
                    else {
                        reader.getScroll().toContainer(c);
                    }
                }

                //in cases where we are scrolling to a reply, attempt to reload here with the root.
                if (inReplyTo) {
                    scrollToReplyId = object.getId();
                    ref = object.get('references').first();
                    if (!ref) {
                        console.warn('inReplyTo set but no references found');
                    }
                    service.getObject(ref, afterLoadedAgain, function failure() {
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


            function fail(req, resp) {
                //FIXME: could not figure out the type of the object. Normally, that's what we want but it's hard to get with info we have.
                var objDisplayType = 'object',
                    msgCfg = { msg: 'An unexpected error occurred loading the ' + objDisplayType };

                if (resp && resp.status) {
                    if (resp.status === 404) {
                        msgCfg.title = 'Not Found!';
                        msgCfg.msg = 'The ' + objDisplayType + ' you are looking for no longer exists.';
                    }
                    else if (resp.status === 403) {
                        msgCfg.title = 'Unauthorized!';
                        msgCfg.msg = 'You do not have access to this ' + objDisplayType + '.';
                    }
                }
                console.log("Could not retrieve rawData for: ", target);
                console.log("Error: ", arguments);
                alert(msgCfg);
            }

            function continueLoad() {
                service.getObject(target.last(), loaded, fail, me);
            }

            if (id) {
                localCondition(id, reader);
                return;
            }

            if (errorObject && errorObject.error) {
                console.error('Navigation failed so not showing object.', arguments);
                return;
            }

            if (reader.needsWaitingOnReadyEvent && reader.needsWaitingOnReadyEvent()) {
                reader.on('should-be-ready', continueLoad, me, {single: true});
            }
            else {
                continueLoad();
            }
        };
    },


    readerNavigationFailed: function (reader, ntiid, response) {
        var notHandled = true;

	    // NOTE: initially we were checking if the response status is a 403,
	    // but we might also have a 404 that references a course item
	    // (which is treated as a purchasable) that a user hasn't enrolled in.
	    // We could check that here or we could let the store controller which listens to this event handle that.
        if (response && (response.status === 403 || response.status === 404)) {
            notHandled = this.fireEvent('unauthorized-navigation', this, ntiid);
        }

        return notHandled;
    },


    slideViewExited: function (slideview, slide) {
        var goTo = slide && slide.get('ContainerId');

        if (goTo) {
            this.maybeLoadNewPage(goTo, function (reader) {
                var i = slide.getId(),
                    t = slide.get('MimeType'),
                    selector = 'object[type="' + t + '"][data-ntiid="' + i + '"] img';

                (reader || ReaderPanel.get()).getScroll().toSelector(selector);
            });
        }
    },


    navigate: function (cid, rec, options) {
        var me = this;
        //We don't want to do a content navigation until we are pretty sure
        //thats what we want.  On failure it shows a page not found and
        //if we handle this navigation in some other way we don't want that happening.
        LocationMeta.getMeta(cid, function (meta) {
            if (meta) {
                this.doContentNavigation(cid, rec, options);
            }
            else {
                this.navigateToNtiid(cid, null, rec, options, function () {
                    me.doContentNavigation(cid, rec, options);
                });
            }
        }, this);
    },


    /*
     *	Navigates to the provided content, optionally targets the provided
     *  rec using a set of optional options
     */
    doContentNavigation: function (ntiid, rec, options) {
        var callback = Ext.emptyFn(),
            reply, targets;

        if (!this.fireEvent('show-view', 'content', true)) {
            return;
        }

        if (rec) {
            reply = (options || {}).reply;
            targets = (rec.get('references') || []).slice();
            targets.push(rec.getId());

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
    gotoBlog: function (user, postId, commentId, params) {
        var title = 'Thoughts',
            fragment,
            args = [title];

        if (postId) {
            args.push(postId);
        }

        if (postId && commentId) {
            args.push('comments');
            args.push(commentId);
        }

        fragment = user.getProfileUrl.apply(user, args);
        if (params) {
            fragment = fragment + '?' + Ext.Object.toQueryString(params);
        }

        this.fireEvent('change-hash', fragment);
    },

    /**
     *Navigate to the course and push the forum and topic
     */
    goToCourseForum: function (course, forum, topic, callback) {

        function test(ntiid, reader, error) {
            console.log('test:', arguments);
            if (error) {
                return;
            }

            var cmp = Ext.ComponentQuery.query('content-view-container')[0];
            if (!course) {
                return;
            }

			if(cmp && cmp.isActive()){
				Ext.defer(function(){
					cmp.setActiveTab('course-forum');

					// FIXME: We're running into a case where we call restoreState explicitly passing our callback, however,
					// since we're pushing state, it also invokes restoreState and we run into this overlapping calls
					// which can cause a race condition or unwanted behaviors. We can't ignore pushing state either, because if we don't,
					// the app will still think we're at where we came from( i.e. Profile). Don't know of a best way to fix this.
					cmp.courseForum.restoreState(forum, topic, callback);
					history.pushState({ active:'content', content: { activeTab: 'course-forum', current_forum: forum, current_topic: topic}});
				}, 1);
			}
		}
        this.fireEvent('set-last-location-or-root', course, test, true);
    },


	beforeTopicShow: function(topic){
		console.log('implement beforeTopicShow...about to set the Forums View');
		var me = this,
			link = topic && topic.get('href'), r;
		if(link){
			//We can get the link to board from the content link
			//doing this prevents having to to two requests to get the forum, then board. 
			//assumes the content url looks like base/board/forum/topic
			if(link.slice(-1) === '/'){
				//FIXME, wtf is this doing?
				link = link.split('/').slice(0,-23).join('/');
			}else{
				link = link.split('/').slice(0,-2).join('/');
			}

			Ext.Ajax.request({
				url: link,
				callback: function(request, success, response){
					if(!success){ return; }
					var board = ParseUtils.parseItems(response.responseText)[0];
					if(board.belongsToCourse()){
						me.goToCourseForum(board.getRelatedCourse().get('NTIID'), topic.get('ContainerId'), topic.getId());
						r = false;
					}else{
						r = me.setView('forums');
					}
				}
			});

			return r;
		}

		return this.setView('forums');
	},


	// NOTE: unlike beforeTopic, this setForumLocation takes a callback, that gets called at the end.
	setForumLocation: function(topicRecord, comment, callback, scope){
		console.log('implement beforeTopicShow...about to set the Forums View');

		var me = this,
			link = topicRecord && topicRecord.get('href'), r, req;

		if(link){
			// Get the board url: assumes the content url looks like base/board/forum/topic
			if(link.slice(-1) === '/'){
				link = link.split('/').slice(0,-23).join('/');
			}else{
				link = link.split('/').slice(0,-2).join('/');
			}

			req = {
				url: link,
				callback: function(request, success, response){
					if(!success){
						me.fireEvent('topic-navigation-canceled', topicRecord);
						console.error('Could not find the board this topic belongs to: ', topicRecord, arguments);
						Ext.callback(callback, scope);
						return;
					}

					var board = ParseUtils.parseItems(response.responseText)[0];
					if(board.belongsToCourse()){
						callback = Ext.bind(callback, scope);
						me.goToCourseForum(board.getRelatedCourse().get('NTIID'), topicRecord.get('ContainerId'), topicRecord.getId(), callback);
					}else{
						r = me.setView('forums');
						me.fireEvent('show-topic', topicRecord, comment, callback);
					}
				}
			};

			Ext.Ajax.request(req);
			return;
		}

		// Announce this to whoever cares.
		this.fireEvent('topic-navigation-canceled', topicRecord);
		Ext.callback(callback, scope);
	},


    navigateAndScrollToSearchHit: function (ntiid, result, fragment) {
        function callback(reader) {
            (reader || ReaderPanel.get()).getScroll().toSearchHit(result, fragment);
        }

        this.fireEvent('set-location', ntiid, callback, this);
    },


    maybeLoadNewPage: function (id, cb) {
        this.fireEvent('set-location', id, cb);
    },


    goToHelp: function () {
        var helpIndex = Library.getStore().findBy(function (r) {
            return (/nextthought/i).test(r.get('author'));
        });

        if (helpIndex >= 0) {
            this.navigate(Library.getStore().getAt(helpIndex).get('NTIID'));
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
     * same problems that plague error callbacks in the location provider
     */
    navigateToHref: function (sender, href) {
        var parts = href.split('#'),
            newBase = parts[0],
            newFragment = parts[1],
            currentLocation = window.location.href,
            currentParts = currentLocation.split('#'),
            currentBase = currentParts[0],
            currentFragment = currentParts[1],
            state = this.getController('State');

        //Are we an nttid?
        if (ParseUtils.parseNtiid(newBase)) {
            this.navigateToNtiid(newBase, newFragment);
            return true;
        }

        //Is href an exteranl url whose base does not match the current base (i.e. not in our app)?
        if (ContentUtils.isExternalUri(href) && (newBase.indexOf(currentBase) !== 0
		        || (/\/content\//.test(href) && !/\.html$/.test(href)))) {
            try {
                window.open(href, '_blank');
            }
            catch (er) {
                console.error('Unable to open ', href, 'with target _blank.  Falling back to hash change', Globals.getError(href));
                //I think we can be certain that this shouldn't just be a hash change, so this may not make sense
                //as a fallback anymore.  When we get to Ext 4.2 use controller event and drop this tight coupling
                state.changeHash(href);
            }
            return true;
        }

        //Ok so at this point we should be an internal url that amounts to either a has change
        //or a fragment internal to who called us
        if (newBase.indexOf(currentBase) === 0) {
            //ok so we are a fragment change.  if the new href is the same as the current href
            //bail we don't want to reload/navigate to the same location
            if (newFragment !== currentFragment) {
                if (newFragment.indexOf('!') === 0) {
                    //When we get to Ext 4.2 use controller event and drop this tight coupling
                    state.changeHash('#' + newFragment);
                    return true;
                }

                if (Ext.isFunction(sender.navigateToFragment)) {
                    sender.navigateToFragment(newFragment);
                    return true;
                }
            }
            return false;
        }

        console.error('Expected href to be an interal url/hash change but it was', href, currentLocation);
        return false;
    },


    navigateToNtiid: function (ntiid, fragment, rec, options, failure) {
        var object = ntiid.isModel ? ntiid : undefined,
            me = this;

        function onSuccess(obj) {
            me.fireEvent('show-object', obj, fragment, rec, options);
        }

        function onFailure() {
            //TODO failure callback here
            console.error('An error occurred resolving ntiid as object for navigation', ntiid, arguments);
            Ext.callback(failure);
        }

        if (!object) {
            //We have a fair amount of data locally that we can get at now.  so look for it first
            //if we can't find anything then fetch it from remote
            ContentUtils.findContentObject(ntiid, function (object) {
                if (object) {
                    onSuccess(object);
                }
                else {
                    $AppConfig.service.getObject(ntiid, onSuccess, onFailure, this);
                }
            }, this);
        }
        else {
            onSuccess(object);
        }

    },


    navigateToContent: function (obj, fragment) {
        function scroll(content) {
            if (content && fragment) {
                content.getScroll().toTarget(fragment);
            }
        }

        if (obj.isPageInfo) {
            this.fireEvent('set-location', obj, scroll);
            return false;
        }
        console.log('Dont know how to navigate to object', obj);
        return true;
    }
});
