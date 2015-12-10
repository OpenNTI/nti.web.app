Ext.define('NextThought.mixins.OrderedContents', {
	hasOrderedContents: true,


	hasAppendLink: function() {
		return !!this.getAppendLink();
	},


	getAppendLink: function() {
		return this.getLink('ordered-contents');
	},


	appendContent: function(content) {
		var link = this.getAppendLink();

		if (!link) {
			return Promise.reject('No link');
		}

		return Service.post(link, content)
			.then(function(response) {
				return ParseUtils.parseItems(response)[0];
			})
			.then(this.appendRecord.bind(this));
	},


	appendForm: function(form) {
		var link = this.getAppendLink();

		if (!link) {
			return Promise.reject('No Link');
		}

		return form.submitTo(link)
			.then(function(response) {
				return ParseUtils.parseItems(response)[0];
			})
			.then(this.appendRecord.bind(this));
	},


	appendRecord: function(record, index) {
		var items = this.get('Items');

		items.push(record);

		return record;
	},


	removeRecord: function(record) {
		var items = this.get('Items'),
			id = record.getId();

		items = items.filter(function(item) {
			return item.getId() !== id;
		});

		this.set('Items', items);
		this.fireEvent('update');
	},


	appendFromContainer: function(record, oldParent, root) {
		var move;

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
