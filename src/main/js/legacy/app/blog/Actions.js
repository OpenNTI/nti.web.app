const Ext = require('extjs');

const UserRepository = require('legacy/cache/UserRepository');
const FilePicker = require('legacy/common/form/fields/FilePicker');
const ParseUtils = require('legacy/util/Parsing');
const {getString} = require('legacy/util/Localization');
const UserdataActions = require('legacy/app/userdata/Actions');
const PersonalBlogEntryPost = require('legacy/model/forums/PersonalBlogEntryPost');
const PersonalBlogComment = require('legacy/model/forums/PersonalBlogComment');

const BlogStateStore = require('./StateStore');

require('legacy/common/Actions');



module.exports = exports = Ext.define('NextThought.app.blog.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.UserDataActions = UserdataActions.create();
		this.BlogStateStore = BlogStateStore.getInstance();
	},

	__parseSharingInfo: function (sharingInfo) {
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

	savePost: function (record, blog, title, tags, body, sharingInfo) {
		var isEdit = Boolean(record),
			post = isEdit ? record.get('headline') : PersonalBlogEntryPost.create(),
			me = this;

		sharingInfo = this.__parseSharingInfo(sharingInfo);

		//TODO save old values so we can revert them on error?
		//See also beginEdit cancelEdit
		const original = {
			title: post.get('title'),
			body: post.get('body'),
			tags: post.get('tags')
		};

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

		return post.saveData({url: isEdit ? undefined : blog && blog.getLink('add')})
			.then (response => {
				var entry = isEdit ? record : ParseUtils.parseItems(response)[0];

				//the first argument is the record...problem is, it was a post, and the response from the server is
				// a PersonalBlogEntry. All fine, except instead of parsing the response as a new record and passing
				// here, it just updates the existing record with the "updated" fields. ..we normally want this, so this
				// one off re-parse of the responseText is necissary to get at what we want.
				// HOWEVER, if we are editing an existing one... we get back what we send (type wise)
				return entry;
			})
			.then(blogEntry => me.handleShareAndPublishState(blogEntry, sharingInfo))
			.catch(reason => {
				post.set(original);
				this.onSaveFailure(reason);
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
	 * The first two are the easiest. Simply toggling publish.	The last two it gets a little dicey.
	 *
	 * For #3, we can simply add the entities to the sharedWith field.
	 * For #4, we add the entities to the TAGS field.
	 *
	 * For transitioning we simpley toggle the publish-state, AND:
	 * If we are going from #3 to #4 we need to move the entities to the tags
	 * If we are Going from #4 to #3 we need to move the entities to the sharedWith.
	 *
	 * @param {NextThought.model.forums.PersonalBlogEntry} blogEntry the blogEntry to update
	 * @param {Object} sharingInfo who to share with
	 * @return {Promise} Fulfill after updating the sharing and publish states
	 */
	handleShareAndPublishState: function (blogEntry, sharingInfo) {
		if (!blogEntry) {
			return Promise.resolve();
		}

		var isPublic = sharingInfo.isPublic,
			resolveEntities, publish;

		if (isPublic) {
			resolveEntities = UserRepository.getUser(sharingInfo.entities)
				.then(function (users) {
					return users.map(function (u) { return u.get('NTIID'); });
				});
		} else {
			resolveEntities = Promise.resolve(sharingInfo.entities);
		}


		if (blogEntry.isPublished() !== isPublic) {
			publish = new Promise(function (fulfill) {
				//This function (publish) is poorly named. It toggles.
				blogEntry.publish(null, fulfill, this);
			});
		} else {
			publish = Promise.resolve();
		}


		return Promise.all([
			resolveEntities,
			publish
		]).then(function (results) {
			return results[0];
		}).then(function (entities) {
			var name = isPublic ? 'tags' : 'sharedWith',
				object = isPublic ? blogEntry.get('headline') : blogEntry,
				action = isPublic ? Ext.Array.merge : function (a) { return a; };

			object.set(name, action(entities, object.get(name)));

			return new Promise(function (fulfill) {
				object.save({callback: fulfill});
			});
		}).then(function () {
			return blogEntry;
		});

	},

	saveBlogComment: function (record, blogPost, valueObject) {
		var isEdit = Boolean(record && !record.phantom),
			commentPost = record || PersonalBlogComment.create();

		const originalBody = commentPost.get('body');
		commentPost.set('body', valueObject.body);

		return commentPost.saveData({url: isEdit ? undefined : blogPost && blogPost.getLink('add')})
				.then(function (response) {
					var rec = isEdit ? commentPost : ParseUtils.parseItems(response)[0];
					if (!isEdit) {
						blogPost.set('PostCount', blogPost.get('PostCount') + 1);
					}

					return rec;
				})
				.catch(reason => {
					commentPost.set('body', originalBody);
					this.onSaveFailure(reason);
					return Promise.reject(reason);
				});
	},


	onSaveFailure (response) {
		let msg = getString('NextThought.view.profiles.parts.BlogEditor.unknown');

		if (response && response.responseText) {
			const error = Ext.decode(response.responseText, true) || {};
			if (error.code === 'TooLong') {
				msg = getString('NextThought.view.profiles.parts.BlogEditor.longtitle');
			}
			else if (error.code === 'MaxFileSizeUploadLimitError') {
				let maxSize = FilePicker.getHumanReadableFileSize(error.max_bytes),
					currentSize = FilePicker.getHumanReadableFileSize(error.provided_bytes);
				msg = error.message + ' Max File Size: ' + maxSize + '. Your uploaded file size: ' + currentSize;
			}
			else if (error.code === 'MaxAttachmentsExceeded') {
				msg = error.message + ' Max Number of files: ' + error.constraint;
			}
		}

		alert({title: getString('NextThought.view.profiles.parts.BlogEditor.error'), msg: msg, icon: 'warning-red'});
	},


	deleteBlogPost: function (record) {
		var idToDestroy, me = this;

		function maybeDeleteFromStore (id, store) {
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


		return new Promise(function (fulfill, reject) {
			record.destroy({
				success: function () {
					me.UserDataActions.applyToStoresThatWantItem(maybeDeleteFromStore, record);

					//Delete anything left that we know of
					Ext.StoreManager.each(function (s) {
						maybeDeleteFromStore(null, s);
					}, me);

					me.BlogStateStore.onBlogDeleted(record);

					fulfill();
				},
				failure: function () {
					alert('Sorry, could not delete that');
					reject();
				}
			});
		});
	}
});
