const Ext = require('@nti/extjs');

const LibraryActions = require('../../../library/Actions');


module.exports = exports = Ext.define('NextThought.app.navigation.path.parts.Content', {
	constructor: function () {
		this.LibraryActions = LibraryActions.create();
	},

	addHandlers: function (handlers) {
		// handlers[NextThought.model.Note.mimeType] = this.getPathToNote.bind(this);
		// handlers[NextThought.model.PageInfo.mimeType] = this.getPathToPageInfo.bind(this);
		return handlers;
	},

	getPathToPageInfo: function (pageInfo, getPathTo) {
		return this.LibraryActions.findBundleByPriority(function (bundle) {
			var contentPackages = bundle.getContentPackages() || [],
				containerId = pageInfo.get('ContentPackageNTIID'),
				priority = 0;

			contentPackages.forEach(function (contentPackage) {
				if (contentPackage.get('NTIID') === containerId) {
					priority = 1;
				}
			});

			return priority;
		}).then(([bundle]) => [bundle, pageInfo]);
	},

	getPathToNote: function (note, getPathTo) {
		return Service.getPathToObject(note.get('NTIID'))
			.then(function (path) {
				return path.concat([note]);
			})
			.catch(function (reason) {
				console.error('Failed to get path to note: ', reason);
				return Promise.reject();
			});
	}
});
