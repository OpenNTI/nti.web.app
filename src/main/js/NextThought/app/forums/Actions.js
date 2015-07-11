Ext.define('NextThought.app.forums.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.userdata.Actions',
		'NextThought.app.userdata.StateStore'
	],

	constructor: function() {
		this.callParent(arguments);
		this.UserDataStore = NextThought.app.userdata.StateStore.getInstance();
	},

	saveTopicComment: function(topic, comment, values) {
		var isEdit = Boolean(comment) && !comment.phantom,
			postLink = topic.getLink('add');

		comment = comment || NextThought.model.forums.Post.create();

		comment.set({body: values.body});

		isEdit = isEdit && !Ext.isEmpty(comment.get('href'));

		if (isEdit) {
			postLink = undefined;
		}

		return new Promise(function(fulfill, reject) {
			comment.save({
				url: postLink,
				success: function(_, operation) {
					var rec = isEdit ? comment : ParseUtils.parseItems(operation.response.responseText)[0];

					//TODO: increment PostCount in topic the same way we increment reply count in notes.
					if (!isEdit) {
						topic.set('PostCount', topic.get('PostCount') + 1);
					}

					fulfill(rec);
				},
				failure: function() {
					console.error('Failed to save topic comment:', arguments);
					reject();
				}
			});
		});
	},


	saveTopic: function(editorCmp, record, forum, title, tags, body, autoPublish) {
		var isEdit = Boolean(record),
			post = isEdit ? record.get('headline') : NextThought.model.forums.Post.create(),
			me = this;

		//NOTE: Forums entries are PUBLIC only.
		autoPublish = true;

		post.set({
			'title': title,
			'body': body,
			'tags': tags || []
		});

		if (isEdit) {
			record.set({'title': title});
		}

		return new Promise(function(fulfill, reject) {
			post.getProxy().on('exception', reject, null, {single: true});
			post.save({
				url: isEdit ? undefined : forum && forum.getLink('add'),//only use post record if its a new post
				scope: this,
				success: function(post, operation) {
					var entry = isEdit ? record : ParseUtils.parseItems(operation.response.responseText)[0];

					if (autoPublish !== undefined) {
						if (autoPublish !== entry.isPublished()) {
							entry.publish(editorCmp, fulfill, this);
							return;
						}
					}

					//we have nested objects here. The entry contains a headline whose body, title, and tags
					//have been updates. Our magic multi object setter won't find the nested object in the store
					//so we set it back on the original record to trigger other instance of the entry to be updated.
					//Not doing this reflects itself by the body of the topic not updating in the activity view
					if (isEdit && record) {
						record.afterEdit('headline');
					}

					fulfill(entry);
				},
				failure: reject
			});
		}).then(function(entry) {
			var record;

			//This is how the views are reading the display name... pre-set the Creator as your userObject.
			if (isMe(entry.get('Creator'))) {
				entry.set('Creator', $AppConfig.userObject);
			}

			me.applyTopicToStores(entry);

			return entry;
		});
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

		return new Promise(function(fulfill, reject) {
			record.destroy({
				success: function() {
					me.UserDataStore.applyToStoresThatWantItem(maybeDeleteFromStore, record);

					//Delete anything left that we know of
					Ext.StoreManager.each(function(s) {
						maybeDeleteFromStore(null, s);
					});

					Ext.callback(callback, null, [cmp]);
					fulfill();
				},
				failure: function() {
					alert('Sorry, could not delete that');
					reject();
				}
			});
		});
	},

	applyTopicToStores: function(topic) {
		var actions = NextThought.app.userdata.Actions.create(),
			headline = topic.get('headline'),
			headlineJSON = headline.asJSON(),
			recordForStore;

		actions.applyToStoresThatWantItem(function(id, store) {
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
