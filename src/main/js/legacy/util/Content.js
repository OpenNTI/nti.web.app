const Ext = require('extjs');

const LibraryStateStore = require('legacy/app/library/StateStore');
const lazy = require('legacy/util/lazy-require')
	.get('AnnotationUtils', () => require('legacy/util/Annotations'));

require('legacy/overrides/builtins/RegExp');

const Globals = require('./Globals');
const ParseUtils = require('./Parsing');

const {getURL} = Globals;



module.exports = exports = Ext.define('NextThought.util.Content', {

	mixins: {
		observable: 'Ext.util.Observable'
	},

	CONTENT_VISIBILITY_MAP: {
		'OU': 'OUID'
	},

	IGNORE_ROOTING: new RegExp(RegExp.escape('tag:nextthought.com,2011-10:Alibra-'), 'i'),

	constructor: function () {
		this.callParent(arguments);

		this.LibraryStore = LibraryStateStore.getInstance();
		this.clearCache();
	},

	hasVisibilityForContent: function (content, status) {
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

	getNTIIDFromThing: function (thing) {
		var ntiid;

		if (thing && thing.getAttribute) {
			ntiid = thing.getAttribute('ntiid');
		} else if (thing && thing.isModel) {
			ntiid = thing.get('ContainerId') || thing.get('containerId') || thing.get('NTIID') || thing.getId();
		}

		return ntiid || thing;
	},


	__getContentPackages (x) {
		return x.getContentPackages ? x.getContentPackages() : [];
	},


	__resolveTocs: function (bundleOrTocOrNTIID) {
		var x = bundleOrTocOrNTIID,
			load;

		//TODO: figure out what to do when given a string
		if (typeof x === 'string') {
			console.error('Need to fill this path out');
			load = Promise.reject();
		} else if (x && x.getTocs) {
			load = x.getTocs();
		} else {
			load = Promise.resolve([x]);
		}

		return load;
	},


	__resolveTocFor: function (bundle, ID) {
		let load;

		if (bundle && bundle.getTocFor) {
			load = bundle.getTocFor(ID);
		} else {
			load = Promise.reject('Invalid bundle');
		}

		return load;
	},

	__findNode: function (ntiid, toc) {
		function getNode (node) {
			return {
				toc: toc,
				location: node,
				NTIID: ntiid,
				ContentNTIID: node.ownerDocument.documentElement.getAttribute('ntiid')
			};
		}

		if (toc.documentElement.getAttribute('ntiid') === ntiid) {
			return getNode(toc.documentElement);
		}

		var escaped = ParseUtils.escapeId(ntiid),
			selectors = [
				'related[ntiid="' + escaped + '"]',
				'object[ntiid="' + escaped + '"]',
				'unit[ntiid="' + escaped + '"]',
				'topic[ntiid="' + escaped + '"]'
			], i, node;

		for (i = 0; i < selectors.length; i++) {
			node = toc.querySelector(selectors[i]);

			if (node) {
				return getNode(node);
			}
		}
	},

	/** @private */
	externalUriRegex: /^((\/\/)|([a-z][a-z0-9\+\-\.]*):)/i,


	/**
	 * Detect whether or not a uri is pointing out of the site
	 * @param  {String}	 r uri to check
	 * @return {Boolean}   true if its outside of the side
	 */
	isExternalUri: function (r) {
		const anchor = document.createElement('a');
		const currentHostname = window.location && window.location.hostname;

		anchor.href = r;

		return anchor.hostname !== currentHostname;
	},

	/**
	 * Resolve the node for a ntiid with in a bundle or toc
	 *
	 * Returns an array of nodes for each toc in the bundle
	 *
	 * @param  {String} ntiid			  ntiid to resolve
	 * @param  {Bundle|XML} bundleOrTocOrNTIID the bundle to get the tocs from or the toc itself
	 * @return {Promise}					fulfills with the nodes
	 */
	getNodes: function (ntiid, bundleOrTocOrNTIID) {
		var result, me = this;

		result = me.findCache[ntiid];

		if (!result) {
			result = me.__resolveTocs(bundleOrTocOrNTIID)
				.then(function (tocs) {
					var nodes = (tocs || []).map(function (toc) {
						return me.__findNode(ntiid, toc);
					});

					//filter out falsy values
					nodes = nodes.filter(function (node) {
						return !!node;
					});

					return nodes;
				});

			me.findCache[ntiid] === result;
		}

		return result;
	},

	__getNodesLineage: function (ntiid, bundleOrToc, fn) {
		if (!ntiid) {
			return Promise.resolve([]);
		}

		function mapNode (node) {
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

			return lineage;
		}

		return this.getNodes(ntiid, bundleOrToc)
			.then(function (nodes) {
				return (nodes || []).map(mapNode);
			});
	},

	/**
	 * Return the an array of arrays of ids of the paths from the ntiid to the root
	 * for all the tocs in the bundle
	 *
	 * @param  {String} ntiid	   ntiid to start at
	 * @param  {Bundle|XML} bundleOrToc context to look under
	 * @return {Promise}			 fulfills with the paths for all the tocs that have one
	 */
	getLineage: function (ntiid, bundleOrToc) {
		ntiid = this.getNTIIDFromThing(ntiid);

		return this.__getNodesLineage(ntiid, bundleOrToc, function (node) {
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
	 * @param  {String} ntiid	   ntiid to start at
	 * @param  {Boolean} showBundleAsRoot --
	 * @param  {Bundle|XML} bundleOrToc context to look under
	 * @return {Promise}			 fulfills with the paths for all the tocs that have one
	 */
	getLineageLabels: function (ntiid, showBundleAsRoot, bundleOrToc) {
		ntiid = this.getNTIIDFromThing(ntiid);

		return this.__getNodesLineage(ntiid, bundleOrToc, function (node) {
			var label = node.getAttribute ? node.getAttribute('label') : null;

			if (label) {
				return label;
			} else if (node.nodeType !== Node.DOCUMENT_NODE) {
				console.error('Missing Label: ', node);
				return 'Missing Label';
			}
		}).then(function (labels) {
			if (showBundleAsRoot) {
				//TODO: figure this out
			}

			return labels;
		});
	},

	listenToLibrary: function () {
		if (this.libraryMon) {
			return;
		}

		this.libraryMon = this.mon(this.LibraryStore, {
			destroyable: true,
			loaded: this.clearCache.bind(this)
		});
	},

	clearCache: function () {
		this.cache = {};
		this.findCache = {};
	},

	/**
	 * Get the location info for a ntiid within the context of the bundle or toc
	 *
	 * @param  {String} ntiid	   ntiid to look for
	 * @param  {Bundle|Toc} bundleOrToc context to look in
	 * @return {Promise}			 fulfills with location info
	 */
	getLocation: function (ntiid, bundleOrToc) {
		ntiid = this.getNTIIDFromThing(ntiid);

		var me = this, result;

		function getAttribute (elements, attr) {
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

		function mapNode (node) {
			var doc = node.toc && node.toc.documentElement,
				loc = node.location;

			return Ext.apply({
				NTIID: ntiid,
				icon: getAttribute([loc, doc], 'icon'),
				isCourse: (getAttribute([loc, doc], 'isCourse') || '').toLowerCase() === 'true',
				root: getAttribute([loc, doc], 'base'),
				title: getAttribute([loc, doc], 'title'),
				label: getAttribute([loc, doc], 'label'),
				thumbnail: getAttribute([loc, doc], 'thumbnail'),
				getIcon: function (fromBook) {
					var iconPath = fromBook ? this.title.get('icon') : this.icon;

					if (iconPath.substr(0, this.root.length) !== root) {
						iconPath = this.root + this.icon;
					}

					return iconPath;
				},
				getPathLabel: function () {
					return me.getLineageLabels(this.NTIID, bundleOrToc)
						.then(function (lineages) {
							var lineage = lineages[0],
								sep = lineage.length <= 2 ? ' / ' : ' /.../ ',
								base = lineage.last() || '',
								leaf = lineage.first();

							return lineage.length <= 1 ? base : base + sep + leaf;
						});
				}
			}, node);
		}

		me.listenToLibrary();

		result = me.cache[ntiid];

		if (!result) {
			result = this.getNodes(ntiid, bundleOrToc)
				.then(function (nodes) {
					return (nodes || []).map(mapNode);
				});

			me.cache[ntiid] = result;
		}

		return result;
	},

	getBlankNavInfo: function (suppressed) {
		return {
			isSupressed: suppressed,
			currentIndex: 0,
			totalNodes: 1,
			previous: null,
			next: null,
			previousTitle: '',
			nextTitle: ''
		};
	},

	__getNavInfoFromToc: function (node, toc, rootId) {
		var root = toc && toc.firstChild,
			onSuppressed = false,
			prev, next, prevTitle, nextTitle,
			walker, visibleNodes, currentIndex,
			topicOrTocRegex = /topic|toc/i;

		function maybeBlocker (id) {
			return (!id || /\.blocker(\.)?/ig.test(id)) ? true : false;
		}

		function isTopicOrToc (n) {
			if (!n) { return false; }

			var result = NodeFilter.FILTER_SKIP,
				topicOrToc = topicOrTocRegex.test(n.tagName),
				href = (n.getAttribute) ? n.getAttribute('href') : null;

			//decide if this is a navigate-able thing, it must be a topic or toc, it must
			//have an href, and that hre must NOT have a fragment
			if (topicOrToc && href && href.lastIndexOf('#') === -1 && !node.hasAttribute('suppressed')) {
				result = NodeFilter.FILTER_ACCEPT;
			}

			return result;
		}

		function getRef (n) {
			if (!n || !n.getAttribute) {
				return null;
			}

			return n.getAttribute('ntiid') || null;
		}


		function getTitle (n) {
			if (!n || !n.getAttribute) {
				return '';
			}

			return n.getAttribute('label') || '';
		}


		if (!node || !toc) {
			return null;
		}

		//If we have a rootId, lets make that what we consider the root.
		if (rootId) {
			root = toc.querySelector('[ntiid="' + ParseUtils.escapeId(rootId) + '"]') || root;
		}

		if (node.hasAttribute('suppressed')) {
			node.removeAttribute('suppressed');
			onSuppressed = true;
		}

		visibleNodes = Array.prototype.slice.call(root.querySelectorAll('topic[ntiid]:not([suppressed]):not([href*="#"])'));
		visibleNodes.unshift(root);

		if (onSuppressed) {
			node.setAttribute('suppressed', 'true');
		}

		currentIndex = visibleNodes.indexOf(node);

		if (node) {
			walker = toc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, isTopicOrToc, false);

			walker.currentNode = node;
			prev = walker.previousNode();

			walker.currentNode = node;
			next = walker.nextNode();
		}

		if (!maybeBlocker(getRef(prev))) {
			prevTitle = getTitle(prev);
			prev = getRef(prev);
		}

		if (!maybeBlocker(getRef(next))) {
			nextTitle = getTitle(next);
			next = getRef(next);
		}

		//If the current index is not in the visible nodes, just show it as 1 page
		//with not next or previous
		if (currentIndex < 0) {
			return this.getBlankNavInfo(onSuppressed);
		}

		return {
			isSuppressed: onSuppressed,
			currentIndex: currentIndex,
			totalNodes: visibleNodes.length,
			previous: prev,
			next: next,
			previousTitle: prevTitle,
			nextTitle: nextTitle
		};
	},

	getNavigationInfo: function (ntiid, rootId, bundleOrToc) {
		if (!ntiid) {
			return Promise.reject('No NTIID');
		}

		var me = this;

		function mapNode (node) {
			return me.__getNavInfoFromToc(node && node.location, node && node.toc, rootId);
		}


		return this.getNodes(ntiid, bundleOrToc)
			.then(function (nodes) {
				nodes = (nodes || []).map(mapNode);

				nodes = nodes.filter(function (node) {
					return !!node;
				});

				return nodes[0];
			})
			.then(function (info) {
				var result;

				if (!info) {
					result = me.getBlankNavInfo(false);
				} else if (bundleOrToc.canGetToContent) {
					result = Promise.all([
						bundleOrToc.canGetToContent(info.previous, rootId),
						bundleOrToc.canGetToContent(info.next, rootId)
					]).then(r => {
						info.previous = r[0] ? info.previous : null;
						info.next = r[1] ? info.next : null;

						return info;
					});
				} else {
					result = info;
				}

				return result;
			});
	},

	/**
	 * Return the ntiid for the page containing the ntiid passed in the toc passed in
	 *
	 * TODO: I'm not sure if we should even be using this, but the current way of getting the breadcrumb
	 * for a reading is relying on it so keep it around for now
	 *
	 * @param  {String} ntiid	   nttid to look for the containing page
	 * @param  {Bundle|XML} bundleOrToc TOC to look in
	 * @return {Promise}			 fulfills with the page id
	 */
	getPageID: function (ntiid, bundleOrToc) {
		var me = this;

		function getPageInToc (toc) {
			return me.getLineage(ntiid, toc)
				.then(function (lineages) {
					var l = (lineages && lineages[0]) || [],
						i, href, node;

					for (; l.length > 0;) {
						i = me.__findNode(l.shift(), toc);

						node = i && i.location;
						href = node && node.getAttribute('href');

						if (href && href.indexOf('#') < 0) {
							return i.NTIID;
						}
					}
				});
		}


		return me.__resolveTocs(bundleOrToc)
			.then(function (tocs) {
				return Promise.all((tocs || []).map(getPageInToc));
			})
			.then(function (pages) {
				return pages && pages.filter(x => x)[0];
			});
	},

	getRootForLocation: function (ntiid, bundleOrToc) {
		var me = this;

		if (me.IGNORE_ROOTING.test(ntiid)) {
			return Promise.resolve(null);
		}

		return me.getNodes(ntiid, bundleOrToc)
			.then(function (info) {
				info = info && info[0];

				if (!info) { return null; }

				var node;


				node = info.location;

				while (node && node.parentNode) {
					if (node.parentNode === node.ownerDocument.firstChild || node.parentNode === node.ownerDocument) { break; }

					node = node.parentNode;

					if (/\.blocker/i.test(node.getAttribute && node.getAttribute('ntiid'))) {
						console.error('\n\n\n\nBLOCKER NODE DETECTED IN HIERARCHY!!\n');
					}
				}

				return (node && node.getAttribute && node.getAttribute('ntiid')) || null;
			});
	},

	getFirstTopic: function (node) {
		return node.querySelector && node.querySelector('topic');
	},

	hasChildren: function (node) {
		var num = 0;

		node = this.getFirstTopic(node);

		for (node; node && node.nextSibling; node = node.nextSibling) {
			if (!/topic/i.test(node.tagName) || (node.getAttribute('href') || '').indexOf('#') >= 0) {
				continue;
			}

			num++;
		}

		return num > 0;
	},

	getSiblings: function (node, bundleOrToc) {
		var ntiid = node && node.getAttribute && node.getAttribute('ntiid'),
			nodes = [];

		function getSiblings (info) {
			var children,
				p = node && node.parentNode,
				courseNode = info && info.toc && info.toc.querySelector('unit[ntiid="' + ntiid + '"],lesson[topic-ntiid="' + ntiid + '"]');

			if (courseNode) {
				p = courseNode.parentNode;
			}

			children = p && p.getChildren();

			children = children ? Array.prototype.slice.call(children) : [];

			children.forEach(function (child) {
				var childId;

				if (/topic/i.test(child.tagName)) {
					nodes.push(child);
					return;
				}

				if (/content:related/i.test(child.tagName) && /^application\/vnd.nextthought\.content$/i.test(child.getAttribute('type'))) {
					childId = child.getAttribute('href');
				} else if (/lesson/i.test(child.tagName)) {
					childId = child.getAttribute('topic-ntiid');
				} else {
					return;
				}

				if (!ParseUtils.isNTIID(childId)) {
					console.warn('bad ntiid in content!!');
					return;
				}

				child = info && info.toc && info.toc.querySelector('topic[ntiid="' + childId + '"]');
				if (child) {
					nodes.push(child);
				}
			});

			return nodes;
		}

		return this.getNodes(ntiid, bundleOrToc)
			.then(function (infos) {
				infos = (infos || []).map(getSiblings);

				infos.filter(function (x) { return !!x; });

				return infos[0];
			});
	},


	bustCorsForResources: function (string, name, value) {
		//Look for things we know come out of a different domain
		//and append a query param.	 This allows us to, for example,
		//add a query param related to our location host so that
		//we can tell amazon's caching servers to take that into consideration

		//We are looking for an attribute whose valus is a quoted string
		//referenceing resources.  We ignore urls with a protocol or protcolless
		//absolute urls (//).  We look for relative urls rooted at resources.
		//or absolute urls whose first folder is resources.
		//TODO Processing html with a regex is stupid
		//consider parsing and using selectors here instead.  Note
		//we omit things that contain query strings here
		var regex = /(\S+)\s*=\s*"(((\/[^"\/]+\/)||\/)resources\/[^?"]*?)"/igm;

		function cleanup (original, attr, url) {
			return attr + '="' + url + '?' + name + '=' + value + '"';
		}

		return string.replace(regex, cleanup);
	},

	fixReferences: function (string, basePath) {
		var me = this,
			envSalt = $AppConfig.corsSalt ? ('?' + $AppConfig.corsSalt) : '',
			locationHash = String.hash(window.location.hostname + envSalt);

		function fixReferences (original, attr, url) {
			const {location} = global;
			var firstChar = url.charAt(0),
				absolute = firstChar === '/',
				anchor = firstChar === '#',
				external = me.externalUriRegex.test(url),
				host = absolute ? getURL() : basePath,
				params;

			if (/src/i.test(attr) && /youtube/i.test(url)) {
				params = [
					'html5=1',
					'enablejsapi=1',
					'autohide=1',
					'modestbranding=1',
					'rel=0',
					'showinfo=0',
					'wmode=opaque',
					'origin=' + encodeURIComponent(location.protocol + '//' + location.host)];

				return Ext.String.format('src="{0}?{1}"',
					url.replace(/http:/i, 'https:').replace(/\?.*/i, ''),
					params.join('&'));
			}

			//inline
			return (anchor || external || /^data:/i.test(url)) ?
				original : attr + '="' + host + url + '"';
		}

		string = this.bustCorsForResources(string, 'h', locationHash);
		string = string.replace(/(src|href|poster)="(.*?)"/igm, fixReferences);
		return string;
	},

	/**
	 * @param  {String|Node} html content to get the snippet from
	 * @param  {int} max max...
	 * @return {String} html
	 */
	getHTMLSnippet: function (html, max) {
		var i = /[^\.\?!]+[\.\?!]?/,
			spaces = /(\s{2,})/,
			df = document.createDocumentFragment(),
			d = document.createElement('div'),
			out = document.createElement('div'),
			texts, c = 0,
			r = document.createRange();

		df.appendChild(d);
		if (Ext.isString(html)) {
			d.innerHTML = html;
		}
		else if (html && html.cloneNode) {
			d.appendChild(html.cloneNode(true));
		}
		else {
			Ext.Error.raise('IllegalArgument');
		}

		Ext.each(Ext.DomQuery.select('.body-divider .toolbar', d), function (e) { e.parentNode.removeChild(e); });
		html = d.innerHTML; //filter out whiteboard controls

		if (d.firstChild) {
			r.setStartBefore(d.firstChild);
		}
		texts = lazy.AnnotationUtils.getTextNodes(d);

		Ext.each(texts, function (t) {
			var o = c + t.length,
				v = t.nodeValue,
				offset;

			Ext.each(spaces.exec(v) || [], function (gap) {
				o -= (gap.length - 1);//subtract out the extra spaces, reduce them to count as 1 space(hence the -1)
			});


			if (o > max) { //Time to split!
				offset = max - c;
				v = v.substr(offset);
				v = i.exec(v);
				offset += (v && v.length > 0 ? v[0].length : 0);
				r.setEnd(t, offset);
				return false;
			}

			c = o;
			return true;
		});

		if (!r.collapsed) {
			out.appendChild(r.cloneContents());
			return out.innerHTML;
		}

		//wasn't long enough to split
		return html;
	},

	getReadingBreadCrumb: function (reading) {
		var path = this.getReadingPath(reading);

		return path.map(function (part) {
			return (part.getAttribute && part.getAttribute('label')) || (part.getAttribute && part.getAttribute('title')) || part.title;
		});
	},

	getReadingPath: function (reading) {
		var path = [], node;

		path.push(reading);

		node = reading.parentNode;

		while (node && (node.tagName === 'topic' || node.tagName === 'toc')) {
			path.push(node);
			node = node.parentNode;
		}

		return path.reverse();
	},

	getReadingPages: function (reading) {
		var children = reading.children;

		children = Array.prototype.slice.call(children);

		return children.filter(function (node) {
			var tagName = node.tagName,
				href = node.getAttribute('href'),
				parts = href && Globals.getURLParts(href);

			return tagName === 'topic' && href && !parts.hash && !node.querySelector('object[mimeType$=assignment], object[mimeType$=naquestionset]');
		});
	},

	getReading: function (ntiid, bundle) {
		function findReading (toc) {
			var escaped = ParseUtils.escapeId(ntiid),
				query = 'toc[ntiid="' + escaped + '"],topic[ntiid="' + escaped + '"]';

			return toc.querySelector(query);
		}

		return this.__resolveTocs(bundle)
			.then(function (tocs) {
				return tocs.map(findReading).filter(x => x)[0];
			});
	},

	getReadings: function (bundle, unfiltered, contentPackageID) {
		// function getTitle (toc) {
		// 	var t = toc.querySelector('toc');
		// 	return t && t.getAttribute('title');
		// }

		// function getTocID (toc) {
		// 	var t = toc.querySelector('toc');
		// 	return t && t.getAttribute('ntiid');
		// }

		function buildNavigationMap (toc) {
			var nodes = toc.querySelectorAll('course, course unit, course lesson');

			nodes = Array.prototype.slice.call(nodes);

			return nodes.reduce(function (acc, node) {
				var ntiid = node.getAttribute('ntiid') || node.getAttribute('topic-ntiid');

				acc[ntiid] = true;

				return acc;
			}, {});
		}

		function findUnfilteredReadings (toc) {
			buildNavigationMap(toc);
			let topLevel = toc.querySelectorAll('toc, toc > topic');

			topLevel = Array.prototype.slice.call(topLevel);

			return topLevel;
		}

		function findFilteredReadings (toc) {
			var navigation = buildNavigationMap(toc),
				readingNodes = toc.querySelectorAll('toc, topic[label=Readings]');

			readingNodes = Array.prototype.slice.call(readingNodes);

			readingNodes = readingNodes.filter(function (node) {
				var ntiid = node.getAttribute('ntiid');

				return !navigation[ntiid];
			});

			return readingNodes;
		}

		let resolve = contentPackageID ? this.__resolveTocFor(bundle, contentPackageID) : this.__resolveTocs(bundle);

		return resolve
			.then(function (tocs) {
				if (!Array.isArray(tocs)) {
					tocs = [tocs];
				}

				const readings = tocs.map(unfiltered ? findUnfilteredReadings : findFilteredReadings);

				return contentPackageID ? readings[0] : readings;
			});
	},


	getContentPackageContainingReading (ntiid, bundle) {
		const contentPackages = this.__getContentPackages(bundle);
		let toCheck = [...contentPackages];

		function findReading (toc) {
			var escaped = ParseUtils.escapeId(ntiid),
				query = 'toc[ntiid="' + escaped + '"],topic[ntiid="' + escaped + '"]';

			return toc.querySelector(query);
		}


		const checkNext = (onFound, notFound) => {
			const current = toCheck.pop();
			const id = current && current.get('NTIID');

			if (!current) {
				return notFound();
			}

			if (id === ntiid) {
				return onFound(current);
			}

			this.__resolveTocFor(bundle, id)
				.then((toc) => {
					if (findReading(toc)) {
						onFound(current);
					} else {
						checkNext(onFound, notFound);
					}
				})
				.catch(() => {
					checkNext(onFound, notFound);
				});
		};


		return new Promise((fulfill, reject) => {
			checkNext(fulfill, reject);
		})
			.catch(() => null);
	}
}).create();
