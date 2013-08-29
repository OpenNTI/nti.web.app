Ext.define('NextThought.view.slidedeck.TranscriptItem', {

	isPresentationPartReady: false,

	constructor: function () {
		this.fireEvent('uses-page-stores', this);
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