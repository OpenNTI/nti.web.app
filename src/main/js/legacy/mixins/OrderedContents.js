var Ext = require('extjs');
var Globals = require('../util/Globals');
var ParseUtils = require('../util/Parsing');


module.exports = exports = Ext.define('NextThought.mixins.OrderedContents', {
	hasOrderedContents: true,


	isSameContainer: function(record) {
		var myId = this.getId(),
			theirId = record.getId ? record.getId() : record;

		return myId === theirId;
	},


	onSync: function() {
		this.fillInItems();
	},


	getItems: function() {
		return this.get('Items') || [];
	},


	getItemsCount: function() {
		var items = this.getItems();

		return items.length;
	},


	onceFilledIn: function() {
		var me = this;

		return new Promise(function(fulfill, reject) {
			if (me.isFilledIn) {
				fulfill();
			} else {
				me.afterFilledIn = fulfill;
			}
		});
	},


	fillInItems: function() {
		var me = this,
			items = me.getItems();

		if (items) {
			items.forEach(function(item, index) {
				item.parent = me;
				item.listIndex = index;
				item.previousSibling = items[index - 1];
				item.nextSibling = items[index + 1];

				if (item.hasOrderedContents) {
					item.fillInItems();
				}

				if (!item.parentUpdateListener) {
					item.parentUpdateListener = me.mon(item, {
						destroyable: true,
						'update': me.onItemUpdated.bind(me)
					});
				}
			});
		}

		this.isFilledIn = true;

		if (this.afterFilledIn) {
			this.afterFilledIn();
		}
	},


	getOrderedContentsRoot: function() {
		var parent = this.parent;

		if (parent && parent.getRoot) {
			return parent.getOrderedContentsRoot();
		}

		return this;
	},


	findOrderedContentsItem: function(id) {
		var items = this.getItems(), i,
			item, record;

		if (this.getId && this.getId() === id) { return this; }

		for (i = 0; i < items.length; i++) {
			item = items[i];

			if (item.getId && item.getId() === id) {
				record = item;
			} else if (item && item.findOrderedContentsItem) {
				record = item.findOrderedContentsItem(id);
			}

			if (record) { break; }
		}

		return record;
	},


	onItemUpdated: function() {
		this.fireEvent('updated');
	},


	indexOfId: function(id) {
		var items = this.getItems(),
			i;

		for (i = 0; i < items.length; i++) {
			if (items[i].getId() === id) {
				return i;
			}
		}

		return -1;
	},


	hasContentsLink: function() {
		return !!this.getContentsLink();
	},


	getContentsLink: function() {
		return this.getLink('ordered-contents');
	},


	getInsertLink: function(index) {
		var link = this.getLink('ordered-contents');

		return Globals.trimRoute(link) + '/index/' + index;
	},


	__submitContent: function(content, link) {
		if (!link) {
			return Proimse.reject('No Link');
		}

		return Service.post(link, content)
			.then(function(response) {
				return ParseUtils.parseItems(response)[0];
			});
	},


	/**
	 * Append json content to my ordered contents
	 *
	 * NOTE: since this currently assumes that if the request
	 * is successful, that the record is at the end of the items
	 * we have in memory. So its just appending the response to
	 * the Items field.
	 *
	 * @param  {Object} content the values to append
	 * @return {Promise}
	 */
	appendContent: function(content) {
		var link = this.getContentsLink();

		return this.__submitContent(content, link)
			.then(this.__appendRecord.bind(this));
	},


	insertContent: function(content, index) {
		if (index === undefined) {
			return this.appendContent(content);
		}

		var link = this.getInsertLink(index);

		return this.__submitContent(content, link)
			.then(this.__insertRecord.bind(this, index));
	},


	__submitFormTo: function(form, link) {
		if (!link) {
			return Promise.reject('No Link');
		}

		return form.submitTo(link)
			.then(function(response) {
				return ParseUtils.parseItems(response)[0];
			});
	},


	/**
	 * Append the values form a form component
	 * @param  {NextThought.common.form.Form} form the form component
	 * @return {Promise}
	 */
	appendForm: function(form) {
		var link = this.getContentsLink();

		return this.__submitFormTo(form, link)
			.then(this.__appendRecord.bind(this));
	},


	insertForm: function(form, index) {
		if (index === undefined) {
			return this.appendForm(form);
		}

		var link = this.getInsertLink(index);

		return this.__submitFormTo(form, link)
			.then(this.__insertRecord.bind(this, index));
	},


	__insertRecord: function(index, record) {
		if (index === undefined) {
			return this.__appendRecord;
		}

		var items = this.get('Items');

		if (!items) {
			items = [record];
			this.set('Items', items);
		} else {
			items.splice(index, 0, record);
		}

		this.fillInItems();

		if (this.onItemAdded) {
			this.onItemAdded(record);
		}

		this.fireEvent('update');
		return record;
	},


	__appendRecord: function(record) {
		var items = this.get('Items');

		if (items !== null) {
			items.push(record);
		} else {
			items = [record];
			this.set('Items', items);
		}

		this.fillInItems();

		if (this.onItemAdded) {
			this.onItemAdded(record);
		}

		this.fireEvent('update');
		return record;
	},


	__removeRecord: function(record) {
		var items = this.get('Items'),
			id = record.getId();

		items = items.filter(function(item) {
			return item.getId() !== id;
		});

		this.set('Items', items);
		this.fillInItems();

		if (this.onItemRemoved) {
			this.onItemRemoved();
		}

		this.fireEvent('update');
		this.fireEvent('item-deleted');
	},


	/**
	 * Move a record from a given container to the end of my ordered contents
	 * @param  {Object} record	  record to move
	 * @param  {Object|String} oldParent the current parent
	 * @param  {Object} root	  the root of me and the oldParent
	 * @return {Promise}
	 */
	appendFromContainer: function(record, oldParent, root) {
		var move;

		//If the old parent is this, there's no need to do anything
		if (this === oldParent) {
			move = Promise.resolve(record);
		} else if (!root || !root.isMovingRoot) {
			move = Promise.reject('No moving root provided');
		} else if (!oldParent) {
			move = Promise.reject('No old parent to move from');
		} else {
			move = root.doAppendRecordFrom(record, oldParent, this);
		}

		return move;
	},

	/**
	 * Move a record from a given container to the given index in my ordered contents
	 *
	 * @param  {Object|String} record	 record or ntiid of record
	 * @param  {Number} index	  the position to move it to
	 * @param {Number} oldIndex the old position
	 * @param  {Object|String} oldParent old parent or ntiid
	 * @param  {Object} root	  the root of me and the oldParent
	 * @return {Promise}
	 */
	moveToFromContainer: function(record, index, oldIndex, oldParent, root) {
		if (index === undefined) {
			return this.appendFromContainer(record, oldParent, root);
		}

		var currentIndex = this.indexOfId(record.getId ? record.getId() : record),
			move;

		//If the old parent is me and its in the same index, there's no
		//need to do anything
		if (currentIndex === index && this.isSameContainer(oldParent)) {
			move = Promise.reject('Nothing to do');
		} else if (!root || !root.isMovingRoot) {
			move = Promise.reject('No moving root provided');
		} else if (!oldParent) {
			move = Promise.reject('No old parent to move from');
		} else {
			move = root.doMoveRecordFrom(record, index, oldIndex, this, oldParent);
		}

		return move;
	},


	__doRemove: function(record, index) {
		var link = this.getContentsLink(),
			ntiid = record && record.getId(),
			remove;

		if (!link) {
			remove = Promise.reject('No link');
		} else if (index < 0 || index >= this.getItemsCount()) {
			remove = Promise.reject('Invalid index');
		} else if (!ntiid) {
			remove = Promise.reject('No NTIID');
		} else {
			// ntiid = encodeURIComponent(ntiid);
			link = Globals.trimRoute(link) + '/ntiid/' + ntiid + '?index=' + index;

			remove = Service.requestDelete(link)
				.then(this.__removeRecord.bind(this, record));
		}

		return remove;
	},


	removeRecord: function(record) {
		var items = this.getItems(),
			i;

		for (i = 0; i < items.length; i++) {
			if (items[i].getId() === record.getId()) {
				return this.__doRemove(record, i);
			}
		}

		return Promise.reject('Unable to find record to remove');
	},


	removeAtIndex: function(index) {
		var items = this.getItems(),
			record = items[index];

		return this.__doRemove(record, index);
	}
});
