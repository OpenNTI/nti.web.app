const Ext = require('@nti/extjs');
const { Events } = require('@nti/web-session');
const UserdataActions = require('internal/legacy/app/userdata/Actions');
const UserdataStateStore = require('internal/legacy/app/userdata/StateStore');
const FilePicker = require('internal/legacy/common/form/fields/FilePicker');
const Post = require('internal/legacy/model/forums/Post');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);
const { isMe } = require('internal/legacy/util/Globals');

const ForumStore = require('./StateStore');

require('internal/legacy/common/Actions');

module.exports = exports = Ext.define('NextThought.app.forums.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);
		this.UserDataStore = UserdataStateStore.getInstance();

		this.ForumStore = ForumStore.getInstance();
	},

	/*
	 * Save a topic comment
	 *
	 * When the we have a form data, we will save it as such othewise we will do the default save.
	 */
	saveTopicComment: function (topic, comment, values) {
		var isEdit = Boolean(comment) && !comment.phantom,
			postLink = topic.getLink('add');

		comment = comment || Post.create();

		const originalBody = comment.get('body');
		let depth;
		comment.set('body', values.body);

		isEdit = isEdit && !Ext.isEmpty(comment.get('href'));

		if (isEdit) {
			postLink = undefined;
			depth = comment.get('depth');
		}

		return comment
			.saveData({ url: postLink })
			.then(function (response) {
				var rec = isEdit
					? comment
					: lazy.ParseUtils.parseItems(response)[0];

				rec.getInterfaceInstance().then(obj => {
					const eventChoices = obj.isBlogComment
						? {
								updated: Events.BLOG_COMMENT_UPDATED,
								created: Events.BLOG_COMMENT_CREATED,
						  }
						: {
								updated: Events.TOPIC_COMMENT_UPDATED,
								created: Events.TOPIC_COMMENT_CREATED,
						  };

					Events.emit(
						isEdit ? eventChoices.updated : eventChoices.created,
						obj
					);
				});

				//TODO: increment PostCount in topic the same way we increment reply count in notes.
				if (!isEdit) {
					topic.set('PostCount', topic.get('PostCount') + 1);
				} else {
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
					let maxSize = FilePicker.getHumanReadableFileSize(
							err.max_bytes
						),
						currentSize = FilePicker.getHumanReadableFileSize(
							err.provided_bytes
						);
					err.message +=
						' Max File Size: ' +
						maxSize +
						'. Your uploaded file size: ' +
						currentSize;
				}
				if (err.code === 'MaxAttachmentsExceeded') {
					err.message += ' Max Number of files: ' + err.constraint;
				}

				let msg =
					(err && err.message) || 'Failed to save topic comment';
				alert({ title: 'Attention', msg: msg, icon: 'warning-red' });

				return Promise.reject(err);
			});
	},

	saveTopic: function (
		editorCmp,
		record,
		forum,
		title,
		tags,
		body,
		autoPublish
	) {
		var isEdit = Boolean(record),
			post = isEdit ? record.get('headline') : Post.create(),
			me = this;

		//NOTE: Forums entries are PUBLIC only.
		autoPublish = true;

		const original = {
			tags: post.get('tags'),
			title: post.get('title'),
			body: post.get('body'),
		};

		post.set({
			title: title,
			body: body,
			tags: tags || [],
		});

		if (isEdit) {
			record.set({ title: title });
		}

		const url = isEdit ? undefined : forum && forum.getLink('add');

		if (!isEdit && !url) {
			return Promise.reject({
				code: 'MissingLink',
				forum: forum.raw,
				message: 'Forum missing "add" link.',
				responseText: null, // don't blow up a consumer
			});
		}

		return post
			.saveData({ url })
			.catch(resason => {
				post.set(original);
				return Promise.reject(resason);
			})
			.then(resp => {
				try {
					const json = JSON.parse(resp);

					Events.emit(
						isEdit ? Events.TOPIC_UPDATED : Events.TOPIC_CREATED,
						{
							NTIID: record.getId(),
							title: json.title,
							headline: json,
						}
					);
				} catch (e) {
					//swallow
				}

				return resp;
			})
			.then(function (response) {
				var entry = isEdit
					? record
					: lazy.ParseUtils.parseItems(response)[0];

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

				me.applyTopicToStores(entry);

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
		var idToDestroy,
			me = this;
		if (!record.get('href')) {
			record.set(
				'href',
				record.getLink('contents').replace(/\/contents$/, '') ||
					'no-luck'
			);
		}
		idToDestroy = record.get('NTIID');

		function maybeDeleteFromStore(id, store) {
			var r;
			if (store && !store.buffered) {
				r = store.findRecord(
					'NTIID',
					idToDestroy,
					0,
					false,
					true,
					true
				);
				if (!r) {
					console.warn(
						'Could not remove, the store did not have item with id: ' +
							idToDestroy,
						r
					);
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

					Events.emit(Events.TOPIC_DELETED, {
						NTIID: record.getId(),
					});

					me.UserDataStore.applyToStoresThatWantItem(
						maybeDeleteFromStore,
						record
					);

					//Delete anything left that we know of
					Ext.StoreManager.each(function (s) {
						maybeDeleteFromStore(null, s);
					});

					Ext.callback(callback, null, [cmp]);
					fulfill();
				},
				failure(reason) {
					let msg = 'Unable to delete.';

					if (reason && reason.status === 403) {
						msg = 'Forbidden to delete.';
					}

					setTimeout(() => {
						alert({ title: 'Attention', msg, icon: 'warning-red' });
					}, 500);
					reject();
				},
			});
		});
	},

	applyTopicToStores: function (topic) {
		var actions = UserdataActions.create(),
			headline = topic.get('headline'),
			headlineJSON = headline.asJSON(),
			recordForStore;

		actions.applyToStoresThatWantItem(function (id, store) {
			var storeRecord, storeHeadline;

			if (store) {
				storeRecord = store.findRecord(
					'NTIID',
					topic.get('NTIID'),
					0,
					false,
					true,
					true
				);

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
						recordForStore = lazy.ParseUtils.parseItems([
							topic.raw,
						])[0];
					}

					//The store will handle making all the threading/placement, etc
					store.add(recordForStore);
					//once added, null out this pointer so that subsequent loop iterations don't read the same instance to
					//another store. (I don't think our threading algorithm would appreciate that)
					recordForStore = null;
				}
			}
		}, topic);
	},
});
