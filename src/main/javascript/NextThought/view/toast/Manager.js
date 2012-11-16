Ext.define('NextThought.view.toast.Manager',{
	requires: [
		'NextThought.view.toast.Window'
	],

	PADDING: 10,

	/** @private */
	constructor: function(){
		this.callParent(arguments);
		this.stack = [];

		Ext.EventManager.onWindowResize(this.adjustStack,this,null);
	},

	/**
	 *
	 * Pop up a toast notification.
	 *
	 * ### Example: (Chat invitation)
	 *
	 *     myToastMessage = Toaster.makeToast({
	 *         title: 'Chat Invitation...',
	 *         message: 'You\'ve been invited to chat with <span>Math Buddies</span>.',
	 *         iconCls: 'chat-bubble-32',
	 *         //Buttons appear in the RTL order, so decline, here, will be the rigth-most button
	 *         buttons: [{
	 *             label: 'decline',
	 *             callback: [...],
	 *             scope: this
	 *         }, {
	 *             label: 'accept',
	 *             callback: [...],
	 *             scope: this
	 *         }],
	 *         callback: [...],
	 *         scope: this
	 *     });
	 *
	 * #### Note about callbacks:
	 *
	 * The main callback is called when the toast message is closed, eiher by acting on a button, closing it or timing
	 * out. The callback is called with the actedOn button config or false if the notification is closing without
	 * action.
	 *
	 * The individual buttons' callback's are called on the click event of that button after the main callback.
	 * You cannot stop the main callback from being called.
	 *
	 * @param {Object} bread Configuration for {@link NextThought.view.toast.Window}
	 * @returns {Object} Toast component instance
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

		return toast;
	},

	/** @private */
	measure: function(loaf){
		var padding = this.PADDING,
			sum = 0;
		Ext.each(loaf,function(o){sum+=(o.getHeight()+padding);});
		return sum;
	},

	/** @private */
	eatToast: function(toast){
		var idx = Ext.Array.indexOf(this.stack,toast);
		if(idx < 0){return;}

		this.stack.splice(idx,1);
		this.adjustStack();
	},


	adjustStack: function(){
		Ext.each(this.stack,this.popToast,this);
	},


	/** @private */
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
