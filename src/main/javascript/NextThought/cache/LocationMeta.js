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
        if (maybe || !ntiid){return Ext.callback(callback, scope, [maybe]);}

        this.loadMeta(ntiid, function(){
            return  Ext.callback(callback, scope, [this.getValue(ntiid)]);
        })
    },


    loadMeta: function(ntiid, cb) {
        function pageIdLoaded(pi){
            var loc = LocationProvider.getLocation(pi.getId());
            this.meta[pi.getId()] = loc;
            this.ids[ntiid] = pi.getId();
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
