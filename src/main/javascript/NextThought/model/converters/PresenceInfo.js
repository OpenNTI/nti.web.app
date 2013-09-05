Ext.define('NextThought.model.converters.PresenceInfo',{
	override: 'Ext.data.Types',
	requires: ['Ext.data.SortTypes'],

	PRESENCEINFO: {
		type: 'PresenceInfo',
		sortType: 'none',
		convert: function(v,record){
			
			if(!v.isPresenceInfo){
				return NextThought.model.PresenceInfo.createPresenceInfo(record.get('username'),'unavailable');
			}

			return v;
		}
	}

}, function(){
	function set(o){ o.sortType = Ext.data.SortTypes[o.sortType]; }
	set(this.PRESENCEINFO);
});