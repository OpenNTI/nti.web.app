Ext.define('NextThought.controller.Profile', {
	extend: 'Ext.app.Controller',

	models: [
		'forums.Post',
		'forums.PersonalBlog',
		'forums.PersonalBlogComment',
		'forums.PersonalBlogEntry',
		'forums.PersonalBlogEntryPost'
	],

	stores: [
		'Blog'
	],

	views: [
		'profiles.Panel',
		'profiles.parts.Activity',
		'profiles.parts.ActivityItem',
		'profiles.parts.Blog',
		'profiles.parts.BlogEditor',
		'profiles.TabPanel'
	],

	refs: [
		{ ref: 'profileView', selector: '#profile'},
		{ ref: 'profileActivity', selector: '#profile profile-activity'}
	],

	init: function() {

		this.fillInActivityPanels = Ext.Function.createThrottled(this.fillInActivityPanels, 500, this);

		this.listen({
			component: {
				'*': {
					'show-profile': 'showProfile'
				},

				'profile-panel-old': {
					'scroll': 'fillInActivityPanels'
				},
				'profile-panel': {
					'profile-body-scroll': 'fillInActivityPanels'
				},

				//bubbled events don't get caught by the controller on bubbleTargets... so listen directly on what is firing
				'profile-blog-post': {
					'delete-post': 'deleteBlogPost'
					//'scroll-to': 'scrollProfileTo'
				},
				'profile-blog-comment': { 'delete-post': 'deleteBlogPost' },
				'profile-blog-list-item': { 'delete-post': 'deleteBlogPost' },
				'activity-preview-blog-reply': {
					'delete-blog-comment': 'deleteBlogPost'
				},

				'profile-blog-editor': {
					'save-post': 'saveBlogPost'
				},

				'#profile profile-blog-post nti-editor': {
					'save': 'saveBlogComment'
				},

				'activity-preview-personalblogentry > nti-editor': {
					'save': 'saveBlogComment'
				},

				'activity-preview-blog-reply > nti-editor': {
					'save': 'saveBlogComment'
				}
			},
			controller: {
				'*': {
					'show-profile': 'showProfile'
				},
				'#Store': {
					'purchase-complete': 'redrawActivity'
				}
			}
		});
	},


	showProfile: function(user, args, callback) {
		history.beginTransaction('showing-profile');
		if (!this.fireEvent('before-show-profile') || !this.fireEvent('show-view', 'profile')) {
			history.endTransaction('showing-profile');
			return false;
		}

		//TODO: This function may need to move to a shared location. Feels dirty referencing sibling controller.
		var url = user.getProfileUrl.apply(user, args),
			o = this.getController('State').interpretFragment(url),
			v = this.getProfileView();

		v.on('finished-restore', function() {
			console.debug('Finished restore', o);
			history.pushState(o, document.title, url);
			history.endTransaction('showing-profile');
			Ext.callback(callback, null, [user]);
		},this, {single: true});

		v.restore(o);


		return true;
	},


	fillInActivityPanels: function(event, dom) {
		var cmp = Ext.getCmp(dom.getAttribute('id'));

		function maybeFill(item) { item.maybeFillIn(); }

		Ext.each(cmp.query('profile-activity-item'), maybeFill);
	},


	redrawActivity: function() {
		var c = this.getProfileActivity(),
				s = c && c.getStore();

		if (c && s) {
			s.currentPage = 1;
			c.removeAll(true);
			s.load();
		}
	},


	applyBlogPostToStores: function(entry) {
		var recordForStore;
		this.getController('UserData').applyToStoresThatWantItem(function(id, store) {
			if (store) {
				console.log(store, entry);

				if (store.findRecord('NTIID', entry.get('NTIID'), 0, false, true, true)) {
					console.warn('Store already has item with id: ' + entry.get('NTIID'), entry);
				}

				if (!recordForStore) {
					//Each store gets its own copy of the record. A null value indicates we already added one to a
					// store, so we need a new instance.  Read it out of the orginal raw value.
					recordForStore = ParseUtils.parseItems([entry.raw])[0];
				}

				//The store will handle making all the threading/placement, etc
				store.add(recordForStore);
				//once added, null out this pointer so that subsequant loop iterations don't readd the same instance to
				// another store. (I don't think our threading algorithm would appreciate that)
				recordForStore = null;
			}
		}, entry);
	},


	saveBlogComment: function(editor, record, valueObject, saveCallback) {
		var postCmp = editor.up('[record]'),
		postRecord = postCmp && postCmp.record,
		isEdit = Boolean(record),
		commentPost = record || new NextThought.model.forums.PersonalBlogComment();

		commentPost.set({ body: valueObject.body });

		if (editor.el) {
			editor.el.mask('Saving...');
			editor.el.repaint();
		}

		function unmask() {
			if (editor.el) {
				editor.el.unmask();
			}
		}

		try {

			commentPost.save({
				url: isEdit ? undefined : postRecord && postRecord.getLink('add'),//only use postRecord if its a new post.
				scope: this,
				success: function(rec) {
					var blogCmp = Ext.ComponentQuery.query('profile-blog-post')[0];
					unmask();
					if (!postCmp.isDestroyed) {
						if (!isEdit) {
							if (postCmp.store) {
								postCmp.store.insert(0, rec);
							}
							if (blogCmp && postCmp !== blogCmp && blogCmp.store) {
								blogCmp.store.add(rec);
							}
						}
						editor.deactivate();
						editor.setValue('');
						editor.reset();
					}

					Ext.callback(saveCallback, null, [editor, postCmp, rec]);

					//TODO: increment PostCount in postRecord the same way we increment reply count in notes.
					if (!isEdit) {
						postRecord.set('PostCount', postRecord.get('PostCount') + 1);
					}
				},
				failure: function() {
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


	incomingChange: function(change) {
		if (!change.isModel) {
			change = ParseUtils.parseItems([change])[0];
		}

		var item = change.get('Item'), blogCmp;

		if (item && /personalblogcomment$/.test(item.get('MimeType'))) {
			blogCmp = Ext.ComponentQuery.query('profile-blog-post');

			//Add the comment into the view if it is present
			if (blogCmp.length > 0) {
				blogCmp.first().addIncomingComment(item);
			}

			//See if we can find an item in a store some where
			//and increment the post count.
			Ext.StoreManager.each(function(s) {
				var found = s.getById(item.get('ContainerId'));
				if (found) {
					found.set('PostCount', found.get('PostCount') + 1);
					return false; //Note we break here because set will have updated the remaining instances;
				}
				return true;
			}, this);
		}
	},


	saveBlogPost: function(editorCmp, record, title, tags, body, sharingInfo) {
		var isEdit = Boolean(record),
			post = isEdit ? record.get('headline') : NextThought.model.forums.PersonalBlogEntryPost.create(),
			blogRecord = editorCmp.up('profile-blog') ? editorCmp.up('profile-blog').record : null;
			me = this;

		//TODO save old values so we can revert them on error?
		//See also beginEdit cancelEdit

		function finish(entry, editorCmp) {
			var blogCmp = editorCmp.up('profile-blog');
			if (!isEdit) {
				try {
					if (blogCmp.store) {
						blogCmp.store.insert(0, entry);
					} else {
						blogCmp.buildBlog(true);
					}
					me.applyBlogPostToStores(entry);
				}
				catch (e) {
					console.error('Could not insert blog post into blog widget', Globals.getError(e));
				}
			}

			unmask();
			Ext.callback(editorCmp.onSaveSuccess, editorCmp, []);
		}

		if (editorCmp.el) {
			editorCmp.el.mask('Saving...');
		}

		function unmask() {
			if (editorCmp.el) {
				editorCmp.el.unmask();
			}
		}

		

		post.set({
			'title': title,
			'body': body,
			'tags': tags
		});

		if (isEdit) {
			//The title is on both the PersonalBlogEntryPost (headline)
			//and the wrapping PersonalBlogEntry (if we have one)
			record.set({'title': title});
		}


		try {
			post.getProxy().on('exception', editorCmp.onSaveFailure, editorCmp, {single: true});
			post.save({
				url: isEdit ? undefined : blogRecord && blogRecord.getLink('add'),
				scope: me,
				success: function(post, operation) {
					//the first argument is the record...problem is, it was a post, and the response from the server is
					// a PersonalBlogEntry. All fine, except instead of parsing the response as a new record and passing
					// here, it just updates the existing record with the "updated" fields. ..we normally want this, so this
					// one off re-parse of the responseText is necissary to get at what we want.
					// HOWEVER, if we are editing an existing one... we get back what we send (type wise)

					var blogEntry = isEdit ? record : ParseUtils.parseItems(operation.response.responseText)[0];
					me.handleShareAndPublishState(blogEntry, sharingInfo, finish, editorCmp);
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


	/**
	 *
	 * @param {NextThought.model.forums.PersonalBlogEntry} blogEntry
	 * @param {Object} sharingInfo
	 * @param {String[]} entities
	 * @param {Function} cb
	 * @param {Ext.Component} cmp
	 * @param {Boolean} resolved
	 */
	handleShareAndPublishState: function(blogEntry, sharingInfo, cb, cmp, resolved) {
		if (!blogEntry) {
			return;
		}
		var fin = Ext.bind(Ext.callback, this, [cb, undefined, [blogEntry, cmp]]),
			finish = new FinishCallback(fin, this),
			updateEntities,
			isPublic = sharingInfo.publicToggleOn,
			hasEntities = !Ext.isEmpty(sharingInfo.entities);

		function handleEntities() {
			var entityFieldName = isPublic ? 'tags' : 'sharedWith',
				entityObject = isPublic ? blogEntry.get('headline') : blogEntry,
				fieldAction = isPublic ? Ext.Array.merge : function(a) { return a; };

			entityObject.set(entityFieldName, fieldAction(sharingInfo.entities, entityObject.get(entityFieldName)));
			entityObject.save({ callback: finish.newTask()});
		}

		if (isPublic && !resolved) {
			fin = Ext.bind(this.handleShareAndPublishState, this, [blogEntry, sharingInfo, cb, cmp, true]);
			UserRepository.getUser(sharingInfo.entities, function(users) {
				sharingInfo.entities = Ext.Array.map(users, function(u) { return u.get('NTIID'); });
				fin();
			});
			return;
		}

		/* There are four distinct states:
		 *	1) Private, no entities
		 *	2) Public, no entities
		 *	3) Private, with entities
		 *	4) Public, with entities.
		 *
		 * The first two are the easiest. Simply toggling publish.  The last two it gets a little dicey.
		 *
		 * For #3, we can simply add the entities to the sharedWith field.
		 * For #4, we add the entities to the TAGS field.
		 *
		 * For transitioning we simpley toggle the publish-state, AND:
		 * If we are going from #3 to #4 we need to move the entities to the tags
		 * If we are Going from #4 to #3 we need to move the entities to the sharedWith.
		 */

		updateEntities = new FinishCallback(hasEntities ? handleEntities : Ext.emptyFn, this);

		if (blogEntry.isPublished() !== isPublic) {
			// This function (publish) is poorly named. It toggles.
			blogEntry.publish(cmp,
					Ext.Function.createSequence(updateEntities.newTask(), finish.newTask(), this),
					this);
		}

		updateEntities.maybeFinish();
		finish.maybeFinish();
	},


	deleteBlogPost: function(record, cmp, successCallback) {
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
				}, this);

				Ext.callback(successCallback, null, [cmp]);
			},
			failure: function() {
				alert('Sorry, could not delete that');
			}
		});
	}
});
