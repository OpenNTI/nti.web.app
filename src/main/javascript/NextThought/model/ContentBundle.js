Ext.define('NextThought.model.ContentBundle', {
	alternateClassName: 'NextThought.model.ContentPackageBundle',
	extend: 'NextThought.model.Base',

	isBundle: true,

	fields: [
		{ name: 'ContentPackages', type: 'arrayItem' },
		{ name: 'DCCreator', type: 'auto' },
		{ name: 'DCDescription', type: 'string' },
		{ name: 'DCTitle', type: 'string' },

		{ name: 'author', type: 'DCCreatorToAuthor', mapping: 'DCCreator'},

		{ name: 'PlatformPresentationResources', type: 'auto' },
		{ name: 'contributors', type: 'auto' },
		{ name: 'created', type: 'ISODate' },
		{ name: 'creators', type: 'auto' },
		{ name: 'description', type: 'string' },
		{ name: 'modified', type: 'ISODate' },
		{ name: 'ntiid', type: 'string' },
		{ name: 'publisher', type: 'string' },
		{ name: 'root', type: 'string' },
		{ name: 'subjects', type: 'auto' },
		{ name: 'title', type: 'string' }
	],


	statics: {
		fromPackage: function(contentPackage) {
			var id = contentPackage.get('NTIID') + '-auto-bundle';
			return this.create(
					Ext.applyIf({ ContentPackages: [contentPackage], href: '/' }, contentPackage.raw), id);
		}
	},


	asUIData: function() {
		return {
			id: this.getId(),
			isBundle: true,
			title: this.get('title'),
			label: this.get('author'),
			icon: getURL(this.get('root')) + '/presentation-assets/webapp/v1/contentpackage-landing-232x170.png'
		};
	},


	__getLocationInfo: function() {
		var locationInfo = ContentUtils.getLocation(this.get('ContentPackages')[0]);
		//add a reference to myself so the course tiles can get the course instance form the locationInfo for now
		if (locationInfo) {
			locationInfo.bundle = this;
		}

		return locationInfo;
	},


	fireNavigationEvent: function(eventSource) {
		var me = this;
		return new Promise(function(fulfill) {
			eventSource.fireEvent('bundle-selected', me, function() {
				fulfill();
			});
		});
	}
});
