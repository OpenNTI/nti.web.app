export default Ext.define('NextThought.model.ContentPackage', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.DCCreatorToAuthor'
	],

	statics: {
		TOC_REQUESTS: {}
	},

	mixins: {
		'PresentationResources': 'NextThought.mixins.PresentationResources'
	},

	idProperty: 'index',
	fields: [
		{ name: 'Archive Last Modified', type: 'date', dateFormat: 'timestamp' },
		{ name: 'archive', type: 'string' },
		{ name: 'index', type: 'string' },
		{ name: 'index_jsonp', type: 'string' },
		{ name: 'installable', type: 'bool' },
		{ name: 'root', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'author', type: 'DCCreatorToAuthor', mapping: 'DCCreator', defaultValue: ['Author Name Here']},
		{ name: 'version', type: 'string'},
		{ name: 'PlatformPresentationResources', type: 'auto'},
		{ name: 'PresentationProperties', type: 'auto'},
		{ name: 'path', type: 'string', defaultValue: ''},
		{ name: 'sample', type: 'bool', defaultValue: false, persist: false},
			//for filtering
		{ name: 'isCourse', type: 'bool', defaultValue: false, persist: false},

		{ name: 'toc', type: 'auto', persist: false},
		{ name: 'icon', type: 'string' },
		{ name: 'thumb', type: 'string' }
	],


	constructor: function() {
		this.callParent(arguments);

		wait()
			//pre resolve which image assets to use
			.then(this.__setImage.bind(this));

		this.LibraryActions = NextThought.app.library.Actions.create();
	},


	getTitle: function() {
		return this.get('title');
	},

	getIcon: function() {
		return this.get('icon');
	},


	getToc: function(status) {
		var me = this,
			library = me.LibraryActions;
			index = me.get('index');

		if (me.self.TOC_REQUESTS[index + '-' + status]) {
			me.tocPromise = me.self.TOC_REQUESTS[index + '-' + status];
		} else {
			me.tocPromise = Service.request(getURL(index))
					//parse the response into a xml
					.then(library.parseXML.bind(library))
					//set my root, icon, and title on the doc
					.then(function(xml) {
						var doc = xml.documentElement;

						doc.setAttribute('base', me.get('root'));
						doc.setAttribute('icon', me.get('icon'));
						doc.setAttribute('title', me.get('title'));

						return xml;
					});

			me.self.TOC_REQUESTS[index + '-' + status] = me.tocPromise;
		}

		me.tocPromise
			.then(function(xml) {
				var doc = xml.documentElement;

				//make sure I am synced with the toc
				me.set({
					toc: xml,
					NTIID: doc.getAttribute('ntiid'),
					isCourse: doc.getAttribute('isCourse') === 'true'
				});
			});


		return me.tocPromise;
	},



	asUIData: function() {
		return {
			id: this.getId(),
			isCourse: this.get('isCourse'),
			title: this.get('title'),
			label: this.get('author'),
			icon: this.get('icon'),
			thumb: this.get('thumb')
		};
	},


	fireNavigationEvent: function(eventSource) {
		var id = this.get('NTIID');
		return new Promise(function(fulfill, reject) {
			var txn = history.beginTransaction('book-navigation-transaction-' + guidGenerator());
			eventSource.fireEvent('set-last-location-or-root', id, function(ntiid, reader, error) {
				if (error) {
					txn.abort();
					reject(error);
				}
				else {

					fulfill();
					txn.commit();
				}
			});
		});
	},


	getDefaultAssetRoot: function() {
		var root = this.get('root');

		if (!root) {
			console.error('No root for content package: ', this);
			return '';
		}

		return getURL(root).concatPath('/presentation-assets/webapp/v1/');
	},



	__cacheContentPreferences: function() {
		var c = console;
		Service.getPageInfo(this.get('NTIID'))
				.then(undefined, c.error.bind(c));
	},


	__setImage: function() {
		var me = this;
		me.getImgAsset('landing').then(function(url) { me.set('icon', url); });
		me.getImgAsset('thumb').then(function(url) { me.set('thumb', url); });
	},


	represents: function(catalogEntry) {return false;}
});
