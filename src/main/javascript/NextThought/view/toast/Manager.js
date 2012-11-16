Ext.define('NextThought.view.toast.Manager',{
	requires: [
		'NextThought.view.toast.Window'
	],

	/**
	 *
	 * @param bread - TODO: write this doc :P
	 */
	makeToast: function(bread){
		var size = Ext.dom.Element.getViewSize(),
			toast;

		toast = Ext.widget('toast',bread);

		toast.setPosition(size.width-(toast.width+10), size.height);
		toast.on('afterRender',this.popToast,this, {single:true, screenSize: size});
		toast.show();
	},

	popToast: function(toast,eOps){
		toast.animate({
			to:{
				top: eOps.screenSize.height - (toast.getHeight()+ 10)
			},
			duration: 400
		});
	}

}, function(){
	window.Toaster = new this();
});
