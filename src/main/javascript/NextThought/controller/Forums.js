Ext.define('NextThought.controller.Forums', {
	extend: 'Ext.app.Controller',

	models: [
		'forums.Board',
		'forums.CommunityBoard',
		'forums.CommunityForum',
		'forums.CommunityHeadlinePost',
		'forums.CommunityHeadlineTopic',
		'forums.Forum',
		'forums.GeneralForum',
		'forums.GeneralForumComment',
		'forums.GeneralHeadlinePost',
		'forums.GeneralHeadlineTopic',
		'forums.GeneralPost',
		'forums.GeneralTopic',
		'forums.HeadlinePost',
		'forums.HeadlineTopic',
		'forums.Post',
		'forums.Topic'
	],

	stores: [
		'NTI'
		//'Board','Forums'...
	],

	views: [
		// 'forums.Editor',
		// 'forums.Root',
		// 'forums.Board',
		// 'forums.Comment',
		// 'forums.Forum',
		// 'forums.Topic',
		// 'forums.View',
		// 'forums.forumcreation.Window',
		//'profiles.parts.ForumActivityItem'
	],

	refs: [
		{ ref: 'courseForum', selector: 'forums-container[isCourseForum]'},
		{ ref: 'globalForum', selector: 'forums-container:not([isCourseForum])'}
	],

	init: function() {
		var me = this;

		me.getApplication().on('finished-loading', function() {
			delete me.hasStateToRestore;
			delete me.stateRestoring;
		});

		me.listen({
			component: {
				'forums-container': {
					'restore-forum-state': 'restoreState',
					'render': 'loadBoardList',
					'active-state-changed': 'setActiveState'
				},
				'course-forum': {
					'maybe-show-forum-list': function(cmp, forumsList, silent) {
						//if we aren't restoring a state
						if (!this.hasStateToRestore) {
							this.loadForumList.call(this, cmp, forumsList, null, null, silent);
						}
					}
				},
				'forums-forum-nav': {
					'new-forum': 'showForumEditor'
				},
				'forumcreation-main-view': {
					'save-forum': 'saveForum'
				},
				'forums-forum': {
					'new-topic': 'showTopicEditor'
				},
				'forums-topic-topic': {
					'navigate-topic': 'loadTopic',
					'delete-post': 'deleteObject',
					'edit-topic': 'showTopicEditor',
					'topic-navigation-store': 'enableTopicNavigation'
				},
				'forums-topic-editor': {
					'save-post': 'saveTopicPost'
				},
				'forums-topic-comment': {
					'delete-topic-comment': 'deleteObject'
				},
				'activity-preview-topic > nti-editor': {
					'save': 'saveTopicComment'
				},
				'activity-preview-topic-reply > nti-editor': {
					'save': 'saveTopicComment'
				},
				'profile-forum-activity-item': {
					'delete-post': 'deleteObject'
				},
				'activity-preview-topic-reply': {
					'delete-topic-comment': 'deleteObject'
				},
				'profile-forum-activity-item nti-editor': {
					'save': 'saveTopicComment'
				},
				'profile-forum-activity-item-reply > nti-editor': {
					'save': 'saveTopicComment'
				},
				'profile-forum-activity-item-reply': {
					'delete-topic-comment': 'deleteObject'
				},

				'forums-topic-body nti-editor': {
					'save': 'saveTopicComment'
				},

				'search-result': {
					'highlight-topic-hit': 'highlightSearchResult'
				},
				'*': {
					'show-topic': 'loadTopic',
					'forums:fill-in-path': 'fillInPath',
					'show-forum-list': 'loadForumList',
					'show-topic-list': 'loadTopicList',
					'new-topic': 'showNewTopicEditor',
					'goto-forum-item': 'presentForumItem'
				}
			},
			controller: {
				'*': {
					'show-object': 'navigateToForumContent',
					'show-topic': 'presentForumItem'
				}
			}
		});
	},


	getCardContainer: function(cmp) {
		if (!cmp) { return null;}

		if (cmp.isForumContainer) { return cmp; }

		return cmp.up('[isForumContainer]');
	},


	fillInPath: function(cmp, record, callback) {
		var i = 0,
			len = record.isComment ? 3 : 2,
			parts = [],
			r = record,
			href = r.get('href').split('/');

		for (i; i < len; i++) {
			href.pop();
			parts.push(getURL(href.join('/')));
		}
		parts.reverse();


		function maybeFinish() {
			i--;
			if (i > 0) { return; }

			Ext.callback(callback, cmp, [parts]);
		}

		function getObject(url, ix) {
			var req = {
				url: url,
				success: function(rep) {
					var o = parts[ix] = ParseUtils.parseItems(rep.responseText)[0];
					if (!/board$|forum$|Topic$/i.test(o.get('Class'))) {
						console.error('Unexpected object: ', o, ' from: ', url, 'and: ', r.get('href'));
						parts[ix] = null;
						return;
					}

					UserRepository.getUser(o.get('Creator'), function(u) {
						o.set('Creator', u);
						maybeFinish();
					});
				},
				failure: function() {
					console.error('Could not load part: ' + url, ' from: ', r.get('href'));
					parts[ix] = null;
					maybeFinish();
				}
			};

			Ext.Ajax.request(req);
		}

		Ext.each(parts, getObject);
	},


	buildUrlFromState: function(state) {
		var path = ['users'];

		if (!state.board) { return; }

		path.push(state.board.community);
		path.push('DiscussionBoard');

		if (state.forum) {
			path.push(state.forum);
		}

		if (state.topic) {
			path.push(state.topic);
		}

		return $AppConfig.server.data + path.join('/');
	},


	handleRestoreState: function(state, promise) {
		var me = this,
			url = me.buildUrlFromState(state), req;

		if (!url) {
			//we can't restore the state but don't blow up
			promise.fulfull();
		}

		req = {
			url: url,
			method: 'GET',
			success: function(resp, req) {
				var json = Ext.JSON.decode(resp.responseText, true),
					obj = ParseUtils.parseItems(json)[0];

				me.presentForumItem(obj);
				promise.fulfill();
			},
			failure: function() {
				console.error('Failded to get:', url, arguments);
				promise.fulfill();
			}
		};

		Ext.Ajax.request(req);
	},


	restoreState: function(s, promise) {
		var state = s.forums || {},
			me = this;

		function handle() {
			me.handleRestoreState(state, promise);
		}

		//there is a state restoring
		this.stateRestoring = true;

		if (s.active !== 'forums') {
			promise.fulfill();
			return;
		}

		//we are restoring a state
		this.hasStateToRestore = true;

		//TODO: convert this entire chain of events to promises...
		//make sure loadRoot has finished
		if (me.loadingRoot) {
			me.on('root-loaded', handle, me, {single: true});
		}else {
			handle();
		}
	},


	setActiveState: function(board, forum, topic, title) {
		if (!board) {
			console.error('No forum state to set', arguments);
			return;
		}

		var s,
			comm = board.get('Creator');

		forum = forum && forum.get('ID');
		topic = topic && topic.get('ID');

		comm = comm.isModel ? comm.get('ID') : comm;

		s = {
			board: {
				community: comm,
				isUser: true
			},
			forum: forum,
			topic: topic
		};

		this.pushState(s, title);
	},


	pushState: function(s, title) {
		history.pushState({active: 'forums', forums: s}, title);
	},


	replaceState: function(s) {
		history.replaceState({forums: s});
	},


	/**
	 * Takes any of the forum models, and navigates to it
	 * @param  {NextThought.model.forums.base} record either a board, forum, or topic
	 */
	presentForumItem: function(record) {
		var me = this;

		if (!record) {
			console.error('Cant present an empty record');
			return;
		}

		if (record.isBoard) {
			me.loadForumList(null, record);
		} else if (record.isForum) {
			//if we have a forum load its board and show it as the active one
			Service.getObject(record.get('ContainerId'), function(obj) {
				me.loadForumList(null, obj, record.getId());
			});
		} else if (record.isTopic) {
			me.loadTopic(null, record);
		} else if (record.isComment) {
			me.loadComment(null, record);
		}

	},


	loadCommunityBoards: function() {
		var p = PromiseFactory.make(), me = this,
			communities = $AppConfig.userObject.getCommunities();

		function onBoardLoad(resp, req) {
			var objs = ParseUtils.parseItems(resp.responseText),
				comm = req.community, boards = [];


			objs.forEach(function(o) {
				//We create forums on the backend, so if the board has 0, don't show it.
				// except I don't think this applies anymore
				if (o.get('ForumCount') > -1) {
					if (comm) {
						o.communityUsername = comm.getId();

						if (o.get('Creator') === comm.getId()) {
							o.set('Creator', comm);
						}
					}

					boards.push(o);
				}
			});

			if (req.promise) {
				req.promise.fulfill(boards);
			} else {
				console.error('We didnt have a promise to fulfill, panic');
			}
		}

		function loadCommunityBoard(community) {
			var prom = PromiseFactory.make(),
				url = community.getLink('DiscussionBoard');

			if (!url) {
				prom.fulfill([]);
				return prom;
			}

			Ext.Ajax.request({
				url: url,
				community: community,
				promise: prom,
				success: onBoardLoad,
				failure: function() {
					prom.fulfill([]);
				}
			});

			return prom;
		}

		Promise.pool(communities.map(loadCommunityBoard))
			.done(function(results) {
				results = results.reduce(function(a, b) {
					return a.concat(b);
				}, []);

				p.fulfill(results);
			})
			.fail(function(reason) {
				console.error('Faild to load boards because:', reason);
				//if we fail for some reason don't break it, just show no boards
				p.fulfill([]);
			});

		return p;
	},


	loadBoardList: function(view) {
		console.log('Loadroot called', view);

		//don't need to load the boards more than once
		if (this.boardStore && view.showBoardList) {
			view.showBoardList(this.boardStore);
			return;
		}

		var me = this,
			store = NextThought.store.NTI.create({
				model: 'NextThought.model.forums.Forum', id: 'flattened-boards-forums'
			});

		me.loadingRoot = true;

		me.loadCommunityBoards()
			.done(function(boards) {
				delete me.loadingRoot;

				if (boards) {
					store.add(boards);

					me.boardStore = store;

					//TODO: if there is only one board go ahead and load it
					if (view.showBoardList) {
						view.showBoardList(store);
						me.fireEvent('root-loaded');
					}
				}
			});

	},


	/**
	 * Navigates to the parent of the record and sets the forum list
	 * @param  {Ext.Component} cmp   who fired the event, looks for its forum container parent
	 * @param  {NextThoguht.model.forums.Board} record    the forum list to navigate to
	 * @param  {NTIID} activeForumId   the forum to select
	 * @param  {Boolean} wait   the calle will set the topic and forum
	 * @param  {Boolean} silent if true don't switch to the discussion tab
	 */
	loadForumList: function(cmp, record, activeForumId, wait, silent) {
		if (Ext.isArray(record)) { record = record[0]; }

		var p = PromiseFactory.make(),
			me = this, view = this.getCardContainer(cmp),
			community = record.get('Creator');

		record.activeNTIID = activeForumId;

		function finish(v) {
			//once we get here the state restoring is done
			delete me.hasStateToRestore;
			delete me.stateRestoring;

			if (v.showForumList) {
				if (wait) {
					p.fulfill(v);
				} else {
					view.showForumList(record);
				}
			}
		}

		function maybeFinish() {
			//If we have a view we can go ahead and set the forum list
			if (view) {
				finish(view);
			} else {
				//otherwise we need to go to the course of the forums tab first
				record.findCourse()
					.done(function(course) {
						var s = (me.stateRestoring && !me.hasStateToRestore) || silent;
						//if there is a state to restore that we aren't incharge of pass true as the last argument, to keep
						//it from switching the tab.
						view = me.callOnAllControllersWith('onNavigateToForum', record, course, s);
						//set a flag to keep the view from updating the state
						view.ignoreStateUpdate = s;
						finish(view);
					});
			}
		}

		if (!community.isModel) {
			UserRepository.getUser(community)
				.done(function(c) {
					record.set('Creator', c);
					maybeFinish();
				});
		} else {
			maybeFinish();
		}

		return wait ? p : true;
	},


	/**
	 * Navigate to a forum's container and display the forum
	 * @param  {Ext.Component}   cmp   who fired the event, looks for its forum container parent
	 * @param  {NextThoguht.model.forums.Board}   record   the forum list to navigate to
	 * @param  {NextThought.model.forums.Topic}   activeTopic    the forum to select
	 * @param  {Function}   callback
	 */
	loadTopicList: function(cmp, record, activeTopic, callback) {
		if (Ext.isArray(record)) { record = record[0]; }

		if (!record.isModel) { return; }

		var me = this, view = this.getCardContainer(cmp);

		record.activeRecord = activeTopic;

		function finish(v, forumList) {
			var topicView = v.showTopicList(record, forumList);

			if (callback && Ext.isFunction(callback)) {
				callback.call(this, topicView, v);
			}
		}

		UserRepository.getUser(record.get('Creator'), function(c) {
			record.set('Creator', c);
		});

		if (view) {
			finish(view);
		} else {
			//get the forum list and add it first
			Service.getObject(record.get('ContainerId'), function(forumList) {
				if (forumList) {
					me.loadForumList(null, forumList, record.getId(), true)
						.done(function(v) {
							finish(v, forumList);
						});
				}
			}, function(req, resp) {
				console.error('Faild to load forum-list for topic:', req, resp);
			},me, true);
		}
	},


	/**
	 * Loads a topic
	 * @param  {Ext.Component}   cmp    the one who fired the event, look for its parent forum container
	 * @param  {NextThought.model.forums.Topic}   record   the topic to show
	 * @param  {NextThought.model.forums.Comment}   comment   the comment to show
	 * @param  {Function} cb   is called back with the view
	 * @param  {Object}   scope   scope for the call back
	 */
	loadTopic: function(cmp, record, comment, cb, scope) {
		if (!record) {
			console.error('Cant present a topic with an empty record');
			return;
		}

		var me = this;

		Service.getObject(record.get('ContainerId'), function(topicList) {
			if (topicList) {
				topicList.comment = comment;
				me.loadTopicList(cmp, topicList, record, function(topicView, view) {
					if (cb) {
						cb.call(scope, view.down('forums-topic-view'));
					}
				});
			}
		});
	},


	loadComment: function(cmp, record, cb, scope) {
		if (!record) {
			console.error('Cant present comment with no record');
			return;
		}

		var me = this;

		Service.getObject(record.get('ContainerId'), function(topic) {
			if (topic) {
				me.loadTopic(cmp, topic, record, cb, scope);
			}
		});
	},


	saveTopicComment: function(editor, record, valueObject, successCallback) {
		var postCmp = editor.up('forums-topic-view') || editor.up('[record]'),
			postRecord = (postCmp && postCmp.getTopic && postCmp.getTopic()) || (postCmp && postCmp.record),
			isEdit = Boolean(record), postLink,
			commentForum = record || NextThought.model.forums.GeneralForumComment.create();

		commentForum.set({ body: valueObject.body });

		if (editor.el) {
			editor.el.mask('Saving...');
			editor.el.repaint();
		}


		function unmask() {
			if (editor.el) {
				editor.el.unmask();
			}
		}

		isEdit = isEdit && !Ext.isEmpty(commentForum.get('href'));

		if (!isEdit) {
			postLink = postRecord && postRecord.getLink('add');

			while (!postLink && postRecord) {
				postCmp = postCmp.up('[record]');
				postRecord = postCmp && postCmp.record;
				postLink = postRecord && postRecord.getLink('add');
			}
		} else {
			postLink = undefined;
		}

		try {

			commentForum.save({
				url: postLink,//only use postRecord if its a new post.
				scope: this,
				success: function(rec) {
					var topicCmp = Ext.ComponentQuery.query('forums-topic')[0];
					console.log('Success: ', rec);
					unmask();

					if (!postCmp.isDestroyed) {

						try {
							/*if (!isEdit) {
								if (postCmp.store && !postCmp.store.buffered) {
									postCmp.store.insert(0, rec);
								}
								if (topicCmp && postCmp !== topicCmp && topicCmp.store) {
									topicCmp.store.add(rec);
								}
							}*/
						} catch (e) {
							console.error(e.stack || e.message || e);
						} finally {
							editor.deactivate();
							editor.setValue('');
							editor.reset();
						}
					}

					Ext.callback(successCallback, null, [editor, postCmp, rec]);

					//TODO: increment PostCount in postRecord the same way we increment reply count in notes.
					if (!isEdit) {
						postRecord.set('PostCount', postRecord.get('PostCount') + 1);
					}
				},
				failure: function() {
					console.log('Failed: ', arguments);
					editor.markError(editor.getEl(), 'Could not save comment');
					unmask();
					console.debug('failure', arguments);
				}
			});

		}
		catch (e) {
			console.error('An error occurred saving comment', Globals.getError(e));
			unmask();
		}

	},


	createForum: function(cmp, beneathBoard, title, description, permissions) {
	},


	showForumEditor: function(cmp, record) {
		Ext.widget('forumcreation-window', {
			ownerCmp: cmp,
			record: record
		}).show();
	},


	showNewTopicEditor: function(cmp, topicList, closeCallback) {
		this.showTopicEditor(cmp, null, topicList, closeCallback);
	},


	showTopicEditor: function(cmp, topicRecord, topicList, closeCallback) {
		var view = this.getCardContainer(cmp);

		function finish(v, forumList) {
			v.showTopicEditor(topicRecord, topicList, forumList, closeCallback);
		}

		if (topicRecord) {
			UserRepository.getUser(topicRecord.get('Creator'), function(c) {
				topicRecord.set('Creator', c);
			});
		}

		if (view) {
			finish(view);
		} else {
			Service.getObject(topicList.get('ContainerId'), function(forumList) {
				if (forumList) {
					me.loadForum(null, forum, topicList.getId(), null, true)
						.done(function(v) {
							finish(v, forumList);
						});
				}
			});
		}
	},


	enableTopicNavigation: function(cmp, record, callback) {
		if (!record || !cmp) { return; }
		var storeId = 'CommunityForum' + '-' + record.get('ContainerId'),
			store = Ext.StoreManager.lookup(storeId);

		if (store) {
			store.on('load', function() {
				Ext.callback(callback, null, [cmp, store]);
			}, null, {'single': true});

			if (!store.isLoading()) {
				store.load();
			}
		}
		else {
			console.warn('Could not find store which owns record: ', record);
		}
	},


	applyTopicToStores: function(topic) {
		var recordForStore;
		this.getController('UserData').applyToStoresThatWantItem(function(id, store) {
			if (store) {
				if (store.findRecord('NTIID', topic.get('NTIID'), 0, false, true, true)) {
					console.warn('Store already has item with id: ' + topic.get('NTIID'), topic);
				}

				if (!recordForStore) {
					//Each store gets its own copy of the record. A null value indicates we already added one to a
					// store, so we need a new instance.  Read it out of the orginal raw value.
					recordForStore = ParseUtils.parseItems([topic.raw])[0];
				}

				//The store will handle making all the threading/placement, etc
				store.add(recordForStore);
				//once added, null out this pointer so that subsequant loop iterations don't readd the same instance to
				// another store. (I don't think our threading algorithm would appreciate that)
				recordForStore = null;
			}
		}, topic);
	},


	saveTopicPost: function(editorCmp, record, forum, title, tags, body, autoPublish) {
		var isEdit = Boolean(record),
			cmp = editorCmp.up('forums-topic-view'),
			post = isEdit ? record.get('headline') : NextThought.model.forums.CommunityHeadlinePost.create(),
			me = this;

		// NOTE: Forums entries are PUBLIC only.
		autoPublish = true;

		post.set({
			'title': title,
			'body': body,
			'tags': tags || []
		});

		if (isEdit) {
			record.set({'title': title});
		}

		function finish(entry) {
			if (!isEdit) {
				//This is how the views are reading the display name... pre-set the Creator as your userObject.
				if (isMe(entry.get('Creator'))) {
					entry.set('Creator', $AppConfig.userObject);
				}
				try {
					if (cmp && cmp.store) {
						cmp.store.insert(0, entry);
					}
				}
				catch (e) {
					console.error('Could not insert post into widget', Globals.getError(e));
				}

				me.applyTopicToStores(entry);
			}

			Ext.callback(editorCmp.onSaveSuccess, editorCmp, [entry, isEdit]);
		}

		if (editorCmp.el) {
			editorCmp.el.mask('Saving...');
		}

		function unmask() {
			if (editorCmp.el) {
				editorCmp.el.unmask();
			}
		}

		try {
			post.getProxy().on('exception', editorCmp.onSaveFailure, editorCmp, {single: true});
			post.save({
				url: isEdit ? undefined : forum && forum.getLink('add'),//only use postRecord if its a new post.
				scope: this,
				success: function(post, operation) {
					var entry = isEdit ? record : ParseUtils.parseItems(operation.response.responseText)[0];

					if (autoPublish !== undefined) {
						if (autoPublish !== entry.isPublished()) {
							entry.publish(editorCmp, finish, this);
							return;
						}
					}

					//We have nested objects here.  The entry contains a headline whose body, title, and tags
					//have been updated.  Our magic multi object setter won't find the nested object in the store
					//so we set it back on the original record to trigger other instances of the entry to be updated.
					//Not doing this reflects itself by the body of the topic not updating in the activity view
					if (isEdit && record) {
						record.set('headline', record.get('headline'));
					}

					unmask();
					finish(entry);
				},
				failure: function() {
					console.debug('failure', arguments);
					unmask();
				}
			});
		}
		catch (e) {
			console.error('An error occurred saving blog', Globals.getError(e));
			unmask();
		}
	},


	saveForum: function(editorCmp, record, title, description, open) {
		var isEdit = Boolean(record),
			cmp = editorCmp.up('forumcreation-window').ownerCmp,
			forum = isEdit ? record : NextThought.model.forums.Forum.create(),
			board = cmp.record;

		function finish(entry) {
			//add the entry into the appropiate stores?
			if (!isEdit) {
				try {
					if (cmp.store) {
						cmp.store.insert(0, entry);
					}
				}
				catch (e) {
					console.error('Could not insert post into widget', Globals.getError(e));
				}
			}
			unmask();
			editorCmp.onSaveSuccess();
		}

		function unmask() {
			if (editorCmp.el) {
				editorCmp.el.unmask();
			}
		}

		function updateForum() {
			forum.set({
				title: title,
				description: description
			});

			if (!isEdit) {
				forum.set({
					ContainerId: board.getId()
				});
			}

			forum.getProxy().on('exception', editorCmp.onSaveFailure, editorCmp, {single: true});
			forum.save({
				url: isEdit ? undefined : board && board.getLink('add'),
				success: function(post, operation) {
					var entry = isEdit ? record : ParseUtils.parseItems(operation.response.responseText)[0];

					finish(entry);
				},
				failure: function() {
					console.debug('Failed to save new/edited forum', arguments);
					unmask();
				}
			});
		}

		try {
			if (editorCmp.el) {
				editorCmp.el.mask('Saving...');
			}
			//If we are creating a course and the forum is for enrolled students only
			if (!open && !isEdit) {
				board.findCourse()
					.done(function(course) {
						if (course) {
							//set the forums ACL to restricted
							forum.set('ACL', [{
					            'Action': 'Allow',
					            'Class': 'ForumACE',
					            'Entities': course.getScope('restricted'),
					            'MimeType': 'application/vnd.nextthought.forums.ace',
					            'Permissions': [
					                'Read',
					                'Create'
					            ]
					        }]);
						}

						updateForum();
					})
					.fail(function(reason) {
						console.error('Failed to find course', reason);
						alert('An error occured saving the forum, please try again later.');
					});
			} else {
				updateForum();
			}
		}catch (e) {
			console.error('An error occurred saving forum', Globals.getError(e));
			unmask();
		}
	},


	deleteObject: function(record, cmp, callback) {
		var idToDestroy, me = this;
		if (!record.get('href')) {
			record.set('href', record.getLink('contents').replace(/\/contents$/, '') || 'no-luck');
		}
		idToDestroy = record.get('NTIID');

		function maybeDeleteFromStore(id, store) {
			var r;
			if (store && !store.buffered) {
				r = store.findRecord('NTIID', idToDestroy, 0, false, true, true);
				if (!r) {
					console.warn('Could not remove, the store did not have item with id: ' + idToDestroy, r);
					return;
				}

				//The store will handle making it a placeholder if it needs and fire events,etc... this is all we need to do.
				store.remove(r);
			}
		}

		record.destroy({
			success: function() {
				me.getController('UserData').applyToStoresThatWantItem(maybeDeleteFromStore, record);

				//Delete anything left that we know of
				Ext.StoreManager.each(function(s) {
					maybeDeleteFromStore(null, s);
				});

				Ext.callback(callback, null, [cmp]);
			},
			failure: function() {
				alert('Sorry, could not delete that');
			}
		});
	},


	getActiveForumContainer: function() {
		var global = this.getGlobalForum(),
			globalActive = global && global.isActive(),
			course = this.getCourseForum(),
			courseActive = course && course.isActive();

		if (globalActive && !courseActive) {
			return global;
		}

		if (!globalActive && courseActive) {
			return course;
		}

		console.error('Both global and course forums are active...?');
	},

	//Socket handling
	incomingChange: function(change) {
		function updateRecordFieldCount(id, field) {
			if (!id || !field) {
				return;
			}

			Ext.StoreManager.each(function(s) {
				var found = s.getById(id);
				if (found) {
					found.set(field, found.get(field) + 1);
					return false; //Note we break here because set will have updated the remaining instances;
				}
				return true;
			});
		}

		var item,
			container = this.getActiveForumContainer(),
			topic = container && container.down('forums-topic-view');

		if (!change.isModel) {
			change = ParseUtils.parseItems([change])[0];
		}

		item = change.get('Item');
		if (item && /generalforumcomment$/.test(item.get('MimeType'))) {
			if (topic && topic.addIncomingComment) {
				topic.addIncomingComment(item);
				return;
			}
			updateRecordFieldCount(item.get('ContainerId'), 'PostCount');
		}
		else if (item && /communityheadlinetopic$/.test(item.get('MimeType'))) {
			updateRecordFieldCount(item.get('ContainerId'), 'TopicCount');
		}
	},


	//Search functions
	highlightSearchResult: function(result, fragIdx, cmp) {
		var topicView = cmp || this.getForumViewContainer().peek(),
			hit = result.hit,
			frag = fragIdx !== undefined ? hit.get('Fragments')[fragIdx] : undefined;

		if (topicView && topicView.showSearchHit) {
			topicView.showSearchHit(hit, frag);
		}
	},

	//NTIID navigation handler
	navigateToForumContent: function(obj, fragment) {
		var me = this;

		if (obj instanceof NextThought.model.forums.Base) {
			if (me.fireEvent('show-view', 'forums', true)) {
				me.presentForumItem(obj);
				return false;
			}
		}
		return true;
	}
});
