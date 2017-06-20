const Ext = require('extjs');

const Globals = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.image.cropping.CroppedImage', {
	constructor: function (config) {
		this.blob = config.blob;
		this.name = config.name;

		this.urlObject = Globals.getURLObject();
	},


	getName: function () {
		return this.name;
	},


	getBlob: function () {
		return this.blob;
	},


	getURL: function () {
		if (!this.url && this.urlObject) {
			this.url = this.urlObject.createObjectURL(this.blob);
		}

		return this.url;
	},


	cleanUp: function () {
		if (this.url && this.urlObject) {
			this.urlObject.revokeObjectURL(this.url);
			delete this.url;
		}

		delete this.blob;
	}
});
