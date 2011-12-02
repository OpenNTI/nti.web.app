Ext.define('NextThought.cache.IdCache', {
    alias: 'IdCache',
    singleton: true,
    requires: [

    ],

    constructor: function() {
        Ext.apply(this,{
            _ids: {}
        });
    },

    getIdentifier: function(id)
    {
        if (!(id in this._ids))
            this._ids[id] = guidGenerator();
        return this._ids[id];
    }
},
function(){
    window.IdCache = this;
});
