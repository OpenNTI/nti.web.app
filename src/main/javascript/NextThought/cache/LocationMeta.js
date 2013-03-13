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

        this.loadMeta(ntiid, function(){
            return  Ext.callback(callback, scope, [this.getValue(ntiid)]);
        });
    },


    loadMeta: function(ntiid, cb) {
		var me = this;

	    function buildPath(s, root){
            var p = s.split('/'); p.splice(-1,1,'');
		    p = p.join('/');
			//trim off the root if its present
		    return p.replace(new RegExp(RegExp.escape(root)+'$'),'');
        }

        function pageIdLoaded(pi){
			var assessmentItems = pi.get('AssessmentItems') || [],
				theId = pi.getId(),
				meta = LocationProvider.getLocation(theId);

			if(!meta){
				fail.call(this);
				return;
			}

            this.meta[theId] = meta;
            this.ids[ntiid] = theId;

	        meta.baseURI = buildPath(pi.getLink('content'),meta.root);
			meta.absoluteContentRoot = meta.baseURI + meta.root;

			//Also yank out any assessment items and cache them by id.  Note
			//right now this only works because there is a one-to-one question to
			//PageInfo mapping.  If I recall that is happening on the server now also
			//but is probably temporary. IE mashups probably break this
			Ext.each(assessmentItems, function(assessmentItem){
				me.ids[assessmentItem.getId()] = theId;
			});

            Ext.callback(cb, this);
        }

        function fail(){
            console.error('fail', arguments);
            Ext.callback(cb, this);
        }
        $AppConfig.service.getPageInfo(ntiid, pageIdLoaded, fail, this);
    }

},
function(){
    window.LocationMeta = this;
});
