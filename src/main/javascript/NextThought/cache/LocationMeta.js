Ext.define('NextThought.cache.LocationMeta', {
    alias: 'LocationMeta',
    singleton: true,
    requires: [
        'NextThought.providers.Location'
    ],

    meta: {},
    ids: {},


    getValue: function(id){
        return this.meta[this.ids[id]];
    },


    getMeta: function(ntiid, callback, scope){
        var maybe = this.getValue(ntiid);
        if (maybe || !ntiid){
			Ext.callback(callback, scope, [maybe]);
			return;
		}

        this.loadMeta(ntiid, function(meta){
            return  Ext.callback(callback, scope, [meta]);
        });
    },


	attachContentRootToMeta: function(meta, pi){
		function buildPath(s, root){
			var p = s.split('/'); p.splice(-1,1,'');
			p = p.join('/');
			//trim off the root if its present
			return p.replace(new RegExp(RegExp.escape(root)+'$'),'');
		}

		meta.baseURI = buildPath(pi.getLink('content'),meta.root);
		meta.absoluteContentRoot = meta.baseURI + meta.root;

		return meta;
	},


	cacheMeta: function(meta, theId, ntiid, assessmentItems){
		this.meta[theId] = meta;
		this.ids[ntiid] = theId;

		//Also yank out any assessment items and cache them by id.  Note
		//right now this only works because there is a one-to-one question to
		//PageInfo mapping.  If I recall that is happening on the server now also
		//but is probably temporary. IE mashups probably break this
		Ext.each(assessmentItems||[], function(assessmentItem){
			me.ids[assessmentItem.getId()] = theId;
		});
	},


	createAndCacheMeta: function(ntiid, pi, ignoreCache){
		var assessmentItems = pi.get('AssessmentItems') || [],
			theId = pi.getId(),
			meta = LocationProvider.getLocation(theId),
			me = this;

		if(!meta){
			return null;
		}

		this.attachContentRootToMeta(meta, pi);

		if(!ignoreCache){
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
	 * @param ntiid the ntiid we want content metadata for
	 * @param cb completion callback.  If meta can be determined it will be the first arg
	 */
    loadMeta: function(ntiid, cb, ignoreCache) {
		var me = this;

        function pageIdLoaded(pi){
			var meta = this.createAndCacheMeta(ntiid, pi, ignoreCache);
			if(!meta){
				fail.call(this);
			}
            Ext.callback(cb, this, [meta]);
        }

        function fail(req, resp){
			if(resp && resp.status === 403){
				console.log('Unauthorized when requesting page info', ntiid);
				this.handleUnauthorized(ntiid, cb);
			}
			else{
            	console.error('fail', arguments);
            	Ext.callback(cb, this);
			}
        }
        $AppConfig.service.getPageInfo(ntiid, pageIdLoaded, fail, this);
    },


	handleUnauthorized: function(ntiid, cb){
		var meta = LocationProvider.getLocation(ntiid),
			bookPrefix;

		if(meta){
			$AppConfig.service.getPageInfo(meta.ContentNTIID, function(pageInfo){
				if(pageInfo.isPageInfo){
					this.attachContentRootToMeta(meta, pageInfo);
					this.cacheMeta(meta, ntiid, ntiid);
					Ext.callback(cb, this, [meta]);
				}
				else{
					Ext.callback(cb, this);
				}
			}, function(req, resp){
				Ext.callback(cb, this);
			}, this);
		}
		else{
			console.log('Looking to see if ntiid is question', ntiid);
			bookPrefix = this.bookPrefixIfQuestion(ntiid);
			bookPrefix = bookPrefix ? this.findTitleWithPrefix(bookPrefix) : null;
			if(bookPrefix){
				this.loadMeta(bookPrefix.get('NTIID'), cb);
			}
			else{
				Ext.callback(cb, this);
			}
		}
	},


	findTitleWithPrefix: function(prefix){
		var result = null;
		Library.each(function(e){
			if(e.get('NTIID').indexOf(prefix) === 0){
				result = e;
			}
			return !result;
		});

		return result;
	},


	bookPrefixIfQuestion: function(id){
		var ntiid = ParseUtils.parseNtiid(id);
		if(!ntiid || ntiid.specific.type !== 'NAQ'){
			return null;
		}

		ntiid.specific.type = 'HTML';
		ntiid.specific.typeSpecific = ntiid.specific.typeSpecific.split('.').first();

		return ntiid.toString();
	}

},
function(){
    window.LocationMeta = this;
});
