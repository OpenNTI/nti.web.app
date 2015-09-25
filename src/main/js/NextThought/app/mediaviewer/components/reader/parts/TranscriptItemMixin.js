export default Ext.define('NextThought.app.mediaviewer.components.reader.parts.TranscriptItemMixin', {
	requires: ['NextThought.app.userdata.Actions'],

	isPresentationPartReady: false,

	constructor: function() {
		var UserDataStore = NextThought.app.userdata.Actions.create();

		this.on('added', function() {
			UserDataStore.setupPageStoreDelegates(this);
		}, this);
	},

	getStore: function() {
		return this.userDataStore;
	},

	bindToStore: function(store) {
		this.userDataStore = store;
	},

	notifyReady: function() {
		if (this.isPresentationPartReady) {
			return;
		}
		this.isPresentationPartReady = true;
		this.fireEvent('presentation-part-ready', this);
	},


	registerAnnotations: function() {
		if (this.userDataStore) {
			this.fireEvent('register-records', this.userDataStore, this.userDataStore.getRange(), this);
		}
	}

});
