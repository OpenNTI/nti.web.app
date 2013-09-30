Ext.define('NextThought.model.converters.Future',{
	override: 'Ext.data.Types',
	requires: ['Ext.data.SortTypes'],

	FUTURE: {
		type: 'Future',
		sortType: 'none',
		convert: function(v){
			if(v && v.isModel){
				return v;
			}

			return {
				isFuture: true
			};
		}
	}
}, function(){
	function set(o){ o.sortType = Ext.data.SortTypes[o.sortType]; }
	set(this.FUTURE);
});