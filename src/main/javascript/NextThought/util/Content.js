Ext.define('NextThought.util.Content', {
	singleton: true,

	NO_LOCATION: {},

	requires: ['NextThought.Library'],

	CONTENT_VISIBILITY_MAP: {
		'OU': 'OUID'
	},

	constructor: function() {
		this.callParent(arguments);
		Ext.apply(this, {
			timers: {},
			cache: {},
			SYM_LINK_MAP: {}
		});
	},

	spider: function(ids, finish, parse, pageFailure) {
		if (!Ext.isArray(ids)) {
			ids = [ids];
		}

		var me = this,
			lock = ids.length;

		function maybeFinish() {
			lock--;
			if (lock > 0) {
				return;
			}
			Ext.callback(finish);
		}


		function parseContent(resp, pageInfo) {
			try {
				Ext.callback(parse, null, [resp.responseText, pageInfo]);
			} catch (e) {
				console.error(Globals.getError(e));
			}
			maybeFinish();
		}

		Ext.each(ids, function(id) {
			function failure(req, resp) {
				try {
					Ext.callback(pageFailure, null, arguments);
				}
				catch (e) {
					console.error(e.message);
				}
				maybeFinish();
			}

			Service.getPageInfo(id,
				Ext.bind(me.getContentForPageInfo, me, [parseContent, failure], 1),
				failure, me);
		});
	},


	getContentForPageInfo: function(pageInfo, callback, failure) {
		function failed(r) {
			console.log('server-side failure with status code ' + r.status + ': Message: ' + r.responseText);
			Ext.callback(failure);
		}

		//If we don't start with a pageInfo, which we have seen happen
		//before, call the failure callback
		if (!pageInfo || !pageInfo.isPageInfo) {
			console.error('Page info was not supplied', pageInfo);
			Ext.callback(failure);
		}

		ContentProxy.request({
			ntiid: pageInfo.getId(),
			jsonpUrl: pageInfo.getLink('jsonp_content'),
			url: pageInfo.getLink('content'),
			expectedContentType: 'text/html',
			scope: this,
			success: Ext.bind(callback, null, [pageInfo], 1),
			failure: failed
		});
	},


	hasVisibilityForContent: function(cnt, status) {
		var u = $AppConfig.userObject,
			visibilityKey = cnt.getAttribute('visibility'),
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
		return u.hasVisibilityField(attr) || attr === status;
	},


	parseXML: function(xml) {
		try {
			return new DOMParser().parseFromString(xml, 'text/html');
		}
		catch (e) {
			console.error('Could not parse content', Globals.getError(e));
		}

		return undefined;
	},

	/** @private */
	externalUriRegex: /^((\/\/)|([a-z][a-z0-9\+\-\.]*):)/i,

	isExternalUri: function(r) {
		return this.externalUriRegex.test(r);
	},

	bustCorsForResources: function(string, name, value) {
		//Look for things we know come out of a different domain
		//and append a query param.  This allows us to, for example,
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

		function cleanup(original, attr, url) {
			return attr + '="' + url + '?' + name + '=' + value + '"';
		}

		return string.replace(regex, cleanup);
	},


	fixReferences: function(string, basePath) {

		function fixReferences(original, attr, url) {
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

		var me = this,
			envSalt = $AppConfig.corsSalt ? ('?' + $AppConfig.corsSalt) : '',
			locationHash = String.hash(window.location.hostname + envSalt);

		string = this.bustCorsForResources(string, 'h', locationHash);
		string = string.replace(/(src|href|poster)="(.*?)"/igm, fixReferences);
		return string;
	},


	/**
	 *
	 * @param {String|Node} html
	 * @param {int} max
	 * @return {String}
	 */
	getHTMLSnippet: function(html, max) {
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

		Ext.each(Ext.DomQuery.select('.body-divider .toolbar', d), function(e) { e.parentNode.removeChild(e); });
		html = d.innerHTML; //filter out whiteboard controls

		if (d.firstChild) {
			r.setStartBefore(d.firstChild);
		}
		texts = AnnotationUtils.getTextNodes(d);

		Ext.each(texts, function(t) {
			var o = c + t.length,
				v = t.nodeValue,
				offset;

			Ext.each(spaces.exec(v) || [], function(gap) {
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


	findTitle: function(containerId, defaultTitle) {
		var l = this.find(containerId);
		if (defaultTitle === undefined) {
			defaultTitle = 'Not found';
		}
		return l ? l.location.getAttribute('label') : defaultTitle;
	},


	find: function(containerId, reportMiss) {
		var result = null,
			cache = this.findCache = (this.findCache || {});

		if (!containerId || !ParseUtils.isNTIID(containerId)) {
			console.error('Invalid ID');
			return null;
		}

		result = cache[containerId];
		if (!result) {
			Library.each(function(o) {
				result = Library.resolve(Library.getToc(o), o, containerId, reportMiss);
				return !result;
			});
			if (result) {
				cache[containerId] = result;
			}
		}

		return result;
	},


	//Returns the prefix of the content ntiid we think this ntiid
	//would reside beneath
	contentPrefix: function(id) {
		var ntiid = ParseUtils.parseNTIID(id);
		if (ntiid) {
			ntiid.specific.type = 'HTML';
			ntiid.specific.typeSpecific = ntiid.specific.typeSpecific.split('.').first();
		}
		return ntiid && ntiid.toString();
	},


	/**
	 *  Looks in content for the content object with the given id
	 */
	findContentObject: function(id, cb, scope) {
		var titleNtiidPrefix = this.contentPrefix(id),
			title = titleNtiidPrefix ? Library.findTitleWithPrefix(titleNtiidPrefix) : null;
		if (!title) {
			Ext.callback(cb, scope);
			return;
		}

		//One place we can check is the video index
		Library.getVideoIndex(title, function(index) {
			var vid, container;
			if (!index) {
				Ext.callback(cb, scope);
				return;
			}

			vid = index[id];

			if (vid) {
				container = this.getLineage(id);
				if (!Ext.isEmpty(container) && container.length > 1) {
					container = container[1];
				}
				else {
					container = title.get('NTIID');
				}
				//We need the base path
				LocationMeta.getMeta(container, function(meta) {
					if (meta) {
						vid.basePath = meta.absoluteContentRoot;
						Ext.callback(cb, scope, [vid, meta]);
					}
					else {
						Ext.callback(cb, scope);
					}
				});
			}
			else {
				Ext.callback(cb, scope, [vid]);
			}

		}, this);
	},


	findRelatedContentObject: function(id, cb, scope) {
		var titleNTiidPrefix = this.contentPrefix(id),
			title = titleNTiidPrefix ? Library.findTitleWithPrefix(titleNTiidPrefix) : null,
			toc, locationInfo, container;

		if (!title) {
			Ext.callback(cb, scope);
			return false;
		}

		toc = Library.getToc(title);
		locationInfo = Library.resolve(toc, title, id, true);
		if (locationInfo) {
			container = ContentUtils.getLineage(locationInfo.NTIID);
			if (!Ext.isEmpty(container) && container.length > 1) {
				container = container[1];
			}
			else {
				container = title.get('NTIID');
			}
			Ext.callback(cb, scope, [container, locationInfo]);
			return false;
		}

		Ext.callback(cb, scope);
		return true;
	},

	/**
	 * Returns a Purchasable if we have one in the store that looks
	 * like it would contain the following ntiid.
	 * @param {String} ntiid A content ntiid or sub ntiid (question ntiid)
	 * @param {Function} wantsItem
	 */
	purchasableForContentNTIID: function(ntiid, wantsItem) {
		function fn(rec) {
			var items = rec.get('Items') || [], found = false;
			Ext.each(items, function(i) {
				if (i.indexOf(prefix) === 0) { found = true; }
				return !found;
			});
			return found;
		}

		function getPrefix(ntiid) {
			var root = ContentUtils.getLineage(ntiid).last();

			// NOTE: A Purchasable could represent both a book, you don't have access to,
			// or a course you're not enrolled in. Here we try to resolve the root id by
			// first looking if it's something in our library
			// if not, we will use what we think the root content should be.

			if (!root) {
				//NOTE this again assumes 1-to-1 purchase to content root.
				root = ParseUtils.bookPrefixIfQuestionNtiid(ntiid);
				root = root ? Library.findTitleWithPrefix(root) : null;
				root = root ? root.get('NTIID') : null;

				// If we still don't have a root,  use what we think the root content should be.
				root = root || ContentUtils.contentPrefix(ntiid);
			}

			return root;
		}

		var prefix = getPrefix(ntiid),
			purchasableStore = Ext.getStore('Purchasable'),
			purchasable, index;

		purchasableStore = purchasableStore.snapshot || purchasableStore;

		if (prefix) {
			index = purchasableStore.findBy(fn);
			if (!Ext.isObject(index)) {
				purchasable = index >= 0 ? purchasableStore.getAt(index) : null;
			}
			else {
				purchasable = index;
			}
		}
		console.log('purchasable: ', purchasable);

		if (Ext.isFunction(wantsItem)) {
			return wantsItem.apply(this, [purchasable]) ? purchasable : null;
		}
		return purchasable;
	},


	getSiblings: function(node) {
		var p = node && node.parentNode,
			ntiid = node && node.getAttribute && node.getAttribute('ntiid'),
			nodes = [],
			info = this.find(ntiid) || {},
			link = this.isSymLinked(node, info.toc),
			children, courseNode;

		courseNode = info.toc.querySelector('unit[ntiid="' + ntiid + '"],lesson[topic-ntiid="' + ntiid + '"]');
		if (courseNode) {
			p = courseNode.parentNode;
			link = null;
		}

		p = link || p;
		children = p && p.getChildren();


		Ext.each(children || [], function(n) {
			var ntiid;
			if (/topic/i.test(n.tagName)) {
				nodes.push(n);
				return;
			}

			if (/content:related/i.test(n.tagName) && /^application\/vnd.nextthought\.content$/i.test(n.getAttribute('type'))) {
				ntiid = n.getAttribute('href');
			} else if (/lesson/i.test(n.tagName)) {
				ntiid = n.getAttribute('topic-ntiid');
			} else {
				return;
			}

			if (!ParseUtils.isNTIID(ntiid)) {
				console.warn('bad ntiid in content!!');
				return;
			}

			n = info.toc.querySelector('topic[ntiid="' + ntiid + '"]');
			if (n) {
				nodes.push(n);
			}
		});


		return nodes;
	},


	getLineage: function(ntiid, justLabels) {
		if (!ntiid) {
      //			Ext.Error.raise('No ntiid given');
			return [];
		}

		var leaf = this.find(ntiid) || {},
			node = leaf.location,
			lineage = [],
			id, link;

		while (node) {

			id = node.getAttribute ? node.getAttribute(justLabels ? 'label' : 'ntiid') : null;
			if (id) {
				lineage.push(id);
			}
			else if (node.nodeType !== Node.DOCUMENT_NODE) {
				console.error(node, 'no id');
				break;
			}

			link = this.isSymLinked(node, leaf.toc);
			if (link) {
				console.warn('Using SymLinked Parent Node as Lineage instead of ACTUAL parentNode for ', node.getAttribute('ntiid'));
				node = link;
			}
			else {
				node = node.parentNode;
			}
		}

		return lineage;
	},


	/**
	 * A topic is considered symbolically linked to another node IF and ONLY IF we find a related(with content's NS)
	 * node which is NOT parented by the root(toc) node AND has a SIBLING object tag that links to the related tag.
	 *
	 * First find this: (where node-id is the node we are currently examining)
	 * <content:related ntiid="ref-id" href="node-id" type="application/vnd.nextthought.content"/>
	 *
	 * Filter that resulting list by making sure there is an ntiid attribute, and that its parentNode is not the toc AND
	 * we find one (and only one) object tag where the related tag's ntiid is its ntiid:
	 * <object mimeType="application/vnd.nextthought.relatedworkref" ntiid="ref-id" />
	 *
	 *
	 * @param {Element} node
	 * @param {Document} toc
	 * @return {*} Returns the linked parent or false
	 */
	isSymLinked: function(node, toc) {
		var EA = Ext.Array,
			map = this.SYM_LINK_MAP,
			id = node.getAttribute ? node.getAttribute('ntiid') : null,
			nodes;

		if (!id || !$AppConfig.enableSymbolicLinkingNav) {return false;}


		if (!map.hasOwnProperty(id)) {
			nodes = EA.filter(EA.toArray(toc.getElementsByTagNameNS('http://www.nextthought.com/toc', 'related'), 0, 0), function(a) {
				var pass = false,
					aId = a.getAttribute && a.getAttribute('ntiid'),
					type = a.getAttribute && a.getAttribute('type') === 'application/vnd.nextthought.content',
					p = a.parentNode;

				if (type && p && p.tagName !== 'toc' && aId && a.getAttribute('href') === id) {
					pass = !!Ext.fly(a.parentNode).first('object[mimeType$=relatedworkref][ntiid="' + aId + '"]', true);
				}

				return pass;
			});

			if (!nodes || nodes.length === 0) {
				map[id] = false;
			}
			else {
				map[id] = nodes[0].parentNode;//first occurance
				if (nodes.length > 1) {
					console.error('I am not able to process multi-homed content references! First occurance of ref is being used as home/parent link', id, nodes);
				}
			}
		}

		return map[id];
	},


	getSortIndexes: function(ntiid) {
		if (!ntiid) {
			Ext.Error.raise('No ntiid given');
		}

    function findByFunction(r) {return r.get('NTIID') === id;}

		var noLeaf = {},
			leaf = this.find(ntiid) || noLeaf,
			node = leaf.location,
			indexes = [],
			id, i, cn, j, t, levelnum;

		if (leaf === noLeaf) { return [0, Infinity];}

		while (node) {
			id = node.getAttribute ? node.getAttribute('ntiid') : null;
			levelnum = node.getAttribute ? node.getAttribute('levelnum') : null;
			if (id) {
				if (levelnum === '0') {
					j = Library.getStore().findBy(findByFunction);
					if (j < 0) { j = Infinity;}
				}
				else if (node.parentNode) {
					cn = node.parentNode.childNodes;
					i = 0; j = 0;
					while (i < cn.length) {
						t = cn[i].getAttribute ? cn[i].getAttribute('ntiid') : null;
						if (t === id) {
							break;
						}
						if (t) { j++; }
						i++;
					}
				}
				else {
					console.log('Unable to find postion of ', id, ' in parents children');
					j = Infinity;
				}

				indexes.push(j);
			}
			node = node.parentNode;
		}

		return indexes;
	},


	getRoot: function(ntiid) {
		if (!ntiid) {
			Ext.Error.raise('No ntiid given');
		}
		var bookId = this.getLineage(ntiid).last(),
			title = Library.getTitle(bookId);

		return title ? title.get('root') : null;
	},


	getLocation: function(id) {
		function getAttribute(elements, attr) {
			var i = 0, v;
			for (i; i < elements.length; i++) {
				v = elements[i];
				try {
					v = v ? v.getAttribute(attr) : null;
					if (v) {return v;}
				}
				catch (e) {
					console.warn('element did not have getAttribute');
				}
			}
			return null;
		}

		if (id && id.getAttribute) {
			id = id.getAttribute('ntiid');
		} else if (id && id.isModel) {
			id = id.get('containerId') || id.get('NTIID');
		}

		var me = this, r, l, d, i = id;
		if (!i || !ParseUtils.isNTIID(i)) {
			return this.NO_LOCATION;
		}

		r = me.cache[i];
		if (!r) {
			r = me.find(i);

			//If still not r, it's not locational content...
			if (!r) {
				me.find(i, true);
				return null;
			}

			d = r.toc.documentElement;
			l = r.location;
			r = Ext.apply({
					NTIID: i,
					icon: getAttribute([l, d], 'icon'),
					isCourse: (getAttribute([l, d], 'isCourse') || '').toLowerCase() === 'true',
					root: getAttribute([l, d], 'base'),
					title: getAttribute([l, d], 'title'),
					label: getAttribute([l, d], 'label'),
					thumbnail: getAttribute([l, d], 'thumbnail'),
					getIcon: function(fromBook) {
						var iconPath = fromBook ? this.title.get('icon') : this.icon;
						if (iconPath.substr(0, this.root.length) !== this.root) {
							iconPath = this.root + this.icon;
						}
						return this.baseURI + iconPath;
					},
					getPathLabel: function(ntiid) {
						var lineage = me.getLineage(ntiid || this.NTIID, true),
							sep = lineage.length <= 2 ? ' / ' : ' /.../ ',
							base = lineage.last(),
							leaf = lineage.first();
						return lineage.length === 1 ? base : base + sep + leaf;
					}
				},r);
		}

		me.cache[i] = r;

		clearTimeout(me.timers[i]);
		me.timers[i] = setTimeout(function() {delete me.cache[i];},15000);

		return r;
	},



	getNavigationInfo: function(ntiid, rootId) {
		if (!ntiid) {
			Ext.Error.raise('No NTIID');
		}

		var me = this,
			loc = me.find(ntiid),
			info, nodes = [],
			topicOrTocRegex = /topic|toc/i,
			slice = Array.prototype.slice;

		function maybeBlocker(id) {
			return (!id || /\.blocker\./ig.test(id)) ? undefined : id;
		}

		//This function returns true if the node submitted matches a regex looking for topic or toc
		function isTopicOrToc(node) {
			if (!node) {return false;}
			var result = false,
				topicOrToc = topicOrTocRegex.test(node.tagName),
				href = (node.getAttribute) ? node.getAttribute('href') : null;

			//decide if this is a navigate-able thing, it most be a topic or toc, it must
			//have an href, and that href must NOT have a anchor
			if (topicOrToc && href && href.lastIndexOf('#') === -1 && !node.hasAttribute('suppressed')) {
				result = true;
			}

			return result;
		}

		//returns the NTIID attribute of the node, or null if it's not there.
		function getRef(node) {
			if (!node || !node.getAttribute) {
				return null;
			}

			return node.getAttribute('ntiid') || null;
		}

		function child(n, first) {
			var v,
				topics = n && n.childNodes ? slice.call(n.childNodes) : [];

			if (first) {
				topics.reverse();
			}

			while (topics.length && !isTopicOrToc(topics.peek())) {topics.pop();}
			if (n && topics.length) {
				v = topics.peek();
				return first ? v : child(v, first);
			}
			return first ? null : n;
		}

		//returns either the previous or next actionable node (topic or toc), or null if
		//we never find anything, meaning we are at one end or the other...
		function sibling(node, previous) {
			if (!node) {return null;}

			var siblingProp = previous ? 'previousSibling' : 'nextSibling', //figure direction
				siblingNode = node[siblingProp]; //read directional sibling property (pointer ref)

			//If the sibling is TOC or topic, we are done here...
			return (isTopicOrToc(siblingNode)) ? siblingNode :
					//If not, recurse in the same direction
					sibling(node[siblingProp], previous);
		}

		loc = loc ? loc.location : null;
		if (loc) {
			nodes.push(getRef(child(sibling(loc, true)) || loc.parentNode));
			nodes.push(getRef(child(loc, true) || sibling(loc, false) || sibling(loc.parentNode, false)));
		}

		//If we have a rootId, lets make that what we consider the root.
		if (rootId) {
			//replace siblings that fall outside of our given root.
			nodes = nodes.map(function(n) {
				var l = (n && me.getLineage(n)) || [];
				return (l.indexOf(rootId) < 0) ? null : n;
			});
		}

		info = {
			previous: maybeBlocker(nodes[0]),
			next: maybeBlocker(nodes[1])
		};

		return info;
	}

}, function() {
	window.ContentUtils = this;
});
