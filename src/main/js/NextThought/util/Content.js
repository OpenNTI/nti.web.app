/*globals ContentProxy:false, AnnotationUtils:false*/
Ext.define('NextThought.util.Content', {
	singleton: true,

	requires: ['NextThought.util.Parsing'],

	CONTENT_VISIBILITY_MAP: {
		'OU': 'OUID'
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
			load = Promise.resolve(x);
		}

		return load;
	},

	
	__getNodes: function(ntiid, bundleOrTocOrNTIID, fn) {
		function iterateToc(toc) {
			if (toc.documentElement.getAttribute('ntiid') === ntiid) {
				return toc.documentElement;
			}

			ntiid = ParseUtils.escapeId(ntiid);

			var selectors = [
					'topic[ntiid="' + ntiid + "']",
					'unit[ntiid="' + ntiid + "']",
					'object[ntiid="' + ntiid + "']"
				], i, namespaced, node;

			for (i = 0; i < selectors.length; i++) {
				node = Ext.DomQuery.select(selectors[i], toc);

				if (node.length > 0) {
					return node[0];
				}
			}

			namespaced = Ext.Array.toArray(toc.getElementsByTagNameNS('http://www.nextthought.com/toc', 'related'));

			for (i = namespaced.length - 1; i >= 0; i--) {
				node = namespaced[i];

				if (node && node.getAttribute('ntiid') === ntiid) {
					return node;
				}
			}
		}

		return this.__resolveTocs(bundleOrTocOrNTIID)
				.then(function(tocs) {
					var nodes = (tocs || []).map(iterateToc);

					return nodes;
				});
	},


	__getNodesLineage: function(ntiid, bundleOrToc, fn) {
		if (!ntiid) {
			return Promise.resolve([]);
		}

		var me = this;
		

		function mapNode(node) {
			var lineage = [],
				value;

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


	getLineage: function(ntiid, bundleOrToc) {
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


	getLineageLabels: function(ntiid, showBundleAsRoot, bundleOrToc) {
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
	}

}, function() {
	window.ContentUtils = this;
});
