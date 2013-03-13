Ext.define('NextThought.store.ProfileItem', {
	extend: 'NextThought.store.PageItem',

	sorters: [{
		property: 'Last Modified',
		direction: 'DESC'
	}],

	groupField: null,
	groupDir: null,

	wantsItem: function(rec){
		function checkForItem(storeItem, index, count){
			if(storeItem.getId() === refId){
				result = true;
				foundParent = true;
				return false;
			}
			return true;
		}

		var refs, refId, result = false, foundParent;
		if(rec.isTopLevel()){
			return this.hasOwnProperty('profileStoreFor') && this.profileStoreFor === rec.get('Creator');
		}
		else{
			//Check if it's a non-topLevel note whose reference is in my store.
			refs = (rec.get('references') || []).slice();
			while(!foundParent && !Ext.isEmpty(refs)){
				refId = refs.shift();
				this.each(checkForItem);
			}
			return result;
		}
	}
});
