Ext.define('NextThought.mixins.ShareEntity',{

	isDynamicSharing: function(){
		return NextThought.mixins.ShareEntity.isDynamicSharing(this.data);
	},

	getPresentationType: function(){
		return NextThought.mixins.ShareEntity.getPresentationType(this.data);
	},

	statics: {
		isDynamicSharing: function(data){
			return Boolean(data['IsDynamicSharing']);
		},

		getPresentationType: function(data){
			return this.isDynamicSharing(data) ? 'group' : 'list';
		}
	}
});