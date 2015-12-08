Ext.define('NextThought.mixins.OrderedContents', {

	getAppendLink: function() {
		return this.getLink('ordered-contents');
	},

	appendContent: function(content) {
		var link = this.getAppendLink();

		if (!this.link) {
			return Promise.reject('No link');
		}

		return Service.post(link, content);
	}
});
