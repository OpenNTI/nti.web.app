Ext.define('NextThought.cache.IdCache', {
	alias: 'IdCache',
	singleton: true,
	requires: [
		'NextThought.util.Base64'
	],


	getIdentifier: function(id)
	{
		if(!id){ return null; }
		return Base64.encode(id);
	},

	getComponentId: function (rec, subRecordField, prefix) {
		prefix = prefix || '';
		if(!rec){ return null; }

		var i = (typeof(rec) === 'string') ? rec : rec.getId();

		if (!i && subRecordField) {
			i = rec.get(subRecordField).getId();
		}

		if (!i) {
			Ext.Error.raise({
				msg:'Could not find NTIID in record',
				args: arguments
			});
		}

		return 'cmp-' + prefix + '-' + this.getIdentifier(i);
	}
},
function(){
	window.IdCache = this;
});
