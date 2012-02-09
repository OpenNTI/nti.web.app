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
		if(!rec){ return null; }

		var i = (typeof(rec) === 'string') ? rec : rec.get('NTIID');

		if (!i && subRecordField) {
			i = rec.get(subRecordField).get('NTIID');
		}

		if (!i) {
			Ext.Error.raise({
				msg:'Could not find NTIID in record',
				args: arguments
			});
		}

		return 'cmp-' + this.getIdentifier(i);
	}
},
function(){
	window.IdCache = this;
});
