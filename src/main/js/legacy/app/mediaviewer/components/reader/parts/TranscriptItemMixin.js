const Ext = require('extjs');
const UserDataActions = require('legacy/app/userdata/Actions');


/*
 * This appears to be leftover from a refactor. Nothing references this.
 */

module.exports = exports = Ext.define('NextThought.app.mediaviewer.components.reader.parts.TranscriptItemMixin', {
	isPresentationPartReady: false,

	constructor: function () {
		const UserDataStore = UserDataActions.create();

		this.on('added', function () {
			UserDataStore.setupPageStoreDelegates(this);
		}, this);
	},

	getStore: function () {
		return this.userDataStore;
	},

	bindToStore: function (store) {
		this.userDataStore = store;
	},

	notifyReady: function () {
		if (this.isPresentationPartReady) {
			return;
		}
		this.isPresentationPartReady = true;
		this.fireEvent('presentation-part-ready', this);
	},

	registerAnnotations: function () {
		if (this.userDataStore) {
			this.fireEvent('register-records', this.userDataStore, this.userDataStore.getRange(), this);
		}
	}
});
