var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.mixins.Transition', {

	statics: {
		LIST_ADD: {
			cls: 'list-add',
			scrollIntoView: true,
			removeWhenDone: false
		},

		LIST_REMOVE: {
			cls: 'list-remove',
			removeWhenDone: true
		}
	},

	/**
	 * Get the name of the event to listen to for when the transition ends
	 *
	 * @return {String} event name
	 */
	__getTransitionEndEventName: function(el) {
		var i,
			transitions = {
				'transition': 'transitionend',
				'OTransition': 'otransitionend', // oTransitionEnd in very old Opera
				'MozTransition': 'transitionend',
				'WebkitTransition': 'webkitTransitionEnd'
			};

		if (!this.el) { return; }

		for (i in transitions) {
			if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
				return transitions[i];
			}
		}
	},

	applyTransition: function(transition) {
		if (!transition) { return; }

		this.addCls(['transition', transition.cls, 'before']);

		if (this.rendered) {
			this.__doTransition();
		} else {
			this.on('afterrender', this.__doTransition.bind(this, transition));
		}
	},


	__doTransition: function(transition) {
		var el = this.el && this.el.dom,
			eventName = this.__getTransitionEndEventName(el),
			cleanUp = this.__afterTransition.bind(this, transition);

		if (eventName) {
			el.addEventListener(eventName, function transitionEnd() {
				cleanUp();

				el.removeEventListener(eventName, transitionEnd);
			});
		} else {
			wait(5000)
				.then(cleanUp);
		}

		if (transition.scrollIntoView && el) {
			el.scrollIntoView();
		}

		this.addCls('after');
		this.removeCls('before');
	},


	__afterTransition: function(transition) {
		if (transition.removeWhenDone) {
			this.destroy();
		} else {
			this.removeCls(['transition', transition.cls, 'after']);
		}
	}
});
