Ext.define('NextThought.mixins.OrderedContents', {
	hasOrderedContents: true,


	isSameContainer: function(record) {
		var myId = this.getId(),
			theirId = record.getId ? record.getId() : record;

		return myId === theirId;
	},


	getItems: function() {
		return this.get('Items');
	},


	fillInItems: function() {
		var me = this,
			items = me.getItems();

		if (items) {
			items.forEach(function(item, index) {
				item.parent = me;
				item.listIndex = index;

				if (item.hasOrderedContents) {
					item.fillInItems();
				}
			});
		}
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


	hasAppendLink: function() {
		return !!this.getAppendLink();
	},


	getAppendLink: function() {
		return this.getLink('ordered-contents');
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
		var link = this.getAppendLink();

		if (!link) {
			return Promise.reject('No link');
		}

		return Service.post(link, content)
			.then(function(response) {
				return ParseUtils.parseItems(response)[0];
			})
			.then(this.__appendRecord.bind(this));
	},


	/**
	 * Append the values form a form component
	 * @param  {NextThought.common.form.Form} form the form component
	 * @return {Promise}
	 */
	appendForm: function(form) {
		var link = this.getAppendLink();

		if (!link) {
			return Promise.reject('No Link');
		}

		return form.submitTo(link)
			.then(function(response) {
				return ParseUtils.parseItems(response)[0];
			})
			.then(this.__appendRecord.bind(this));
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
		this.fireEvent('update');
	},


	/**
	 * Move a record from a given container to the end of my ordered contents
	 * @param  {Object} record    record to move
	 * @param  {Object|String} oldParent the current parent
	 * @param  {Object} root      the root of me and the oldParent
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
	 * @param  {Object|String} record    record or ntiid of record
	 * @param  {Number} index     the position to move it to
	 * @param  {Object|String} oldParent old parent or ntiid
	 * @param  {Object} root      the root of me and the oldParent
	 * @return {Promise}
	 */
	moveToFromContainer: function(record, index, oldParent, root) {
		var currentIndex = this.indexOfId(record.getId ? record.getId() : record),
			move;

		//If the old parent is me and its in the same index, there's no
		//need to do anything
		if (currentIndex === index && this.isSameContainer(oldParent)) {
			move = Promise.resolve(record);
		} else if (!root || !root.isMovingRoot) {
			move = Promise.reject('No moving root provided');
		} else if (!oldParent) {
			move = Promise.reject('No old parent to move from');
		} else {
			move = root.doMoveRecordFrom(record, index, oldParent, this);
		}

		return move;
	}
});
