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
		if (id && !this._ids.hasOwnProperty(id)) {
			this._ids[id] = guidGenerator();
		}
		return this._ids[id];
	},

	getComponentId: function (rec, subRecordField) {
		var i = (typeof(rec) === 'string') ? rec : rec.get('OID');

		if (!i && subRecordField) {
			i = rec.get(subRecordField).get('OID');
		}

		if (!i) {
			Ext.Error.raise({
				msg:'Could not find OID in record',
				args: arguments
			});
		}

		return 'cmp-' + this.getIdentifier(i);
	}
},
function(){
	window.IdCache = this;
});
