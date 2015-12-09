Ext.define('NextThought.mixins.OrderedContents', {

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


	appendRecord: function(record) {
		var items = this.get('Items');

		items.push(record);

		return record;
	}
});
