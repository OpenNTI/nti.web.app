Ext.define('NextThought.model.ContentPackage', {
	extend: 'NextThought.model.Base',
	requires: ['NextThought.model.converters.DCCreatorToAuthor'],

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
		this.tocPromise = Service.request(this.get('index'))
				.then(ContentUtils.parseXML)
			//BEGIN: ToC Cleanup
			//TODO: move toc code here.
			//END: ToC Cleanup
				.then(function(x) { this.set('toc', x); return x; }.bind(this));

		wait().then(this.__setImage.bind(this));
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


	/** @deprecated Use {@link NextThought.model.courseware.CourseInstance#getScope()} instead */
	getScope: function(scope) {
		var toc = this.get('toc'),
			entities = (toc && toc.querySelectorAll('scope[type="' + scope + '"] entry')) || [],
			values = [];

		if (!toc) {
			Ext.Error.raise('No Scope yet.');
		}

		//entities is a node list so it doesn't have a forEach
		Ext.each(entities, function(entity) {
			values.push(entity.textContent.trim());
		});

		return values;
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


	__setImage: function() {
		var me = this;
		me.getImgAsset('landing').then(function(url) { me.set('icon', url); });
		me.getImgAsset('thunb').then(function(url) { me.set('thumb', url); });
	}

});
