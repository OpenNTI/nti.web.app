Ext.define('NextThought.view.toast.Manager',{
	requires: [
		'NextThought.view.toast.Window'
	],

	makeToast: function(bread){

			//Icon,
			//Title,
			//Message,
			//Buttons (array)
			//  { label, iconCls, cls, callback, scope }

		var toast = Ext.widget('toast',bread);
	}


}, function(){
	window.Toaster = new this();
});
