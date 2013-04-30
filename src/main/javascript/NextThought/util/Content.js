Ext.define('NextThought.util.Content', {
	singleton: true,


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
	externalUriRegex: /^([a-z][a-z0-9\+\-\.]*):/i,

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
		else if (Ext.isDomNode(html)) {
			d.appendChild(html.cloneNode(true));
		}
		else {
			Ext.Error.raise('IllegalArgument');
		}

		r.setStartBefore(d.firstChild);
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
	}
}, function () {
	window.ContentUtils = this;
});
