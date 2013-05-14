Ext.define('NextThought.util.Sharing',{
	singleton: true,



	shareWith: function(sharable, people, callback){
		var sharedTo = Ext.Array.merge( sharable.get('sharedWith')||[], people);
		return this.setSharedWith(sharable,sharedTo,callback);
	},


	setSharedWith: function(sharable, sharedTo, callback){
		var success = true;

		if ($AppConfig.service.canShare()){
			sharable.set('sharedWith', sharedTo);
		}
		sharable.save({
			async:!!callback,
			callback: function(record, operation){
				success = operation.success;//if we're synchronous
				if(callback){
					Ext.callback(callback,null,arguments);
				}
			}
		});

		return success;
	},


	resolveValue: function(value){
		var p, result = null;

		// If value is set and is not an array, then try to resolve it first, if not,
		// Pull it from location's preferences.
		if (!Ext.isArray(value)){
			p = value || LocationProvider.getPreferences();
			//we may not have preferences.
			p = p ? p.sharing : null;
			//we may not have sharing preferences, guard from error.
			result = p ? p.sharedWith : null;
		}

		//if there are no results yet, fall back to the given value (it may be blank as well)
		result = result || value;

		//if we don't have anything, just return an empty list.
		if (!Ext.isArray(result)){return [];}



		//clone the result to make sure we don't mess anything up when modifiying the list.
		result = result.slice();

		Ext.each(result,function(r,i,a){
			if(ParseUtils.parseNtiid(r)){
				a[i] = UserRepository.getStore().findRecord('NTIID',r,0,false,true,true) || r; //HACK!!
				if(!Ext.isString(a[i])){
					a[i] = a[i].get('Username');
				}
			}
		});


		return result;
	}




}, function(){
	window.SharingUtils = this;
});
