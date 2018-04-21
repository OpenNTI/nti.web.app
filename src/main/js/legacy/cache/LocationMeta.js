const Ext = require('@nti/extjs');

const ContentUtils = require('legacy/util/Content');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));


module.exports = exports = Ext.define('NextThought.cache.LocationMeta', {

	mixins: {
		observable: 'Ext.util.Observable'
	},

	meta: {},
	ids: {},


	getValue: function (id) {
		return this.meta[this.ids[id]];
	},


	getMeta: function (ntiid, callback, scope) {
		var maybe = this.getValue(ntiid), p,
			cb = callback || Ext.emptyFn;

		if (!ntiid) {
			return Promise.reject('No ntiid passed');
		}

		if (maybe || !ntiid) {
			p = Promise.resolve(maybe);
		} else {
			p = this.loadMeta(ntiid);
		}

		p.then(Ext.bind(cb, scope), Ext.bind(cb, scope, []));

		return p;
	},


	attachContentRootToMeta: function (meta, pi) {
		function buildPath (s, root) {
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


	cacheMeta: function (meta, theId, ntiid, assessmentItems) {
		var me = this;
		this.meta[theId] = meta;
		this.ids[ntiid] = theId;

		//Also yank out any assessment items and cache them by id.	Note
		//right now this only works because there is a one-to-one question to
		//PageInfo mapping.	 If I recall that is happening on the server now also
		//but is probably temporary. IE mashups probably break this
		Ext.each(assessmentItems || [], function (assessmentItem) {
			me.ids[assessmentItem.getId()] = theId;
		});
	},


	createAndCacheMeta: function (ntiid, pi, ignoreCache) {
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


	/*
	 * Load meta data for the provided ntiid.  These should be content ids here.
	 * We can get almost all the meta data we need out of the toc (which is nice for the sample content use case)
	 * however, we need one pesky piece of data off the pageInfo.  We need the contentRoot so we know where icons and content
	 * is actually rooted.	Luckily (at least right now) a book lives entirely in one place. I.E. the contentRoot of
	 * the root element is currently the same as any of its descendant's contentRoot.  We rely on this assumption
	 * to make resolving meta data for content you don't technically have access to (but have part of the book) work.
	 *
	 * We start by resolving the ntiid as a PageInfo.  If this succeeds snag meta out of the library, apply the content
	 * root, cache, and return.	 If the PageInfo request 403s it may be content we can get meta info out of the library
	 * for, we just can't access the content.  So, see if we can find our ntiid in the library.	 If we find it, use
	 * that meta data but resolve the root PageInfo to get the contentRoot.	 Note this relies on an assmuption that entire
	 * units of content are served from the same place.	 This assumption probably needs to go away but we seem dependent on it
	 * now.	 Because of this assumption these results should still be cachable in memory.
	 * If resolving the PageInfo for the root fails we are SOL and have to return nothing.
	 *
	 * It is possible that we have an
	 * assessment question id (or similar) that is in a book we can get meta data for, but we don't have an explicit listing
	 * of it in the library.  We rely on some assumptions of how the question ids are generated to try and identify their
	 * containing book.	 If we find one that looks good, we return the meta for the root of the book.  Note in this case
	 * we must not cache the result by the id we were initially looking up.
	 *
	 * @param {String} ntiid the ntiid we want content metadata for
	 * @param {Boolean} ignoreCache ignore cache
	 */
	loadMeta: function (ntiid, ignoreCache) {
		var me = this;

		// me.listenToLibrary();

		return Service.getPageInfo(ntiid)
			.then(function (info) {
				return Promise.resolve(info)
					.then(function (pi) {
						var meta = me.createAndCacheMeta(ntiid, pi, ignoreCache);
						return meta || Promise.reject(['createAndCacheMeta failed: ', ntiid, pi, ignoreCache]);
					})
					.then(function (infos) {
						return Ext.isArray(infos) ? infos[0] : infos;
					});
			})
			.catch(function (reason) {
				if (reason && reason.status === 403) {
					console.log('Unauthorized when requesting page info', ntiid);
					return me.handleUnauthorized(ntiid, reason);
				}
				return Promise.reject(reason);
			});
	},


	listenToLibrary: function () {
		//It doesn't look like this is being called
		console.error('listenToLibrary doesn\'t look like its being called, don`t call it');
		// var me = this;

		// if (me.libraryMon) {
		// 	return;
		// }

		// me.libraryMon = me.mon(Library, {
		// 	'destroyable': true,
		// 	'loaded': 'clearCache'
		// });
	},


	clearCache: function () {
		this.meta = {};
		this.ids = {};
	},


	handleUnauthorized: function (ntiid, reason) {
		var me = this,
			meta = ContentUtils.getLocation(ntiid),
			bookPrefix;

		if (meta) {
			return Service.getPageInfo(meta.ContentNTIID)
				.then(function (pageInfo) {
					if (pageInfo.isPageInfo) {
						me.attachContentRootToMeta(meta, pageInfo);
						me.cacheMeta(meta, ntiid, ntiid);
						return meta;
					}
					return Promise.reject('No Meta');
				});
		}

		bookPrefix = me.bookPrefixIfQuestion(ntiid);
		bookPrefix = bookPrefix ? me.findTitleWithPrefix(bookPrefix) : null;

		return bookPrefix ? me.loadMeta(bookPrefix.get('NTIID')) : Promise.reject(reason || 'No Content');
	},


	findTitleWithPrefix: function (prefix) {
		//It doesn`t look like this is getting called.
		console.error('findTitleWithPrefix doesn`t look like its getting called, don`t call it.');
		return null;
		// return Library.findTitleWithPrefix(prefix);
	},

	bookPrefixIfQuestion: function (id) {
		return lazy.ParseUtils.ntiidPrefix(id);
	}

}).create();
