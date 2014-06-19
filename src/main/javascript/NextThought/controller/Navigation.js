Ext.define('NextThought.controller.Navigation', {
	extend: 'Ext.app.Controller',

	requires: [
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
		{ref: 'navigationBar', selector: 'main-navigation'},
		{ref: 'contentView', selector: 'content-view-container'}
	],


	init: function() {
		this.listen({
			component: {
				'slidedeck-view': {
					exited: 'slideViewExited'
				},
				'*': {
					'go-to-library': 'goToLibrary',
					'go-to-help': 'goToHelp',
					'navigation-selected': 'navigate',
					'navigate-to-href': 'navigateToHref',
					'navigate-to-blog': 'gotoBlog',
					'navigation-failed': 'readerNavigationFailed',
					'view-selected': 'setView'
				},
				'view-container': {
					'activate': 'trackActiveNavTab'
				}
			},
			controller: {
				'*': {
					'show-ntiid': 'navigateToNtiid',
					'show-object': 'navigateToContent',
					'show-view': 'setView',
					'content-dropped': 'dropCachedEntries',
					'navigate-to-forum': 'onNavigateToForum'
				}
			}
		});
	},


	dropCachedEntries: function(rec) {
		if (!rec || !rec.getId) {
			Ext.Error.raise({
				msg: 'Programmer Error: Invalid Arguments',
				args: arguments
			});
		}

		var EA = Ext.Array,
			ids = [rec.getId()].concat(rec.get('Items'));

		ids = EA.unique(EA.map(ids, ParseUtils.ntiidPrefix, ParseUtils));
		Ext.each(ids, function(id) {
			console.warn('Dropping PageInfos for prefix:', id);
			Service.dropPageInfosForPrefix(id);
		});
	},


	trackActiveNavTab: function(to) {
		this.getNavigationBar().setActive(to);
	},

	/**
	 * Set the active view
	 * @param {string} id     the view to activate
	 * @param {boolean} silent false to prevent pushing to the state while activating
	 * @param {boolean} force  true to prevent anything from canceling the change (assuming the respect the flag)
	 */
	setView: function(id, silent, force) {
		var cmp = id && (id.isComponent ? id : Ext.getCmp(id));
		if (!cmp) {
			console.error('no view', arguments);
			return false;
		}

		return cmp.activate(silent, force);
	},


	goToLibrary: function() {
		this.setView('library');
	},


	scrollToObject: function(target, reply) {
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
			Ext.each(target, function(i) {
				var c = cid(i);
				if (Ext.getCmp(c)) {
					id = c;
				}
				return !id;
			});
			return id;
		}


		function localCondition(id, reader) {
			var c = Ext.getCmp(id),
				card = reader.up('{isOwnerLayout("card")}'),
				deck = card && card.up();

			try {
				deck.getLayout().setActiveItem(card);
			} catch (e) {
				console.warn('Failed to switch to reader because:', e.stack || e.message || e);
				return;
			}

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


		return function(cmp, errorObject) {
			var reader = (cmp || ReaderPanel.get()),
					id = findExisting(reader.prefix);

			function loaded(object) {
				var c = object.get('ContainerId'),
						inReplyTo = object.get('inReplyTo'),
						ref,
						scrollToReplyId;

				function afterLoadedAgain(object) {
					if ((object.get('MimeType').split('.') || []).pop() === 'note') {
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
					Service.getObject(ref, afterLoadedAgain, function failure() {
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
				console.log('Could not retrieve rawData for: ', target);
				console.log('Error: ', arguments);
				alert(msgCfg);
			}

			function continueLoad() {
				Service.getObject(target.last(), loaded, fail, me);
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


	readerNavigationFailed: function(reader, ntiid, response) {
		var notHandled = true;

		if (response && response.status === 403) {
			notHandled = this.fireEvent('unauthorized-navigation', this, ntiid);
		}

		return notHandled;
	},


	slideViewExited: function(slideview, slide) {
		var goTo = slide && slide.get('ContainerId');

		if (goTo) {
			this.maybeLoadNewPage(goTo, function(reader) {
				var i = slide.getId(),
						t = slide.get('MimeType'),
						selector = 'object[type="' + t + '"][data-ntiid="' + i + '"] img';

				(reader || ReaderPanel.get()).getScroll().toSelector(selector);
			});
		}
	},


	navigate: function(cid, rec, options) {
		var me = this, perform = this.performAnd.bind(this, 'handleNavigation', cid, rec),
			performAfter = this.performAnd.bind(this, 'afterHandleNavigation', cid, rec),
			txn = history.beginTransaction('navigate-in-controller-' + guidGenerator()),
			result;
		//We don't want to do a content navigation until we are pretty sure
		//thats what we want.  On failure it shows a page not found and
		//if we handle this navigation in some other way we don't want that happening.

		function handleUnauthorized() {
			var win;
			//if its a note go ahead and show the note window
			if (rec instanceof NextThought.model.Note) {
				UserRepository.getUser(rec.get('Creator'))
					.then(function(u) {
						if (!u) {
							console.error('Failed to resolve creator of note: ', rec);
							return;
						}

						return new Promise(function(fulfill, reject) {
							me.fireEvent('show-profile', u, [], fulfill);
						});
					})
					.then(function() { return wait(1); })
					.then(function() {
						win = Ext.widget({
							xtype: 'note-window',
							purchasableId: cid,
							record: rec,
							reader: {
								fireEvent: Ext.emptyFn,
								getDocumentElement: Ext.emptyFn,
								getCleanContent: Ext.emptyFn,
								up: Ext.emptyFn,
								getPosition: function() {
									var x = (Ext.Element.getViewportWidth() / 2) - (700 / 2);

									return [x, 100];
								},
								getWidth: function() { return 700; }
							}
						});

						win.show();
					})
					.fail(function(reason) {
						me.fireEvent('unauthorized-navigation', me, cid);
					});
			} else {
				me.fireEvent('unauthorized-navigation', me, cid);
			}
		}

		function recover(reason) {
			var course, content;
			if (reason && reason.status === 404) {
				return ContentUtils.findRelatedContentObject(cid)
						.then(LocationMeta.getMeta.bind(LocationMeta));
			}

			if (reason && reason.status === 403) {
				handleUnauthorized();
				return Promise.reject('No Access');
			}

			return Promise.reject(reason);
		}

		result = LocationMeta.getMeta(cid)
			.fail(recover)
			.then(perform)
			.then(function() {
				return me.doContentNavigation(cid, rec, options);
			})
			.fail(function(reason) {
				console.log(reason);
			})
			.then(performAfter)
			.fail(function(reason) {
				if (reason) {
					console.error(reason);
					return Promise.reject(reason);
				}

				return me.navigateToNtiid(cid, null, rec, options)
						.fail(function() {
							return me.doContentNavigation(cid, rec, options);
						});
			});

		result.then(txn.commit.bind(txn), txn.abort.bind(txn));

		return result;
	},


	/*
		 *	Navigates to the provided content, optionally targets the provided
		 *  rec using a set of optional options
		 */
	doContentNavigation: function(ntiid, rec, options) {
		var callback = Ext.emptyFn(),
				reply, targets;

		if (!this.fireEvent('show-view', 'content', true)) {
			return Promise.reject();
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

		return this.maybeLoadNewPage(ntiid, callback);
	},


	/**
	 * Navigates to a profile blog or profile blog comment
	 */
	gotoBlog: function(user, postId, commentId, params) {
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

		//fragment = user.getProfileUrl.apply(user, args);
		//		if (params) {
		//			fragment = fragment + '?' + Ext.Object.toQueryString(params);
		//		}

		console.debug('params???', params);

		this.fireEvent('show-profile', user, args);
	},


	navigateAndScrollToSearchHit: function(ntiid, result, fragment) {
		function callback(reader) {
			(reader || ReaderPanel.get()).getScroll().toSearchHit(result, fragment);
		}

		this.fireEvent('set-location', ntiid, callback, this);
	},


	maybeLoadNewPage: function(id, cb) {
		var me = this;

		return new Promise(function(fulfill, reject) {
			me.fireEvent('set-location', id, function(a, er) {
				if (er && er.status !== undefined) {
					return reject(er);
				}

				cb.apply(window, arguments);
				fulfill(a);
			});
		});
	},


	goToHelp: function() {
		var helpIndex = Library.getStore().findBy(function(r) {
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
	 * @param {Object} sender The object requesting navigation
	 * @param {String} href A string representing the location to navigate to
	 *
	 * @return {Boolean} a boolean indicating whether navigation was handled
	 *
	 * TODO Work an error callback into here.  Right now we are at the mercy of many of the
	 * same problems that plague error callbacks in the location provider
	 */
	navigateToHref: function(sender, href) {
		var parts = href.split('#'),
				newBase = parts[0],
				newFragment = parts[1],
				currentLocation = window.location.href,
				currentParts = currentLocation.split('#'),
				currentBase = currentParts[0],
				currentFragment = currentParts[1],
				state = this.getController('State');

		//Are we an nttid?
		if (ParseUtils.isNTIID(newBase)) {
			this.navigateToNtiid(newBase, newFragment);
			return true;
		}

		//Is href an exteranl url whose base does not match the current base (i.e. not in our app)?
		if (ContentUtils.isExternalUri(href) &&
			(newBase.indexOf(currentBase) !== 0 || (/\/content\//.test(href) && !/\.html$/.test(href)))) {
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


	navigateToNtiid: function(ntiid, fragment, rec, options, failure) {
		var object = ntiid.isModel ? ntiid : undefined,
				me = this;

		function onSuccess(obj) { return me.navigateToContent(obj, fragment); }

		function onFailure(reason) {
			console.error('An error occurred resolving ntiid as object for navigation', ntiid, arguments);
			Ext.callback(failure);

			return Promise.reject(reason);
		}

			//We have a fair amount of data locally that we can get at now.  so look for it first
			//if we can't find anything then fetch it from remote
		return (object ? Promise.fulfill(object) : ContentUtils.findContentObject(ntiid))
				.then(function(o) {
					return o.object || Promise.reject('No object');
				})
				.fail(Service.getObject.bind(Service, ntiid))
				.then(onSuccess)
				.fail(onFailure);
	},


	navigateToContent: function(obj, fragment) {
		var me = this, app = me.application;

		NextThought.finishedLoading
			.then(function() { return me.performAnd('getHandlerForNavigationToObject', obj, fragment); })
			.done(function(handlers) {
				if (Ext.isEmpty(handlers)) {
					console.error('No handlers for object navigation:', obj);
					return;
				}

				if (handlers.length > 1) {
					console.error('More than one handler for object navigation:', handlers.length, obj);
					return;
				}

				handlers[0].call(null, obj, fragment);
			})
			.fail(function(reason) {
				console.error('Error getting handlers for object navigation:', obj, reason);
			});
	},


	getHandlerForNavigationToObject: function(obj, fragment) {
		var me = this;

		if (obj.isPageInfo) {
			return function(obj, fragment) {
				function scroll(content) {

					var scroller,
						id = obj.getId(),
						requestedId = obj.originalNTIIDRequested;

					if (content) {
						scroller = content.getScroll();
						if (fragment) {
							scroller.toTarget(fragment);
						}
						//redirected PageInfo (requested id is a child of the `id`)
						else if (requestedId && id !== requestedId) {
							scroller.toContainer(requestedId);
						}
					}
				}

				me.fireEvent('set-location', obj, scroll);
			};
		}

		if (obj instanceof NextThought.model.Note) {
			return function(obj) {
				return me.navigate(obj.get('ContainerId'), obj);
			};
		}

		return false;
	},


	onNavigateToForum: function(board, course, silent) {
		if (course) { return; }

		this.setView('forums');
		return Ext.getCmp('forums');
	}
});
