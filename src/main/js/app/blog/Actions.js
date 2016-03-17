export default Ext.define('NextThought.app.blog.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.model.forums.PersonalBlogComment',
		'NextThought.model.forums.PersonalBlogEntryPost',
		'NextThought.app.userdata.Actions'
	],


	constructor: function() {
		this.callParent(arguments);

		this.UserDataActions = NextThought.app.userdata.Actions.create();
	},


	__parseSharingInfo: function(sharingInfo) {
		var entities = sharingInfo.entities,
			newEntities = [], i,
			isPublic = false;

		for (i = 0; i < entities.length; i++) {
			if (Service.isFakePublishCommunity(entities[i])) {
				isPublic = true;
			} else {
				newEntities.push(entities[i]);
			}
		}

		return {
			isPublic: isPublic,
			entities: newEntities
		};
	},


	savePost: function(record, blog, title, tags, body, sharingInfo) {
		var isEdit = Boolean(record),
			post = isEdit ? record.get('headline') : NextThought.model.forums.PersonalBlogEntryPost.create(),
			me = this;

		sharingInfo = this.__parseSharingInfo(sharingInfo);

		//TODO save old values so we can revert them on error?
		//See also beginEdit cancelEdit

		post.set({
			'title': title,
			'body': body,
			'tags': tags
		});

		if (isEdit) {
			//The title is both on the PseronalBlogEntryPost (headline)
			//and the wrapping PersonalBlogEntry (if we have one)
			record.set({'title': title});
		}

		return new Promise(function(fulfill, reject) {
			post.getProxy().on('exception', reject, null, {single: true});
			post.save({
				url: isEdit ? undefined : blog && blog.getLink('add'),
				scope: me,
				success: function(post, operation) {
					//the first argument is the record...problem is, it was a post, and the response from the server is
					// a PersonalBlogEntry. All fine, except instead of parsing the response as a new record and passing
					// here, it just updates the existing record with the "updated" fields. ..we normally want this, so this
					// one off re-parse of the responseText is necissary to get at what we want.
					// HOWEVER, if we are editing an existing one... we get back what we send (type wise)

					fulfill(isEdit ? record : ParseUtils.parseItems(operation.response.responseText)[0]);
				},
				failure: function() {
					console.debug('Failed to save blog: ', arguments);
					reject();
				}
			});
		})
		.then(function(blogEntry) {
			return me.handleShareAndPublishState(blogEntry, sharingInfo);
		})
		.fail(function(reason) {
			console.error('Failed to save blog: ', reason);
			return Promise.reject(reason);
		});
	},



	/**
	 * There are four distinct states:
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
	 *
	 * @param {NextThought.model.forums.PersonalBlogEntry} blogEntry
	 * @param {Object} sharingInfo
	 * @param {String[]} entities
	 * @param {Function} cb
	 * @param {Ext.Component} cmp
	 * @param {Boolean} resolved
	 */
	 handleShareAndPublishState: function(blogEntry, sharingInfo, resolved) {
		if (!blogEntry) {
			return Promise.resolve();
		}

		var isPublic = sharingInfo.isPublic,
			resolveEntities, publish;

		if (isPublic) {
			resolveEntities = UserRepository.getUser(sharingInfo.entities)
				.then(function(users) {
					return users.map(function(u) { return u.get('NTIID'); });
				});
		} else {
			resolveEntities = Promise.resolve(sharingInfo.entities);
		}


		if (blogEntry.isPublished() !== isPublic) {
			publish = new Promise(function(fulfill, reject) {
				//This function (publish) is poorly named. It toggles.
				blogEntry.publish(null, fulfill, this);
			});
		} else {
			publish = Promise.resolve();
		}


		return Promise.all([
			resolveEntities,
			publish
		]).then(function(results) {
			return results[0];
		}).then(function(entities) {
			var name = isPublic ? 'tags' : 'sharedWith',
				object = isPublic ? blogEntry.get('headline') : blogEntry,
				action = isPublic ? Ext.Array.merge : function(a) { return a; };

			object.set(name, action(entities, object.get(name)));

			return new Promise(function(fulfill, reject) {
				object.save({callback: fulfill});
			});
		}).then(function() {
			return blogEntry;
		});

	},


	saveBlogComment: function(record, blogPost, valueObject) {
		var isEdit = Boolean(record && !record.phantom),
			commentPost = record || NextThought.model.forums.PersonalBlogComment.create();

		commentPost.set({body: valueObject.body});

		return new Promise(function(fulfill, reject) {
			commentPost.save({
				url: isEdit ? undefined : blogPost && blogPost.getLink('add'),//only use the blog post record if its a new post.
				success: function(rec) {
					if (!isEdit) {
						blogPost.set('PostCount', blogPost.get('PostCount') + 1);
					}

					fulfill(rec);
				},
				failure: function() {
					console.error('Failed to create blog comment: ', arguments);

					reject();
				}
			});
		});
	},


	deleteBlogPost: function(record) {
		var idToDestroy, me = this;

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

		if (!record.get('href')) {
			record.set('href', record.getLink('contents').replace(/\/contents$/, '') || 'no-luck');
		}

		idToDestroy = record.get('NTIID');


		return new Promise(function(fulfill, reject) {
			record.destroy({
				success: function() {
					me.UserDataActions.applyToStoresThatWantItem(maybeDeleteFromStore, record);

					//Delete anything left that we know of
					Ext.StoreManager.each(function(s) {
						maybeDeleteFromStore(null, s);
					}, me);

					fulfill();
				},
				failure: function() {
					alert('Sorry, could not delete that');
					reject();
				}
			});
		});
	}
});
