Ext.define('NextThought.util.Sharing',{
	singleton: true,



	shareWith: function(sharable, people, callback){
		var sharedTo = Ext.Array.merge( sharable.get('sharedWith')||[], people);
		return this.setSharedWith(sharable,sharedTo,callback);
	},


	setSharedWith: function(sharable, sharedTo, callback){
		var success = true;
		sharable.set('sharedWith', sharedTo);
		sharable.save({
			async:!!callback,
			callback: function(record, operation){
				success = operation.success;//if we're synchronous
				if(callback){
					Globals.callback(callback,null,arguments);
				}
			}
		});

		return success;
	}




}, function(){
	window.SharingUtils = this;
});
