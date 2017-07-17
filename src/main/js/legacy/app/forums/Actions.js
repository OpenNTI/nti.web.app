const Ext = require('extjs');
const ParseUtils = require('../../util/Parsing');
const {isMe} = require('legacy/util/Globals');
const ForumStore = require('./StateStore');
require('../../common/Actions');
require('../userdata/Actions');
require('../userdata/StateStore');
require('legacy/common/form/fields/FilePicker');


module.exports = exports = Ext.define('NextThought.app.forums.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);
		this.UserDataStore = NextThought.app.userdata.StateStore.getInstance();

		this.ForumStore = ForumStore.getInstance();
	},


	/**
	 * Save a topic comment
	 *
	 * When the we have a form data, we will save it as such othewise we will do the default save.
	 */
	saveTopicComment: function (topic, comment, values) {
		var isEdit = Boolean(comment) && !comment.phantom,
			postLink = topic.getLink('add');

		comment = comment || NextThought.model.forums.Post.create();

		const originalBody = comment.get('body');
		let depth;
		comment.set('body', values.body);

		isEdit = isEdit && !Ext.isEmpty(comment.get('href'));

		if (isEdit) {
			postLink = undefined;
			depth = comment.get('depth');
		}

		return comment.saveData({url: postLink})
			.then(function (response) {
				var rec = isEdit ? comment : ParseUtils.parseItems(response)[0];

				//TODO: increment PostCount in topic the same way we increment reply count in notes.
				if (!isEdit) {
					topic.set('PostCount', topic.get('PostCount') + 1);
				}
				else {
					// Note: reset the depth, since editing shouldn't affect it
					// and it's non-persistent field.
					rec.set('depth', depth);
				}

				return rec;
			})
			.catch(function (err) {
				comment.set('body', originalBody);

				console.error('Failed to save topic comment:', arguments);
				if (err && err.responseText) {
					try {
						err = JSON.parse(err.responseText);
					} catch (e) {
						console.error(e);
					}
				}

				if (err.code === 'MaxFileSizeUploadLimitError') {
					let maxSize = NextThought.common.form.fields.FilePicker.getHumanReadableFileSize(err.max_bytes),
						currentSize = NextThought.common.form.fields.FilePicker.getHumanReadableFileSize(err.provided_bytes);
					err.message += ' Max File Size: ' + maxSize + '. Your uploaded file size: ' + currentSize;
				}
				if (err.code === 'MaxAttachmentsExceeded') {
					err.message += ' Max Number of files: ' + err.constraint;
				}

				let msg = err && err.message || 'Failed to save topic comment';
				alert({title: 'Attention', msg: msg, icon: 'warning-red'});

				return Promise.reject(err);
			});
	},


	saveTopic: function (editorCmp, record, forum, title, tags, body, autoPublish) {
		var isEdit = Boolean(record),
			post = isEdit ? record.get('headline') : NextThought.model.forums.Post.create(),
			me = this;

		//NOTE: Forums entries are PUBLIC only.
		autoPublish = true;

		const original = {
			tags: post.get('tags'),
			title: post.get('title'),
			body: post.get('body')
		};

		post.set({
			'title': title,
			'body': body,
			'tags': tags || []
		});

		if (isEdit) {
			record.set({'title': title});
		}

		return post.saveData({url: isEdit ? undefined : forum && forum.getLink('add')})
			.catch(resason => {
				post.set(original);
				return Promise.reject(resason);
			})
			.then (function (response) {
				var entry = isEdit ? record : ParseUtils.parseItems(response)[0];

				if (autoPublish !== undefined) {
					if (autoPublish !== entry.isPublished()) {
						return new Promise(function (fulfill, reject) {
							entry.publish(editorCmp, fulfill, me);
						});
					}
				}

				//we have nested objects here. The entry contains a headline whose body, title, and tags
				//have been updates. Our magic multi object setter won't find the nested object in the store
				//so we set it back on the original record to trigger other instance of the entry to be updated.
				//Not doing this reflects itself by the body of the topic not updating in the activity view
				if (isEdit && record) {
					record.afterEdit('headline');
				}

				return entry;
			})
			.then(function (entry) {
				//This is how the views are reading the display name... pre-set the Creator as your userObject.
				if (isMe(entry.get('Creator'))) {
					entry.set('Creator', $AppConfig.userObject);
				}

				me.applyTopicToStores(entry);
				return entry;
			});
	},


	deleteObject: function (record, cmp, callback) {
		var idToDestroy, me = this;
		if (!record.get('href')) {
			record.set('href', record.getLink('contents').replace(/\/contents$/, '') || 'no-luck');
		}
		idToDestroy = record.get('NTIID');

		function maybeDeleteFromStore (id, store) {
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

		return new Promise(function (fulfill, reject) {
			record.destroy({
				success: function () {
					me.ForumStore.onTopicDeleted(record);

					me.UserDataStore.applyToStoresThatWantItem(maybeDeleteFromStore, record);

					//Delete anything left that we know of
					Ext.StoreManager.each(function (s) {
						maybeDeleteFromStore(null, s);
					});

					Ext.callback(callback, null, [cmp]);
					fulfill();
				},
				failure: function () {
					alert('Sorry, could not delete that');
					reject();
				}
			});
		});
	},

	applyTopicToStores: function (topic) {
		var actions = NextThought.app.userdata.Actions.create(),
			headline = topic.get('headline'),
			headlineJSON = headline.asJSON(),
			recordForStore;

		actions.applyToStoresThatWantItem(function (id, store) {
			var storeRecord,
				storeHeadline;

			if (store) {
				storeRecord = store.findRecord('NTIID', topic.get('NTIID'), 0, false, true, true);

				//if there is already a record in the store just update its values
				if (storeRecord) {
					storeRecord.set(topic.asJSON());
					storeHeadline = storeRecord.get('headline');

					if (storeHeadline && headlineJSON) {
						storeHeadline.set(headlineJSON);
					}

				} else {
					if (!recordForStore) {
						//Each store gets its own copy of the record. A null value indicates we already added one to a
						//store, so we need a new instance. Read it out of the original raw value.
						recordForStore = ParseUtils.parseItems([topic.raw])[0];
					}

					//The store will handle making all the threading/placement, etc
					store.add(recordForStore);
					//once added, null out this pointer so that subsequent loop iterations don't read the same instance to
					//another store. (I don't think our threading algorithm would appreciate that)
					recordForStore = null;
				}
			}
		}, topic);
	}
});
