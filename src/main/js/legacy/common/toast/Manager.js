var Ext = require('extjs');
require('./Window');


module.exports = exports = Ext.define('NextThought.common.toast.Manager', {

	PADDING: 10,

	/** @private */
	constructor: function() {
		this.callParent(arguments);
		this.stack = [];

		Ext.EventManager.onWindowResize(this.adjustStack, this, null);
	},

	/**
	 *
	 * Pop up a toast notification.
	 *
	 * ### Example: (Chat invitation)
	 *
	 *	   myToastMessage = Toaster.makeToast({
	 *		   title: 'Chat Invitation...',
	 *		   message: 'You\'ve been invited to chat with <span>Math Buddies</span>.',
	 *		   iconCls: 'icons-chat-32',
	 *		   timeout: 60,
	 *		   //Buttons appear in the RTL order, so decline, here, will be the rigth-most button
	 *		   buttons: [{
	 *			   label: 'decline',
	 *			   callback: [...],
	 *			   scope: this
	 *		   }, {
	 *			   label: 'accept',
	 *			   callback: [...],
	 *			   scope: this
	 *		   }],
	 *		   callback: [...],
	 *		   scope: this
	 *	   });
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
	 * @return {Object} Toast component instance
	 */
	makeToast: function(bread) {
		var size = Ext.dom.Element.getViewSize(),
			toast,
			timeout = bread.timeout || false;

		toast = Ext.widget('toast', bread);
		this.stack.push(toast);

		toast.setPosition(size.width - (toast.width + 10), size.height);
		toast.on('afterRender', this.popToast, this, {single: true});
		toast.on('destroy', this.eatToast, this);
		toast.show();

		if (timeout && timeout > 0) {
			toast.timeoutId = Ext.defer(toast.close, timeout, toast);
		}

		return toast;
	},

	/** @private */
	measure: function(loaf) {
		var padding = this.PADDING,
			sum = 0;
		Ext.each(loaf, function(o) {sum += (o.getHeight() + padding);});
		return sum;
	},

	/** @private */
	eatToast: function(toast) {
		if (toast.hasOwnProperty('timeoutId')) {
			clearTimeout(toast.timeoutId);
		}

		var idx = Ext.Array.indexOf(this.stack, toast);
		if (idx < 0) {return;}

		this.stack.splice(idx, 1);
		this.adjustStack();
	},


	adjustStack: function() {
		Ext.each(this.stack, this.popToast, this);
	},


	/** @private */
	popToast: function(toast) {

		var vp = Ext.dom.Element.getViewSize(),
			left = vp.width - (toast.width + 10),
			top = vp.height,
			idx;
		if (this.stack.length > 0) {
			idx = Ext.Array.indexOf(this.stack, toast);
			top -= this.measure(this.stack.slice(0, idx));
		}

		top = Math.max(top - (toast.getHeight() + this.PADDING), 0);

		toast.animate({
			duration: 400,
			to: { top: top, left: left }
		});
	}

}).create();
