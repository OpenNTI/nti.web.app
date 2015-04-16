Ext.define('NextThought.model.ContentPackage', {
	extend: 'NextThought.model.Base',
	requires: ['NextThought.model.converters.DCCreatorToAuthor'],

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

		var me = this,
			index = me.get('index');

		if (me.self.TOC_REQUESTS[index]) {
			me.tocPromise = me.self.TOC_REQUESTS[index];
		} else {
			me.tocPromise = Service.request(getURL(me.get('index')))
								.then(Library.parseXML)
							//BEGIN: ToC Cleanup
								.then(me.__cleanToCNodes.bind(me))
							//END: ToC Cleanup
								.then(function(x) {
									var d = x.documentElement;

									d.setAttribute('base', me.get('root'));
									d.setAttribute('icon', me.get('icon'));
									d.setAttribute('title', me.get('title'));

									return x;
								});

			me.self.TOC_REQUESTS[index] = me.tocPromise;
		}

		me.tocPromise
			.then(function(x) {
				var d = x.documentElement;

				me.set({
					toc: x,
					NTIID: d.getAttribute('ntiid'),
					isCourse: d.getAttribute('isCourse') === 'true'
				});

			});

		wait()
				.then(me.__cacheContentPreferences.bind(me))
				.then(me.__setImage.bind(me));
	},


	getToc: function() {
		return this.tocPromise;
	},


	__cleanToCNodes: function(x) {
		function strip(e) { Ext.fly(e).remove(); }

		function getAllNodesReferencingContentID(ntiid, xml) {
			if (!xml || !ntiid) {
				console.warn('Error: toc/xml or ntiid is empty. Should provide valid toc');
				return [];
			}

			function getNodesForKey(keys) {
				var nodes = [];
				ntiid = ParseUtils.escapeId(ntiid);
				Ext.each(keys, function(k) {
							nodes = Ext.Array.merge(nodes, Ext.DomQuery.select(
											'[' + k + '="' + ntiid + '"]', xml));
						}
				);

				return nodes;
			}

			return getNodesForKey(['ntiid', 'target-ntiid']);
		}

		function permitOrRemove(e) {
			var status = CourseWareUtils.getEnrollmentStatus(ntiid);
			if (!ContentUtils.hasVisibilityForContent(e, status)) {
				getAllNodesReferencingContentID(e.getAttribute('target-ntiid'), x).forEach(strip);
			}
		}

		var ntiid = this.get('NTIID');

		Ext.each(Ext.DomQuery.select('[visibility]:not([visibility=everyone])', x), permitOrRemove);
		return x;
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
