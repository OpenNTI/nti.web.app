Ext.define('NextThought.util.ParseUtils',{
    alternateClassName: 'ParseUtils',
    requires: [
        //NextThought.model.* <- Models should be listed in controller's "models" block.
    ],
    statics:{

        parseItems: function(items){
            return this.flattenBins(this.binAndParseItems(items));
        },

        getReaderForModel: function(modelClass) {
            this._readers = this._readers || [];

            if (!NextThought.model.hasOwnProperty(modelClass)){
                console.error('no model for NextThought.model.' + modelClass);
                return;
            }

            if (!this._readers[modelClass]) {
                this._readers[modelClass] = Ext.create('NextThought.proxy.reader.Json',{
                    model: 'NextThought.model.'+modelClass, proxy: 'nti'
                });
            }

            return this._readers[modelClass];

        },


        iterateAndCollect: function(json) {
            var bins = {},
                me = this;

            if (Ext.isArray(json)) {
                Ext.each(json, function(o, key){
                        collect(o, key);
                    },
                    me);
            }
            else {
                for (var key in json) {
                    if (!json.hasOwnProperty(key)) continue;
                    collect(json[key], key);
                }
            }

            me.binAndParseItems([], bins);
            return bins;

            function collect(o, key) {
                if (/FriendsLists/i.test(key) || typeof(o) != 'object') return;
                me.binItems(o, bins)
            }
        },


        binItems: function(items, existingBins, applySuppl){
            var bins = existingBins || {};
            if (Ext.isArray(items)) {
                Ext.each(items, function(o){
                        addToBin(o);
                    },
                    this);
            }
            else {
                for (var key in items) {
                    if (!items.hasOwnProperty(key)) continue;
                    addToBin(items[key]);
                }
            }
            return bins;


            function addToBin(o) {
                if(!o || !o.Class) return;
                if(!bins[o.Class]){
                    bins[o.Class] = [];
                }

                if(applySuppl){
                    o = Ext.applyIf(o, applySuppl);
                }

                bins[o.Class].push(o);
            }
        },


        binAndParseItems: function(items, existingBins, applySuppl){
            var bins = this.binItems(items, existingBins, applySuppl), key;
            for(key in bins){
                if(!bins.hasOwnProperty(key)) continue;

                var reader = this.getReaderForModel(key);
                if(!reader) {
                    console.error('No reader for key', key, 'objects: ', bins[key]);
                    continue;
                }

                try{
                    bins[key] = reader.read(bins[key]).records;
                }
                catch(e){
                    if(/user/i.test(key))
                        bins[key] = UserRepository.getUser(bins[key].Username);
                    else
                        throw e;
                }

            }
            return bins;
        },


        flattenBins: function(bins){
            var result = [], key;
            for(key in bins){
                if(!bins.hasOwnProperty(key)) continue;
                result = result.concat(bins[key]);
            }
            return result;
        }
    }
},
		function(){
			window.ParseUtils = this;
		}
);
