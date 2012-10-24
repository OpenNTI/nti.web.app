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
        function pageIdLoaded(pi){
			var me = this;
			var assessmentItems = pi.get('AssessmentItems') || [],
				meta = LocationProvider.getLocation(pi.getId()),
				theId = pi.getId();

            this.meta[pi.getId()] = meta;
            this.ids[ntiid] = theId;

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
