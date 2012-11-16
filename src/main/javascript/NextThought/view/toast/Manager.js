Ext.define('NextThought.view.toast.Manager',{
	requires: [
		'NextThought.view.toast.Window'
	],

	PADDING: 10,

	constructor: function(){
		this.callParent(arguments);
		this.stack = [];
	},

	/**
	 *
	 * @param bread - TODO: write this doc :P
	 */
	makeToast: function(bread){
		var size = Ext.dom.Element.getViewSize(),
			toast;

		toast = Ext.widget('toast',bread);
		this.stack.push(toast);

		toast.setPosition(size.width-(toast.width+10), size.height);
		toast.on('afterRender',this.popToast,this, {single:true});
		toast.on('destroy',this.eatToast,this);
		toast.show();
	},


	measure: function(loaf){
		var padding = this.PADDING,
			sum = 0;
		Ext.each(loaf,function(o){sum+=(o.getHeight()+padding);});
		return sum;
	},


	eatToast: function(toast){
		var idx = Ext.Array.indexOf(this.stack,toast);
		if(idx < 0){return;}

		this.stack.splice(idx,1);
		Ext.each(this.stack,this.popToast,this);
	},


	popToast: function(toast){

		var top = Ext.dom.Element.getViewSize().height,
			idx;
		if(this.stack.length > 0){
			idx = Ext.Array.indexOf(this.stack,toast);
			top -= this.measure(this.stack.slice(0,idx));
		}

		top = Math.max(top - (toast.getHeight()+ this.PADDING), 0);

		toast.animate({
			duration: 400,
			to:{ top: top }
		});
	}

}, function(){
	window.Toaster = new this();
});
