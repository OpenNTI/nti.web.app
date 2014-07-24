Ext.define('NextThought.controller.Forums', {
	extend: 'Ext.app.Controller',

	models: [
		'forums.Board',
		'forums.CommunityBoard',
		'forums.CommunityForum',
		'forums.CommunityHeadlinePost',
		'forums.CommunityHeadlineTopic',
		'forums.ContentBoard',
		'forums.ContentForum',
		'forums.ContentCommentPost',
		'forums.ContentHeadlinePost',
		'forums.ContentHeadlineTopic',
		'forums.Forum',
		'forums.CommentPost',
		'forums.HeadlinePost',
		'forums.HeadlineTopic',
		'forums.Post',
		'forums.Topic'
	],

	stores: [
		'NTI'
	],

	views: [],

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
					'render': 'loadBoardList',
					'active-state-changed': 'setActiveState'
				},
				'course-forum': {
					'maybe-show-forum-list': 'maybeShowForumList'
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

				//Why is this so specific?
				'activity-preview-topic nti-editor': {
					'save': 'saveTopicComment'
				},
				'activity-preview-topic-reply > nti-editor': {
					'save': 'saveTopicComment'
				},
				'profile-forum-activity-item nti-editor': {
					'save': 'saveTopicComment'
				},
				'profile-forum-activity-item-reply > nti-editor': {
					'save': 'saveTopicComment'
				},
				'forums-topic-body nti-editor': {
					'save': 'saveTopicComment'
				},

				//Why aren't these of the same type?
				'forums-topic-comment': {
					'delete-topic-comment': 'deleteObject'
				},
				'profile-forum-activity-item': {
					'delete-post': 'deleteObject'
				},
				'activity-preview-topic-reply': {
					'delete-topic-comment': 'deleteObject'
				},
				'profile-forum-activity-item-reply': {
					'delete-topic-comment': 'deleteObject'
				},

				'search-result': {
					'highlight-topic-hit': 'highlightSearchResult'
				},
				'*': {
					'show-topic': 'loadTopic',
					'forums:fill-in-path': 'fillInPath',
					'show-forum-list': 'loadForumList',
					'show-topic-list': 'loadTopicList',
					'show-topic-comment': 'loadComment',
					'new-topic': 'showNewTopicEditor',
					'goto-forum-item': 'presentForumItem'
				}
			},
			controller: {
				'*': {
					//'show-object': 'navigateToForumContent',
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
						if (u.Unresolved) {
							console.error('Broken Creator: ', o.get('Creator'));
						}
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

		if (state.href) {
			return state.href;
		}

		if (!state.board || !state.board.community) { return; }

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


	handleRestoreState: function(state, finish) {
		var url = this.buildUrlFromState(state);

		//we can't restore the state but don't blow up
		if (!url) {
			finish();
		}

		Service.request(url)
				.then(JSON.parse)
				.then(ParseUtils.parseItems.bind(ParseUtils))
				.then(function(objects) {return objects[0];})
				.then(this.presentForumItem.bind(this))
				.fail(function(reason) {
					console.error('Failed to restore forum state: ', reason);
				})
				.then(finish);
	},


	getStateRestorationHandler: function(key) {
		var me = this;

		if (key === 'forums') {
			return {
				restore: function(state) {
					return new Promise(function(fulfill, reject) {
						me.restoreState(state, fulfill, reject);
					});
				}
			};
		}
	},

	restoreState: function(s, fulfill, reject) {
		var state = s.forums || {},
			contentTab = s.content && s.content.activeTab,
			active = s.active,
			me = this;

		function handle() {
			me.handleRestoreState(state, fulfill, reject);
		}

		//there is a state restoring
		this.stateRestoring = true;

		if (active !== 'forums' && (active !== 'content' || contentTab !== 'course-forum')) {
			return fulfill();
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

		function getNTIID(o) {
			var i = o && o.get && o.get('NTIID');
			if (arguments.length > 1) {
				Array.prototype.forEach.call(arguments, function(o) {
					i = getNTIID(o) || i;
				});
			}

			return i;
		}

		var ntiid = getNTIID(board, forum, topic),
			url = ntiid && ('#!object/ntiid/' + encodeURIComponent(ntiid));

		board = board.get('href');
		forum = forum && forum.get('href');
		topic = topic && topic.get('href');

		history.pushState({forums: { href: topic || forum || board }}, title, url);
	},


	/**
	 * Takes any of the forum models, and navigates to it
	 * @param  {NextThought.model.forums.base} record either a board, forum, or topic
	 */
	presentForumItem: function(record) {
		if (!record) {
			console.error('Cant present an empty record');
			return Promise.resolve();
		}

		if (record.isBoard) {
			return this.loadForumList(null, record);
		}

		if (record.isForum) {
			//if we have a forum load its board and show it as the active one
			return Service.getObject(record.get('ContainerId'))
				.then(function(obj) {
						return this.loadForumList(null, obj, record.getId());
					}.bind(this));
		}

		if (record.isTopic) {
			return this.loadTopic(null, record);
		}

		if (record.isComment) {
			return this.loadComment(null, record);
		}
	},


	loadCommunityBoards: function() {
		var communities = $AppConfig.userObject.getCommunities();

		function loadCommunityBoard(community) {
			var url = community.getLink('DiscussionBoard');

			if (!url) {
				return Promise.resolve([]);
			}

			return Service.request(url)
					.then(ParseUtils.parseItems.bind(ParseUtils))
					.then(function onBoardLoad(objs) {
						return objs.map(function(o) {
							//We create forums on the backend, so if the board has 0, don't show it.
							// except I don't think this applies anymore
							if (o.get('ForumCount') > -1) {
								if (community) {
									o.communityUsername = community.getId();

									if (o.get('Creator') === community.getId()) {
										o.set('Creator', community);
									}
								}
								return o;
							}
						});
					});

		}

		return Promise.all(communities.map(loadCommunityBoard))
			.then(function(results) {
				return results.reduce(function(a, b) { return a.concat(b); }, []);
			})
			.fail(function(reason) {
				console.error('Faild to load boards because:', reason);
				//if we fail for some reason don't break it, just show no boards
				return [];
			});
	},


	loadBoardList: function(view) {
		console.log('Loadroot called', view);

		//don't need to load the boards more than once
		if (this.boardStore && view.showBoardList) {
			view.showBoardList(this.boardStore);
			return Promise.resolve();
		}

		var store = NextThought.store.NTI.create({
				model: 'NextThought.model.forums.Forum',
				id: 'flattened-boards-forums'
			});

		this.loadingRoot = true;

		return this.loadCommunityBoards()
				.then(function(boards) {
					delete this.loadingRoot;

					if (boards) {
						store.add(boards);

						this.boardStore = store;

						//TODO: if there is only one board go ahead and load it
						if (view.showBoardList) {
							view.showBoardList(store);
							this.fireEvent('root-loaded');
						}
					}
				}.bind(this));

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

		var p, me = this, view = this.getCardContainer(cmp),
			community = record.get('Creator');

		record.activeNTIID = activeForumId;

		function finish(v) {
			//once we get here the state restoring is done
			delete me.hasStateToRestore;
			delete me.stateRestoring;

			if (v.showForumList && !wait) {
				v.showForumList(record);
			}

			return v;
		}

		p = community.isModel ?
				Promise.resolve(community) :
				UserRepository.getUser(community).then(function(c) {
					if (c.Unresolved) {
						console.error('Broken Community: ' + community);
					}
					record.set('Creator', c);
					return c;
				});

		if (view) {
			return p.then(finish.bind(this, view));
		}

		return Promise.all([p, record.findBundle()])
				.then(function(results) {return results.last();})//since we're waiting on both, only pass the last result to the next `then`.
				.then(function(bundle) {
					var s = (me.stateRestoring && !me.hasStateToRestore) || silent;
					//if there is a state to restore that we aren't incharge of pass true as the last argument, to keep it from switching the tab.
					return (me.callOnAllControllersWith('onNavigateToForum', record, bundle, s) || Promise.resolve(view))
							.then(function(view) {
								//set a flag to keep the view from updating the state
								view.ignoreStateUpdate = s;
								return finish(view);
							});
				});
	},


	maybeShowForumList: function(cmp, forumsList, silent) {
		//if we aren't restoring a state
		if (!this.hasStateToRestore) {
			return this.loadForumList(cmp, forumsList, null, null, silent);
		}

		return Promise.resolve();
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
		if (!record || !record.isModel) { return; }
		record.activeRecord = activeTopic;

		var me = this,
			view = me.getCardContainer(cmp),
			forumList;

		function finish(v) {
			var topicView = v.showTopicList(record, forumList);
			if (Ext.isFunction(callback)) {
				callback.call(me, topicView, v);
			}
			return v;
		}

		return UserRepository.getUser(record.get('Creator'))
				.then(function(c) {
					if (c.Unresolved) {
						console.error('Broken Community: ' + record.get('Creator'));
					}

					record.set('Creator', c);
				})
				.then(function() {
					return view ? Promise.resolve(view) :
						//get the forum list and add it first
						   Service.getObject(record.get('ContainerId'), null, null, null, true)
								   .then(function(f) {
									   forumList = f;
									   return me.loadForumList(null, f, record.getId(), true);
								   });
				})
				.then(finish);
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
			return Promise.reject('Cant present a topic with an empty record');
		}

		return Service.getObject(record.get('ContainerId'))
				.then(function(topicList) {
					topicList.comment = comment;
					return this.loadTopicList(cmp, topicList, record);
				}.bind(this))
				.then(function(view) {
					if (cb) {
						cb.call(scope, view.down('forums-topic-view'));
					}
				});
	},


	loadComment: function(cmp, record, cb, scope) {
		if (!record) {
			console.error('Cant present comment with no record');
			return Promise.resolve();
		}

		var me = this;

		return Service.getObject(record.get('ContainerId'))
			.then(function(topic) {
				return me.loadTopic(cmp, topic, record, cb, scope);
			});
	},


	saveTopicComment: function(editor, record, valueObject, successCallback) {
		var postCmp = editor.up('forums-topic-view') || editor.up('[record]'),
			postRecord = (postCmp && postCmp.getTopic && postCmp.getTopic()) || (postCmp && postCmp.record),
			isEdit = Boolean(record) && !record.phantom, postLink,
			commentForum = record || NextThought.model.forums.Post.create();

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
				success: function(_, operation) {
					var rec = isEdit ? commentForum : ParseUtils.parseItems(operation.response.responseText)[0],
						topicCmp = Ext.ComponentQuery.query('forums-topic')[0];

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
				if (c.Unresolved) { console.error('Broken Creator:' + topicRecord.get('Creator')); }
				topicRecord.set('Creator', c);
			});
		}

		if (view) {
			finish(view);
		} else {
			Service.getObject(topicList.get('ContainerId'), function(forumList) {
				if (forumList) {
					return me.loadForum(null, forum, topicList.getId(), null, true)
						.then(function(v) {
							return finish(v, forumList);
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
			post = isEdit ? record.get('headline') : NextThought.model.forums.Post.create(),
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
			var record;
			//This is how the views are reading the display name... pre-set the Creator as your userObject.
			if (isMe(entry.get('Creator'))) {
				entry.set('Creator', $AppConfig.userObject);
			}

			try {
				if (cmp && cmp.store) {
					if (isEdit) {
						record = cmp.store.getById(entry.getId());

						if (record) {
							record.copyFrom(entry);
							//force the view to update
							record.afterEdit('title');
							//since headline is a model it is not copied properly
							record.set('headline', entry.get('headline'));
						}
					} else if (!isEdit) {
						cmp.store.insert(0, entry);
					}
				}
			} catch (e) {
				console.error('Could not insert post into widget', Globals.getError(e));
			} finally {
				me.applyTopicToStores(entry);
				Ext.callback(editorCmp.onSaveSuccess, editorCmp, [entry, isEdit]);
			}
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
						record.afterEdit('headline');
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
			var old;

			if (!id || !field) {
				return;
			}

			Ext.StoreManager.each(function(s) {
				var found = s.getById(id), current;
				if (found) {
					current = found.get(field);
					old = old || current;

					//if we haven't already updated
					if (current !== old + 1) {
						found.set(field, found.get(field) + 1);
					}//return false; //Note we break here because set will have updated the remaining instances;
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

		item = change.getItem();
		if (item && /generalforumcomment$/.test(item.get('MimeType'))) {
			if (topic && topic.addIncomingComment) {
				topic.addIncomingComment(item);
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

		if (me.fireEvent('show-view', 'forums', true)) {
			if (me.stateRestoring) {
				me.hasStateToRestore = true;
			}
			me.presentForumItem(obj);
			return false;
		}

		return true;
	},


	getHandlerForNavigationToObject: function(obj, fragment) {
		//if its not a forum we don't want to handle it
		if (!obj instanceof NextThought.model.forums.Base) { return false; }

		//if its one of the types we handle navigation to handle it
		if (obj.isBoard || obj.isForum || (obj.isTopic && !obj.isBlogEntry) || (obj.isComment && !obj.isBlogComment)) {
			return this.navigateToForumContent.bind(this);
		}

		return false;
	}
});
