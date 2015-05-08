/*globals ContentProxy:false, AnnotationUtils:false*/
Ext.define('NextThought.util.Content', {
	singleton: true,

	requires: ['NextThought.util.Parsing', 'NextThought.app.library.StateStore'],

	mixins: {
		observable: 'Ext.util.Observable'
	},


	CONTENT_VISIBILITY_MAP: {
		'OU': 'OUID'
	},


	constructor: function() {
		this.callParent(arguments);

		this.LibraryStore = NextThought.app.library.StateStore.getInstance();
		this.clearCache();
	},


	hasVisibilityForContent: function(content, status) {
		var u = $AppConfig.userObject,
			visibilityKey = content.getAttribute('visibility'),
			attr = this.CONTENT_VISIBILITY_MAP[visibilityKey] || visibilityKey;

		// NOTE: Some pieces of content within a course may have limited access (mainly on Copyright issues).
		// i.e only be available for OU students.
		// If the appUser doesn't have the visibility key or whatever it maps to,
		// then we conclude that they shouldn't have access to that content.
		// Right now, there is no great way to determine what that visibility key is or maps to.

		// For the short-term, since the request is for OU students and all 4-4 users(OU)
		// have a 'OUID' on the user record, we will check for its existence.
		// TODO: we need to define what this 'visibility' means for an AppUser in general (rather than just OU) or
		// have a convention on how have we resolve it.
		return !attr || u.hasVisibilityField(attr) || attr === status || (/everyone/i).test(attr);
	},


	getNTIIDFromThing: function(thing) {
		var ntiid;
		
		if (thing && thing.getAttribute) {
			ntiid = thing.getAttribute('ntiid');
		} else if (thing && thing.isModel) {
			ntiid = thing.get('ContainerId') || thing.get('containerId') || thing.get('NTIID') || thing.getId();
		}

		return ntiid || thing;
	},


	__resolveTocs: function(bundleOrTocOrNTIID) {
		var x = bundleOrTocOrNTIID,
			load;

		//TODO: figure out what to do when given a string
		if (typeof x === 'string') {
			console.error('Need to fill this path out');
			load = Promise.reject();
		} else if (x.getTocs) {
			load = x.getTocs();
		} else  {
			load = Promise.resolve([x]);
		}

		return load;
	},

	/**
	 * Resolve the node for a ntiid with in a bundle or toc
	 *
	 * Returns an array of nodes for each toc in the bundle
	 *
	 * @param  {String} ntiid              ntiid to resolve
	 * @param  {Bundle|XML} bundleOrTocOrNTIID the bundle to get the tocs from or the toc itself
	 * @return {Promise}                    fulfills with the nodes
	 */
	__getNodes: function(ntiid, bundleOrTocOrNTIID) {
		function iterateToc(toc) {
			if (toc.documentElement.getAttribute('ntiid') === ntiid) {
				return toc.documentElement;
			}

			var escaped = ParseUtils.escapeId(ntiid),
				selectors = [
					'topic[ntiid="' + escaped + "']",
					'unit[ntiid="' + escaped + "']",
					'object[ntiid="' + escaped + "']"
				], i, namespaced, node;

			for (i = 0; i < selectors.length; i++) {
				node = Ext.DomQuery.select(selectors[i], toc);

				if (node.length > 0) {
					return {
						toc: toc,
						location: node[0],
						NTIID: ntiid,
						ContentNTIID: node[0].ownerDocument.documentElement.getAttribute('ntiid')
					};
				}
			}

			namespaced = Ext.Array.toArray(toc.getElementsByTagNameNS('http://www.nextthought.com/toc', 'related'));

			for (i = namespaced.length - 1; i >= 0; i--) {
				node = namespaced[i];

				if (node && node.getAttribute('ntiid') === escaped) {
					return {
						toc: toc,
						location: node,
						NTIID: ntiid,
						ContentNTIID: node.ownerDocument.documentElement.getAttribute('ntiid')
					};
				}
			}
		}

		var result;

		result = this.findCache[ntiid];

		if (!result) {
			result = this.__resolveTocs(bundleOrTocOrNTIID)
				.then(function(tocs) {
					var nodes = (tocs || []).map(iterateToc);

					//filter out falsy values
					nodes = nodes.filter(function(node) {
						return !!node
					});

					return nodes;
				});

			this.findCache[ntiid] === result;
		}

		return result; 
	},


	__getNodesLineage: function(ntiid, bundleOrToc, fn) {
		if (!ntiid) {
			return Promise.resolve([]);
		}

		var me = this;
		

		function mapNode(node) {
			var lineage = [],
				value;

			node = node.location;

			while (node) {
				value = fn.call(null, node);

				if (value) {
					lineage.push(value);
				} else if (value === false) {
					break;
				}

				node = node.parentNode;
			}

			return lineage
		}

		return this.__getNodes(ntiid, bundleOrToc)
				.then(function(nodes) {
					return (nodes || []).map(mapNode);
				});
	},

	/**
	 * Return the an array of arrays of ids of the paths from the ntiid to the root
	 * for all the tocs in the bundle
	 *
	 * @param  {String} ntiid       ntiid to start at
	 * @param  {Bundle|XML} bundleOrToc context to look under
	 * @return {Promise}             fulfills with the paths for all the tocs that have one
	 */
	getLineage: function(ntiid, bundleOrToc) {
		ntiid = this.getNTIIDFromThing(ntiid);

		return this.__getNodesLineage(ntiid, bundleOrToc, function(node) {
			var id = node.getAttribute ? node.getAttribute('ntiid') : null;

			if (id) {
				return id;
			} else if (node.nodeType !== Node.DOCUMENT_NODE) {
				console.error(node, 'no id');
				return false;
			}
		});
	},

	/**
	 * Return the an array of arrays of labels of the paths from the ntiid to the root
	 * for all the tocs in the bundle
	 *
	 * @param  {String} ntiid       ntiid to start at
	 * @param  {Bundle|XML} bundleOrToc context to look under
	 * @return {Promise}             fulfills with the paths for all the tocs that have one
	 */
	getLineageLabels: function(ntiid, showBundleAsRoot, bundleOrToc) {
		ntiid = this.getNTIIDFromThing(ntiid);

		return this.__getNodesLineage(ntiid, bundleOrToc, function(node) {
			var label = node.getAttribute ? node.getAttribute('label') : null;

			if (label) {
				return label;
			} else if (node.nodeType !== Node.DOCUMENT_NODE) {
				console.error('Missing Label: ', node);
				return 'Missing Label';
			}
		}).then(function(labels) {
			if (showBundleAsRoot) {
				//TODO: figure this out
			}

			return labels
		});
	},


	listenToLibrary: function() {
		if (this.libraryMon) {
			return;
		}

		this.libraryMon = this.mon(this.LibraryStore, {
			destroyable: true,
			loaded: this.clearCache.bind(this)
		});
	},


	clearCache: function() {
		this.cache = {};
		this.findCache = {};
	},

	/**
	 * Get the location info for a ntiid within the context of the bundle or toc
	 *
	 * @param  {String} ntiid       ntiid to look for
	 * @param  {Bundle|Toc} bundleOrToc context to look in
	 * @return {Promise}             fulfills with location info
	 */
	getLocation: function(ntiid, bundleOrToc) {
		ntiid = this.getNTIIDFromThing(ntiid);

		var me = this, result;

		function getAttribute(elements, attr) {
			var i, value;

			for (i = 0; i < elements.length; i++) {
				value = elements[i];

				try {
					value = value ? value.getAttribute(attr) : null;

					if (value) {
						return value;
					}
				} catch (e) {
					console.warn('element did not have getAttribute');
				}
			}

			return null;
		}

		function mapNode(node) {
			var doc = node.toc.documentElement,
				loc = node.location;

			return Ext.apply({
				NTIID: ntiid,
				icon: getAttribute([loc, doc], 'icon'),
				isCourse: (getAttribute([loc, doc], 'isCourse') || '').toLowerCase() === 'true',
				root: getAttribute([loc, doc], 'base'),
				title: getAttribute([loc, doc], 'title'),
				label: getAttribute([loc, doc], 'label'),
				thumbnail: getAttribute([loc, doc], 'thumbnail'),
				getIcon: function(fromBook) {
					var iconPath = fromBook ? this.title.get('icon') : this.icon;

					if (iconPath.substr(0, this.root.length) !== root) {
						iconPath = this.root + this.icon;
					}

					return iconPath;
				},
				getPathLabel: function() {
					return me.getLineageLabels(this.NTIID, bundleOrToc)
							.then(function(lineages) {
								var lineage = lineages[0],
									sep = lineage.length <= 2 ? ' / ' : ' /.../ ',
									base = linage.last() || '',
									leaf = lineage.first();

								return lineage.length <= 1 ? base : base + sep + leaf;
							});
				}
			}, node);
		}

		me.listenToLibrary();

		result = me.cache[ntiid];

		if (!result) {
			result = this.__getNodes(ntiid, bundleOrToc)
						.then(function(nodes) {
							return (nodes || []).map(mapNode);
						});

			me.cache[ntiid] = result;
		}

		return result;
	}

}, function() {
	window.ContentUtils = this;
});
