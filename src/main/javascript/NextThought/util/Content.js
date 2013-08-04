Ext.define('NextThought.util.Content', {
	singleton: true,

	NO_LOCATION: {},

	requires:['NextThought.Library'],

	timers: {},
	cache: {},

	spider: function (ids, finish, parse, pageFailure) {
		if (!Ext.isArray(ids)) {
			ids = [ids];
		}

		var service = $AppConfig.service,
			me = this,
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

		Ext.each(ids, function (id) {
			function failure(req, resp) {
				try {
					Ext.callback(pageFailure, null, arguments);
				}
				catch (e) {
					console.error(e.message);
				}
				maybeFinish();
			}

			service.getPageInfo(id,
				Ext.bind(me.getContentForPageInfo, me, [parseContent, failure], 1),
				failure, me);
		});
	},


	getContentForPageInfo: function (pageInfo, callback, failure) {
		var proxy = ($AppConfig.server.jsonp) ? JSONP : Ext.Ajax;

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

		proxy.request({
			ntiid: pageInfo.getId(),
			jsonpUrl: pageInfo.getLink('jsonp_content'),
			url: pageInfo.getLink('content'),
			expectedContentType: 'text/html',
			scope: this,
			success: Ext.bind(callback, null, [pageInfo], 1),
			failure: failed
		});
	},


	parseXML: function (xml) {
		try {
			return new DOMParser().parseFromString(xml, "text/html");
		}
		catch (e) {
			console.error('Could not parse content', Globals.getError(e));
		}

		return undefined;
	},

	/** @private */
	externalUriRegex: /^((\/\/)|([a-z][a-z0-9\+\-\.]*):)/i,

	isExternalUri: function (r) {
		return this.externalUriRegex.test(r);
	},

	bustCorsForResources: function (string, name, value) {
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


	fixReferences: function (string, basePath) {

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

		//We eeed a hash for the location.hostname.  We could
		//b64 encode it but that seems like overkill, a simple
		//hash should suffice
		function stringHash(str) {
			var hash = 0, i, c;
			if (Ext.isEmpty(str)) {
				return hash;
			}

			for (i = 0; i < str.length; i++) {
				c = str.charCodeAt(i);
				hash = ((hash << 5) - hash) + c;
				hash = hash & hash; // Convert to 32bit integer
			}
			return hash;
		}

		var me = this,
			envSalt = $AppConfig.corsSalt ? ('?' + $AppConfig.corsSalt) : '',
			locationHash = stringHash(window.location.hostname + envSalt);

		string = this.bustCorsForResources(string, 'h', locationHash);
		string = string.replace(/(src|href|poster)="(.*?)"/igm, fixReferences);
		return string;
	},


	/**
	 *
	 * @param html {String|Node}
	 * @param max {int}
	 * @returns {String}
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

		if(d.firstChild){
			r.setStartBefore(d.firstChild);
		}
		texts = AnnotationUtils.getTextNodes(d);

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

		return null;
	},


	findTitle: function(containerId, defaultTitle){
		var l = this.find(containerId);
		if(defaultTitle === undefined){
			defaultTitle = "Not found";
		}
		return l ? l.location.getAttribute('label') : defaultTitle;
	},


	find: function(containerId, reportMiss) {
		var result = null;
		Library.each(function(o){
			result = Library.resolve( Library.getToc( o ), o, containerId, reportMiss);
			return !result;
		});

		return result;
	},


	//Returns the prefix of the content ntiid we think this ntiid
	//would reside beneath
	contentPrefix: function(id){
		var ntiid = ParseUtils.parseNtiid(id), title, index;

		ntiid.specific.type = 'HTML';
		ntiid.specific.typeSpecific = ntiid.specific.typeSpecific.split('.').first();
		return ntiid.toString();
	},


	/**
	 *  Looks in content for the content object with the given id
	 */
	findContentObject: function(id, callback, scope){
		var titleNtiidPrefix = this.contentPrefix(id),
			title = titleNtiidPrefix ? this.findTitleWithPrefix(titleNtiidPrefix) : null;
		if(!title){
			Ext.callback(cb, scope);
			return;
		}

		//One place we can check is the video index
		Library.getVideoIndex(title, function(index){
			var vid;
			if(!index){
				Ext.callback(cb, scope);
				return;
			}

			vid = (index)[id];

			if(vid){
				//We need the base path
				LocationMeta.getMeta(title.get('NTIID'), function(meta){
					if(meta){
						vid.basePath = meta.absoluteContentRoot;
						Ext.callback(cb, scope, [vid]);
					}
					else{
						Ext.callback(cb, scope);
					}
				});
			}
			else{
				Ext.callback(cb, scope, [vid]);
			}

		}, this);
	},


	getLineage: function(ntiid, justLabels){
		if(!ntiid){
			Ext.Error.raise('No ntiid given');
		}

		var leaf = this.find(ntiid) || {},
			node = leaf.location,
			lineage = [],
			id;

		while(node){

			id = node.getAttribute? node.getAttribute(justLabels?'label':'ntiid') : null;
			if( id ) {
				lineage.push(id);
			}
			else if( node.nodeType !== Node.DOCUMENT_NODE ){
				console.warn( node, 'no id');
			}
			node = node.parentNode;
		}

		return lineage;
	},


	getSortIndexes: function(ntiid){
		if(!ntiid){
			Ext.Error.raise('No ntiid given');
		}

        function findByFunction(r){return r.get('NTIID') ===id;}

		var noLeaf = {},
			leaf = this.find(ntiid) || noLeaf,
			node = leaf.location,
			indexes = [],
			id, i, cn, j, t, levelnum;

		if(leaf === noLeaf){ return [0, Infinity];}

		while(node){
			id = node.getAttribute? node.getAttribute('ntiid') : null;
			levelnum = node.getAttribute ? node.getAttribute('levelnum') : null;
			if( id ) {
				if( levelnum === "0" ){
					j = Library.getStore().findBy(findByFunction);
					if(j < 0){ j = Infinity ;}
				}
				else if( node.parentNode ){
					cn = node.parentNode.childNodes;
					i=0; j=0;
					while( i<cn.length){
						t=cn[i].getAttribute ? cn[i].getAttribute('ntiid'): null;
						if(t===id){
							break;
						}
						if(t){ j++; }
						i++;
					}
				}
				else{
					console.log('Unable to find postion of ', id,' in parents children');
					j = Infinity;
				}

				indexes.push(j);
			}
			node = node.parentNode;
		}

		return indexes;
	},


	getRoot: function(ntiid){
		if(!ntiid){
			Ext.Error.raise('No ntiid given');
		}
		var bookId = this.getLineage(ntiid).last(),
			title = Library.getTitle( bookId );

		return title? title.get('root') : null;
	},


	getLocation : function(id){
		function getAttribute(elements, attr){
			var i=0, v;
			for (i; i < elements.length; i++) {
				v = elements[i];
				try{
					v = v ? v.getAttribute(attr) : null;
					if (v) {return v;}
				}
				catch(e){
					console.warn('element did not have getAttribute');
				}
			}
			return null;
		}

		if(id && id.getAttribute){
			id = id.getAttribute('ntiid');
		} else if (id && id.isModel){
			id = id.get('containerId') || id.get('NTIID');
		}

		var me = this, r, l, d, i = id;
		if(!i){
			return this.NO_LOCATION;
		}

		r = me.cache[i];
		if( !r ) {
			r = me.find(i);

			//If still not r, it's not locational content...
			if (!r) {
				me.find(i,true);
				return null;
			}

			d = r.toc.documentElement;
			l = r.location;
			r = Ext.apply({
					NTIID: i,
					icon: getAttribute([l,d],'icon'),
					isCourse: (getAttribute([l,d],'isCourse')||'').toLowerCase()==='true',
					root: getAttribute([l,d],'base'),
					title: getAttribute([l,d],'title'),
					label: getAttribute([l,d],'label'),
					thumbnail: getAttribute([l,d],'thumbnail'),
					getIcon: function(fromBook){
						var iconPath = fromBook? this.title.get('icon') : this.icon;
						if(iconPath.substr(0,this.root.length) !== this.root ){
							iconPath = this.root+this.icon;
						}
						return this.baseURI+iconPath;
					},
					getPathLabel: function(ntiid){
						var lineage = me.getLineage(ntiid||this.NTIID,true),
							sep = lineage.length <= 2 ? ' / ' : ' /.../ ',
							base = lineage.last(),
							leaf = lineage.first();
						return lineage.length === 1 ? base : base + sep + leaf;
					}
				},r);
		}

		me.cache[i] = r;

		clearTimeout(me.timers[i]);
		me.timers[i] = setTimeout(function(){delete me.cache[i];},15000);

		return r;
	},



	getNavigationInfo: function(ntiid) {
		if(!ntiid){
			Ext.Error.raise('No NTIID');
		}

		var loc = this.find(ntiid),
			info = {},
			topicOrTocRegex = /topic|toc/i,
			slice = Array.prototype.slice;

		//This function returns true if the node submitted matches a regex looking for topic or toc
		function isTopicOrToc(node){
			if (!node){return false;}
			var result = false,
				topicOrToc = topicOrTocRegex.test(node.tagName),
				href = (node.getAttribute) ? node.getAttribute('href') : null;

			//decide if this is a navigate-able thing, it most be a topic or toc, it must
			//have an href, and that href must NOT have a anchor
			if (topicOrToc && href && href.lastIndexOf('#') === -1) {
				result = true;
			}

			return result;
		}

		//returns the NTIID attribute of the node, or null if it's not there.
		function getRef(node){
			if(!node || !node.getAttribute){
				return null;
			}

			return node.getAttribute('ntiid') || null;
		}

		function child(n,first){
			var v,
				topics = n && n.childNodes ? slice.call(n.childNodes) : [];

			if(first){
				topics.reverse();
			}

			while(topics.length && !isTopicOrToc(topics.peek())){topics.pop();}
			if(n && topics.length){
				v = topics.peek();
				return first? v : child(v,first);
			}
			return first? null : n;
		}

		//returns either the previous or next actionable node (topic or toc), or null if
		//we never find anything, meaning we are at one end or the other...
		function sibling(node,previous){
			if (!node){return null;}

			var siblingMethod = previous ? 'previousSibling' : 'nextSibling', //figure direction
				siblingNode = node[siblingMethod]; //execute directional sibling method

			//If the sibling is TOC or topic, we are done here...
			return (isTopicOrToc(siblingNode))
					? siblingNode
					//If not, recurse in the same direction
					: sibling(node[siblingMethod],previous);
		}

		loc = loc ? loc.location : null;
		if(loc) {
			info.previous = getRef(child(sibling(loc,true)) || loc.parentNode);
			info.next = getRef(child(loc,true) || sibling(loc,false) || sibling(loc.parentNode,false));
		}

		return info;
	}

}, function () {
	window.ContentUtils = this;
});
