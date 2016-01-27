Ext.define('NextThought.app.image.cropping.CroppedImage', {
	constructor: function(config) {
		this.blob = config.blob;

		this.urlObject = Globals.getURLObject();
	},


	getBlob: function() {
		return this.blob;
	},


	getURL: function() {
		if (!this.url && this.urlObject) {
			this.url = this.urlObject.createObjectURL(this.blob);
		}

		return this.url;
	},


	cleanUp: function() {
		if (this.url && this.urlObject) {
			this.urlObject.revokeObjectURL(this.url);
			delete this.url;
		}

		delete this.blob;
	}
});
