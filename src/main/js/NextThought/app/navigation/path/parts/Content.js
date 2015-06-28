Ext.define('NextThought.app.navigation.path.parts.Content', {
	requires: [
		'NextThought.app.library.Actions',
		'NextThought.app.content.Actions'
	],

	constructor: function() {
		this.LibraryActions = NextThought.app.library.Actions.create();
		this.ContentActions = NextThought.app.content.Actions.create();
	},


	addHandlers: function(handlers) {
		handlers[NextThought.model.Note.mimeType] = this.getPathToNote.bind(this);
		handlers[NextThought.model.PageInfo.mimeType] = this.getPathToPageInfo.bind(this);
		return handlers;
	},


	getPathToPageInfo: function(pageInfo, getPathTo) {
		var contentActions = this.ContentActions;

		return this.LibraryActions.findBundleByPriority(function(bundle) {
			var contentPackages = bundle.getContentPackages() || [],
				containerId = pageInfo.get('ContentPackageNTIID'),
				priority = 0;

			contentPackages.forEach(function(contentPackage) {
				if (contentPackage.get('NTIID') === containerId) {
					priority = 1;
				}
			});

			return priority;
		}).then(function(bundles) {
			bundle = bundles[0];

			return [bundle, pageInfo];
		});
	},


	getPathToNote: function(note, getPathTo) {
		//TODO: use the servers getPath view
		return Service.getObject(note.get('ContainerId'))
			.then(function(page) {
				return getPathTo(page);
			})
			.then(function(path) {
				path.push(note);
				return path;
			})
			.fail(function(reason) {
				console.error('Failed to get path to note: ', reason);
				return Promise.reject();
			});
	}
});
