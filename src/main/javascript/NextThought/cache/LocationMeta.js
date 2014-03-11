Ext.define('NextThought.cache.LocationMeta', {
	alias: 'LocationMeta',
	singleton: true,

	meta: {},
	ids: {},


	getValue: function(id) {
		return this.meta[this.ids[id]];
	},


	getMeta: function(ntiid, callback, scope) {
		var p = PromiseFactory.make(),
			maybe = this.getValue(ntiid),
			cb = callback || Ext.emptyFn;

		p.then(Ext.bind(cb, scope), Ext.bind(cb, scope, []));

		if (maybe || !ntiid) {
			p.fulfill(maybe);
		} else {
			this.loadMeta(ntiid).then(p);
		}

		return p;
	},


	attachContentRootToMeta: function(meta, pi) {
		function buildPath(s, root) {
			var p = s.split('/'); p.splice(-1, 1, '');
			p = p.join('/');
			//trim off the root if its present
			return p.replace(new RegExp(RegExp.escape(root) + '$'), '');
		}

		meta.baseURI = buildPath(pi.getLink('content'), meta.root);
		meta.absoluteContentRoot = meta.baseURI + meta.root;
    meta.pageInfo = pi; // cache the pageInfo as well.

		return meta;
	},


	cacheMeta: function(meta, theId, ntiid, assessmentItems) {
		var me = this;
		this.meta[theId] = meta;
		this.ids[ntiid] = theId;

		//Also yank out any assessment items and cache them by id.  Note
		//right now this only works because there is a one-to-one question to
		//PageInfo mapping.  If I recall that is happening on the server now also
		//but is probably temporary. IE mashups probably break this
		Ext.each(assessmentItems || [], function(assessmentItem) {
			me.ids[assessmentItem.getId()] = theId;
		});
	},


	createAndCacheMeta: function(ntiid, pi, ignoreCache) {
		var assessmentItems = pi.get('AssessmentItems') || [],
				theId = pi.getId(),
				meta = ContentUtils.getLocation(theId);

		if (!meta) {
			return null;
		}

		this.attachContentRootToMeta(meta, pi);

		if (!ignoreCache) {
			this.cacheMeta(meta, theId, ntiid, assessmentItems);
		}

		return meta;
	},


	/**
	 * Load meta data for the provided ntiid.  These should be content ids here.
	 * We can get almost all the meta data we need out of the toc (which is nice for the sample content use case)
	 * however, we need one pesky piece of data off the pageInfo.  We need the contentRoot so we know where icons and content
	 * is actually rooted.  Luckily (at least right now) a book lives entirely in one place. I.E. the contentRoot of
	 * the root element is currently the same as any of its descendant's contentRoot.  We rely on this assumption
	 * to make resolving meta data for content you don't technically have access to (but have part of the book) work.
	 *
	 * We start by resolving the ntiid as a PageInfo.  If this succeeds snag meta out of the library, apply the content
	 * root, cache, and return.  If the PageInfo request 403s it may be content we can get meta info out of the library
	 * for, we just can't access the content.  So, see if we can find our ntiid in the library.  If we find it, use
	 * that meta data but resolve the root PageInfo to get the contentRoot.  Note this relies on an assmuption that entire
	 * units of content are served from the same place.  This assumption probably needs to go away but we seem dependent on it
	 * now.  Because of this assumption these results should still be cachable in memory.
	 * If resolving the PageInfo for the root fails we are SOL and have to return nothing.
	 *
	 * It is possible that we have an
	 * assessment question id (or similar) that is in a book we can get meta data for, but we don't have an explicit listing
	 * of it in the library.  We rely on some assumptions of how the question ids are generated to try and identify their
	 * containing book.  If we find one that looks good, we return the meta for the root of the book.  Note in this case
	 * we must not cache the result by the id we were initially looking up.
	 *
	 * @param {String} ntiid the ntiid we want content metadata for
	 * @param {Boolean} ignoreCache ignore cache
	 */
	loadMeta: function(ntiid, ignoreCache) {
		var me = this,
			p = PromiseFactory.make();

		function pageIdLoaded(pi) {
			var meta = me.createAndCacheMeta(ntiid, pi, ignoreCache);
			if (!meta) {
				fail.apply(me, ['createAndCacheMeta failed: ', ntiid, pi, ignoreCache]);
				return;
			}
			p.fulfill(meta);
		}

		function fail(req, resp) {
			if (resp && resp.status === 403) {
				console.log('Unauthorized when requesting page info', ntiid);
				me.handleUnauthorized(ntiid, p);
				return;
			}
			//console.error('fail', arguments);
			p.reject(resp);
		}

		Service.getPageInfo(ntiid, pageIdLoaded, fail, me);

		return p;
	},


	handleUnauthorized: function(ntiid, promise) {
		var meta = ContentUtils.getLocation(ntiid),
				bookPrefix;

		if (meta) {
			Service.getPageInfo(meta.ContentNTIID, function(pageInfo) {
				if (pageInfo.isPageInfo) {
					this.attachContentRootToMeta(meta, pageInfo);
					this.cacheMeta(meta, ntiid, ntiid);
					promise.fulfill(meta);
				} else {
					promise.reject();
				}
			}, function(req, resp) {
				promise.reject(resp);
			}, this);
		}
		else {
			console.log('Looking to see if ntiid is question', ntiid);
			bookPrefix = this.bookPrefixIfQuestion(ntiid);
			bookPrefix = bookPrefix ? this.findTitleWithPrefix(bookPrefix) : null;
			if (bookPrefix) {
				this.loadMeta(bookPrefix.get('NTIID')).then(promise);
			}
			else {
				promise.reject();
			}
		}
	},


	findTitleWithPrefix: function(prefix) {
		return Library.findTitleWithPrefix(prefix);
	},

	bookPrefixIfQuestion: function(id) {
		return ParseUtils.ntiidPrefix(id);
	}

},
function() {
	window.LocationMeta = this;
});
