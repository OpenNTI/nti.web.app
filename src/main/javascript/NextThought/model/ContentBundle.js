Ext.define('NextThought.model.ContentBundle', {
	alternateClassName: 'NextThought.model.ContentPackageBundle',
	extend: 'NextThought.model.Base',

	isBundle: true,

	fields: [
		{ name: 'ContentPackages', type: 'arrayItem' },
		{ name: 'DCCreator', type: 'auto' },
		{ name: 'DCDescription', type: 'string' },
		{ name: 'DCTitle', type: 'string' },

		{ name: 'Discussions', type: 'singleItem', persist: false },
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
		{ name: 'title', type: 'string' },
		{ name: 'Title', type: 'string', mapping: 'title' },

		{ name: 'icon', type: 'string' }
	],


	statics: {
		fromPackage: function(contentPackage) {
			var id = contentPackage.get('NTIID') + '-auto-bundle';
			return this.create(
					Ext.applyIf({ ContentPackages: [contentPackage], href: '/' }, contentPackage.raw), id);
		}
	},


	constructor: function() {
		this.callParent(arguments);
		wait().then(this.__setImage.bind(this));
	},


	asUIData: function() {
		return {
			id: this.getId(),
			isBundle: true,
			title: this.get('title'),
			label: this.get('author'),
			icon: this.get('icon')
		};
	},


	__setImage: function() {
		var me = this,
			root = this.get('root'),
			img = new Image();

		if (!Ext.isEmpty(me.get('icon'))) {
			return;
		}

		me.set('icon', getURL(root) + '/presentation-assets/webapp/v1/contentpackage-landing-232x170.png');

		img.onerror = function() {
			var e = me.get('ContentPackages')[0];
			me.set('icon', getURL(e.get('icon')));
		};

		img.src = me.get('icon');
	},


	__getLocationInfo: function() {
		var locationInfo = ContentUtils.getLocation(this.get('ContentPackages')[0]);
		//add a reference to myself so the course tiles can get the course instance form the locationInfo for now
		if (locationInfo) {
			locationInfo.bundle = this;
		}

		return locationInfo;
	},


	getFirstPage: function() {
		var e = this.get('ContentPackages')[0];
		return e && e.get('NTIID');
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
