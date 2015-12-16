Ext.define('NextThought.mixins.OrderedContents', {
	hasOrderedContents: true,


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
		this.fireEvent('update');
	},


	/**
	 * Move a record from a given container to the end of my ordered contents
	 * @param  {Object} record    record to move
	 * @param  {Object} oldParent the current parent
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
		} else {
			move = root.doMoveRecordFrom(record, oldParent, this);
		}

		return move;
	}
});
