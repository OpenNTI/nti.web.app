Ext.define('NextThought.util.Sharing',{
	singleton: true,



	shareWith: function(sharable, people, callback){
		var sharedTo = Ext.Array.merge( sharable.get('sharedWith')||[], people);
		return this.setSharedWith(sharable,sharedTo,callback);
	},


	setSharedWith: function(sharable, sharedTo, callback){
		var success = true;

		if ($AppConfig.server.canShare()){
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
	}




}, function(){
	window.SharingUtils = this;
});
