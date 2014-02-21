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
		{ ref: 'forumViewContainer', selector: 'forums-view-container#forums'}
	],

	init: function() {

		this.listen({
			component: {
				'forums-container': {
					'restore-forum-state': 'restoreState',
					'render': 'loadBoardList'
				},

				'forums-container > *': {
					'pop-view': 'popView'
				},

				'course-forum > *': {
					'pop-view': 'popView'
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
				'#forums > forums-topic nti-editor': {
					'save': 'saveTopicComment'
				},

				'#content > course-forum nti-editor': {
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
					'new-topic': 'showNewTopicEditor'
				}
			},
			controller: {
				'*': {
					'show-object': this.navigateToForumContent,
					'show-topic': this.presentTopic
				}
			}
		});
	},


	getCardContainer: function(cmp) {
		return cmp && cmp.up('[isForumContainer]');
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


	//An array denoting the precedence of data in state
	stateKeyPrecedence: ['board', 'forum', 'topic', 'comment'],


	handleRestoreState: function(state, promise) {
		console.log('Handle restore of state here', state);
		this.popToLastKnownMatchingState(state);
		this.pushKnownState(state);

		if (promise) {
			promise.fulfill();
		}
		else {
			//Ruh roh
			console.error('No forum container to fire finish restoring.  Expect problems', this);
		}
	},


	restoreState: function(s, promise) {
		var state = s.forums || {},
			me = this;

		function handle() {
			me.handleRestoreState(state, promise);
		}

		//TODO: convert this entire chain of events to promises...
		//make sure loadRoot has finished
		if (me.loadingRoot) {
			me.on('root-loaded', handle, me, {single: true});
		}else {
			handle();
		}
	},


	doesViewMatchState: function(v, key, val) {
		var vVal;
		if (!v.record || v.stateKey !== key) {
			return false;
		}

		vVal = v.record.get('ID');

		function equals(a, b) {
			return a.community === b.community && a.isUser === b.isUser;
		}

		if (Ext.isObject(val) && val.isUser) {
			vVal = v.record.get('Creator');
			if (vVal.isModel) {
				vVal = vVal.get('Username');
			}
			vVal = {
				isUser: true,
				community: vVal
			};
		}

		return Ext.isObject(vVal) ? equals(vVal, val) : vVal === val;
	},


	pushKnownState: function(state) {
		var c = this.getForumViewContainer(),
			community = state && state.board && state.board.community,
			stackOrder = this.stateKeyPrecedence,
			stateKey = (c.peek() || {}).stateKey,
			i = stackOrder.indexOf(stateKey),
			toLoad = [],
			me = this;

		function getBaseUrl(rec) {
			var base = rec && rec.get('href');

			if (!base && stateKey !== 'root') {
				return null;
			}

			if (!base && community) {
				Ext.each($AppConfig.userObject.getCommunities(), function(r) {
					if (r.get('Username') === community) {
						base = r.getLink('DiscussionBoard');
						return false;
					}
					return true;
				});
			}

			return base;
		}


		if (i < 0 && stateKey !== 'root') {
			return;
		}

		for (i = i + 1; i < stackOrder.length; i++) {
			if (!state[stackOrder[i]]) {
				break;
			}

			toLoad.push([stackOrder[i], state[stackOrder[i]]]);
		}

		this.pushViews(getBaseUrl(c.peek().record), toLoad, null, null, true);
	},


	pushNecessaryViews: function(href, recordType, cb, scope) {
		var c = this.getForumViewContainer(),
			stackOrder = this.stateKeyPrecedence,
			showingStateKey = (c.peek() || {}).stateKey,
			i, toLoad = [], parts = [], base, pieces,
			state = {},
			me = this;

		//First order of business is to figure out the base url
		//followed by the ids that need to load.  Unlike state we work
		//backwards here.  We also assume our record is topic
		//this may need to change breifly for comments but it is a start

		//The idea here is to pop pieces off the end of the href we want to show
		//collecting ids for each of the views between where we are and where we are going
		//Stop when we run out of parts to show or we get to something that looks
		//like the top view
		i = stackOrder.indexOf(recordType);
		pieces = href.split('/');
		for (i; i >= 0; i--) {
			if (showingStateKey === stackOrder[i]) {
				break;
			}
			if (Ext.isEmpty(pieces)) {
				Ext.callback(cb, scope, [false]);
				return;
			}
			parts.push(pieces.pop());
		}
		parts.reverse();
		base = pieces.join('/');


		console.log('Show from', base, 'Parts ', parts);

		i = stackOrder.indexOf(recordType);
		Ext.each(parts, function(part) {
			toLoad.push([stackOrder[i], part]);
			i--;
		}, this, true);

		toLoad.reverse();
		//Ok we have built up what we need to show.Show it
		this.pushViews(base, toLoad, cb, scope);

	},


	//Fetch all the needed records
	//and start pushing views.  Note we do this silently so state does not get updated
	//in many chunks.  We gather state as it is needed and push it once at
	//the end if requested.  This keeps back and forward (at least within this function) working
	//like you would expect.  There are still issues with state not being transactional
	//with the action the user expects.  For instance coming from another tab has
	//a state change for the tab showing and then our state change.  We should
	//fix that.
	pushViews: function(base, toLoad, cb, scope, silent) {
		var stackOrder = this.stateKeyPrecedence,
			state = {},
			comment,
			me = this;

		function stateForKey(key, rec) {
			var community;
			if (key === 'board') {
				community = rec.get('Creator');
				if (community.isModel) {
					community = rec.get('Username');
				}
				return {isUser: true, community: community};
			}
			return rec.get('ID');
		}

		console.log('Need to push views. Base', base, 'toLoad', toLoad);

		if (toLoad.last() && toLoad.last()[0] === 'comment') {
			comment = toLoad.pop();
		}

		this.getRecords(base, toLoad, function(records) {
			var j = records.first() ? (stackOrder.indexOf(records.first()[0])) : (stackOrder.length - 1),
				maybeTopic, shouldFireCallBack = true;

			Ext.each(records, function(pair, index, allItems) {

				try {
					var rec = pair.last(),
						type = Ext.String.capitalize(pair.first()),
						f = me.getForumViewContainer();

					if (!rec) {
						//Error callback here?
						return false;
					}

					// NOTE: When we push views as a bulk, we only want to activate the last item.
					// Thus we suspend activating views till we're on the last item.
					// This allows us to only load store based on 'activate' events
					if (index < allItems.length - 1) {
						f.suspendActivateEvents();
					} else {
						f.resumeActivateEvents();
					}

					me['load' + type](null, rec, true);
					state[pair[0]] = stateForKey(pair[0], pair[1]);
					j++;

					return true;
				}
				catch (e) {
					console.warn('Something went wrong.', e.stack || e.message || e);
					return false;
				}
			});

			for (j; j < stackOrder.length; j++) {
				state[stackOrder[j]] = undefined;
			}

			//If we have a comment push it onto the last view
			//which should be the topic.  Also make sure we push it into
			//state since we just blanked it out
			maybeTopic = me.getForumViewContainer().peek();
			if (maybeTopic.goToComment) {
				if (comment) {
					maybeTopic.on('commentReady', function() { Ext.callback(cb, scope, [true]);}, null, { single: true});
					maybeTopic.goToComment(comment[1]);
					state[comment[0]] = comment[1];
					shouldFireCallBack = false;
				}
				else {
					maybeTopic.goToComment(null);
				}
			}


			//Push state if not requested to be silent
			if (silent !== true) {
				this.pushState(state);
			}

			//callback
			if (shouldFireCallBack) {
				Ext.callback(cb, scope, [true, maybeTopic]);
			}
		});
	},


	getRecords: function(base, ids, callback) {
		var href = getURL(base),
			finish = ids.length,
			me = this;


		if (!base || Ext.isEmpty(ids)) {
			if (ids[0]) {
				ids[0][1] = null;
			}
			Ext.callback(callback, me, [ids]);
			return;
		}

		function maybeFinish() {
			finish--;
			if (finish === 0) {
				Ext.callback(callback, me, [ids]);
			}
		}

		Ext.each(ids, function(pair) {

			//Only "board" level will have a non-string. And its already accounted for in the base.
			href += (!Ext.isString(pair[1]) ? '' : '/' + pair[1]);

			var r = {
				url: href,
				callback: function(req, s, resp) {
					try {
						pair[1] = ParseUtils.parseItems(resp.responseText)[0];
					}
					catch (e) {
						var msgCfg = {
							icon: Ext.Msg.ERROR,
							title: 'Oops!',
							msg: 'There was a problem looking up that resource.\nPlease try again later.'
						};

						pair[1] = null;
						console.error('Could not load record', Globals.getError(e));
						if (resp.status === 404) {
							msgCfg.title = 'Not Found!';
							msgCfg.msg = 'The object you are looking for no longer exists.';
						}
						else if (resp.status === 403) {
							msgCfg.title = 'Sorry.';
							msgCfg.msg = 'You do not have access to this resource.';
						}
						alert(msgCfg);
					}
					maybeFinish();
				}
			};

			Ext.Ajax.request(r);
		});
	},


	popToLastKnownMatchingState: function(state) {
		var me = this;
		function predicate(item, i) {
			var part = me.stateKeyPrecedence[i - 1];
			return part && state[part] && me.doesViewMatchState(item, part, state[part]);
		}

		this.popToLastViewMatchingPredicate(predicate);
	},


	popToLastViewMatchingPredicate: function(predicate) {
		var c = this.getForumViewContainer(), i, item,
			lastKnownMatcher, part; //Skip the root element

		if (c.items.getCount() <= 1 || !Ext.isFunction(predicate)) {
			return;
		}

		lastKnownMatcher = c.items.getAt(0);

		for (i = 1; i < c.items.getCount(); i++) {
			item = c.items.getAt(i);
			if (!predicate(item, i)) {
				break;
			}
			lastKnownMatcher = item;
		}

		while (c.peek() !== lastKnownMatcher) {
			c.popView();
		}
	},


	popView: function(view) {
		var stack = view.ownerCt,
			keyIx = Ext.Array.indexOf(this.stateKeyPrecedence, view.stateKey),
			state = {};

		//assert that the view is the top of the stack
		if (stack.peek() !== view) {
			console.error('View was not at the top of stack when it requested to pop.', view);
			return false;
		}

		try {
			stack.popView();//this should destroy view for us, but just in case...
			if (!view.isDestroyed) {
				view.destroy();
			}

			for (keyIx; keyIx >= 0 && keyIx < this.stateKeyPrecedence.length; keyIx++) {
				state[this.stateKeyPrecedence[keyIx]] = undefined;
			}

			this.pushState(state);

		} catch (e) {
			console.warn(Globals.getError(e));
		}

		return true;
	},


	pushState: function(s) {
		history.pushState({forums: s});
	},


	replaceState: function(s) {
		history.replaceState({forums: s});
	},


	presentTopic: function(cmp, record, comment, cb, scope) {
		if (!record) {
			console.error('Cant present a topic with an empty record');
			return;
		}

		var me = this;

		Service.getObject(record.get('ContainerId'), function(topicList) {
			if (topicList) {
				topicList.comment = comment;
				me.loadTopicList(cmp, topicList, record.getId(), function() {
					if (cb) {
						cb.apply(scope, arguments);
					}
				});
			}
		});
	},


	loadCommunityBoards: function() {
		var p = PromiseFactory.make(),
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

					//TODO: if there is only one board go ahead and load it
					if (view.showBoardList) {
						view.showBoardList(store);
					}
				}
			});

	},


	loadForumList: function(cmp, record, activeForumId, silent, wait) {
		if (Ext.isArray(record)) { record = record[0]; }

		var p = PromiseFactory.make(),
			me = this, view = this.getCardContainer(cmp),
			community = record.get('Creator');

		record.activeNTIID = activeForumId;

		function finish(v) {
			if (v.showForumList) {
				if (wait) {
					p.fulfill(v);
				} else {
					view.showForumList(record);
				}
			}

			if (silent !== true) {
				//The communities board we are viewing
				me.pushState({board: {community: community, isUser: true}, forum: undefined, topic: undefined, comment: undefined});
			}
		}

		if (view) {
			if (community.isModel) {
				community = community.get('Username');
			} else {
				UserRepository.getUser(community)
					.done(function(c) {
						record.set('Creator', c);
						finish(view);
					});

				return p;
			}

			finish(view);
		} else {
			record.findCourse()
				.done(function(course) {
					view = me.callOnAllControllersWith('onNavigateToForum', record, course);
					finish(view);
				});
		}

		return wait ? p : true;
	},



	loadTopicList: function(cmp, record, activeTopicId, callback, silent) {
		if (Ext.isArray(record)) { record = record[0]; }

		if (!record.isModel) { return; }

		var me = this, view = this.getCardContainer(cmp);

		record.activeNTIID = activeTopicId;

		function finish(v, forumList) {
			var topicView = v.showTopicList(record, forumList);

			if (callback && Ext.isFunction(callback)) {
				callback.call(this, topicView);
			}

			if (silent !== true) {
				me.pushState({'forum': record.get('ID'), topic: undefined, comment: undefined}); //The forum we are viewing
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
					me.loadForumList(null, forumList, record.getId(), null, true)
						.done(function(v) {
							finish(v, forumList);
						});
				}
			}, function(req, resp) {
				console.error('Faild to load forum-list for topic:', req, resp);
			},me, true);
		}
	},


	saveTopicComment: function(editor, record, valueObject, successCallback) {
		var postCmp = editor.up('[record]'),
			postRecord = postCmp && postCmp.record,
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
							if (!isEdit) {
								if (postCmp.store) {
									postCmp.store.insert(0, rec);
								}
								if (topicCmp && postCmp !== topicCmp && topicCmp.store) {
									topicCmp.store.add(rec);
								}
							}
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


	loadTopic: function(selModel, record, silent) {
		if (Ext.isArray(record)) { record = record[0]; }
		var c = this.getCardContainer(selModel),
			o = c.items.last(),
			forum = c.down('course-forum-topic-list, forums-topic-list'),
			store = forum && forum.store,
			index = store && store.indexOf(record);

		if (o && !o.getPath) { o = null; }

		c.add({xtype: 'forums-topic', topicListStore: store, currentIndex: index, record: record, path: o && o.getPath(), stateKey: 'topic'});

		if (silent !== true && (selModel || {}).suppressPushState !== true) {
			this.pushState({'topic': record.get('ID'), comment: undefined});
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

			Ext.callback(editorCmp.onSaveSuccess, editorCmp, [entry]);
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

		try {
			if (editorCmp.el) {
				editorCmp.el.mask('Saving...');
			}
			//If we are creating a course and the forum is for enrolled students only
			if (!open && !isEdit) {
				if (board.getRelatedCourse()) {
					//set the forums ACL to restricted
					forum.set('ACL', [{
			            'Action': 'Allow',
			            'Class': 'ForumACE',
			            'Entities': board.getRelatedCourse().getScope('restricted'),
			            'MimeType': 'application/vnd.nextthought.forums.ace',
			            'Permissions': [
			                'Read',
			                'Create'
			            ]
			        }]);
				}
			}

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
			if (store) {
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
			maybeTopic = this.getForumViewContainer().peek();

		if (!change.isModel) {
			change = ParseUtils.parseItems([change])[0];
		}

		item = change.get('Item');
		if (item && /generalforumcomment$/.test(item.get('MimeType'))) {
			if (maybeTopic && maybeTopic.addIncomingComment) {
				maybeTopic.addIncomingComment(item);
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
				me.presentTopic(obj);
				return false;
			}
		}
		return true;
	}
});
