Ext.define('NextThought.modules.TouchScrollSender', {

	alias: 'modules.touchScrollSender',

	statics: {
		SCROLL_TIME_STEP: 1,
		SCROLL_FRICTION: 0.05,
		SCROLL_MAX_SPEED: 200,
		SCROLL_THRESHOLD_SPEED: 1,
		/**
		 * Pixel distance a touch can move to still be considered a tap
		 */
		TAP_THRESHOLD: 15,
		/**
		 * Time required for a long press
		 */
		TAP_HOLD_TIME: 1000,
		/**
		 * Various states for a fsm to determine possible
		 * touch interactions.
		 */
		STATE: {
			NONE: 0,
			DOWN: 1,
			LONGPRESS: 2,
			SCROLLING: 3,
			SELECTING: 4,
			DRAGGING: 5
		}
	},

	/**
	 * Fires various useful ExtJS events based on touch interactions for the attached container
	 * if the current platform is an iPad. This should be complemented by a TouchHandler that
	 * does the actual actions based on the events depending on the component.
	 * @note The callbacks in some fired events should only be called once (even if multiple
	 *       handlers listen to it)
	 * @note Built on a fsm that changes state based on the touch events and current state.
	 * @param config
	 */
	constructor: function (config) {
		// Only support touch on iPad devices
		if (!Ext.is.iPad) {
			return;
		}

		Ext.apply(this, config);

		this.container.on('afterrender', function () {
			this.setupTouchHandlers();
		}, this);
	},

	/**
	 * Setup the handlers for the various touch events for
	 * click and scroll
	 */
	setupTouchHandlers: function () {
		var me = this,
			s = me.statics(),
			container = me.container,
			dom = container.getEl().dom,
			state = s.STATE.NONE,

			pickedElement = null,
			initialTime,
			initialX, initialY,
			lastX, lastY,
		//current movement delta
			vel;

		/**
		 * Only count touches within the set threshold. Otherwise,
		 * it moves to another state (scroll,select,drag)
		 * @returns {boolean}
		 */
		function withinTapThreshold() {
			return Math.abs(lastY - initialY) < s.TAP_THRESHOLD;
		}

		dom.addEventListener('touchstart', function (e) {

			// If click outside chatdock, close chatdock
			var aboveDock = container.el.down('#chat-dock'),
				dock = container.el.dom.getAttribute('id'),
				belowDock = container.el.up('#chat-dock'),
				cPopout, updock, ele, touch, dockEl, eles, i;

			e.preventDefault();

			// If touching something besides sidebar, close it
			if (dom.getAttribute('id').indexOf("main-sidebar") === -1) {
				ele = Ext.get(Ext.query('.sidebar')[0]);
				if (ele) {
					Ext.ComponentManager.get(ele.getAttribute('id')).startHide();
				}
				updock = Ext.get('chat-dock_header_hd');
			}


			if (aboveDock === null && dock !== 'chat-dock' && belowDock === null) {
				dockEl = Ext.ComponentManager.get('chat-dock');
				if (dockEl.el.dom.getAttribute('class').indexOf("open") !== -1) {
					dockEl.floatCollapsedPanel();
				}
			}

			// If touching something besides contact popout, close popout
			cPopout = Ext.query('.contact-popout')[0];
			if (cPopout) {
				Ext.destroy(Ext.getCmp(cPopout.getAttribute('id')));
			}

			// If touching something besides search, close search
			if (dom.getAttribute('id').indexOf('search-menu') === -1
				&& !e.target.classList.contains('search')) {
				ele = Ext.get(Ext.query('.search-menu')[0]);
				if (ele) {
					Ext.ComponentManager.get(ele.getAttribute('id')).hide();
				}
			}

			// If touching something besides a jump-menu, close the jump-menu
			if (dom.getAttribute('id').indexOf('jump-menu') === -1
				&& dom.getAttribute('id').className !== 'part') {
				eles = Ext.query('.jump-menu');
				if (eles) {
					for (i = 0; i < eles.length; i++) {
						ele = Ext.get(eles[i]);
						if (ele) {
							Ext.ComponentManager.get(ele.getAttribute('id')).startHide();
						}
					}
				}
			}

			touch = e.touches[0];

			container.fireEvent('touchStart', touch.pageX, touch.pageY);

			// Only start a new touch if all touches are off
			if (state !== s.STATE.NONE) {
				return;
			}

			state = s.STATE.DOWN;

			initialTime = Date.now();
			initialY = touch.pageY;
			initialX = touch.pageX;
			lastY = initialY;
			vel = 0;

		}, false);


		dom.addEventListener('touchmove', function (e) {
			e.preventDefault();

			var touch = e.touches[0];

			function scrollMove() {
				vel = lastY - touch.pageY;
				updatePos();
				container.fireEvent('touchScroll', pickedElement, vel);
			}

			function updatePos() {
				lastY = touch.pageY;
				lastX = touch.pageX;
			}

			if (state === s.STATE.DOWN) {
				scrollMove();
				if (!withinTapThreshold()) {
					container.fireEvent('touchElementIsScrollable', pickedElement, function (isScrollable) {
						if (isScrollable) {
							state = s.STATE.SCROLLING;
						}
					});
				}
			}
			else if (state === s.STATE.SCROLLING) {
				scrollMove();
			}

		}, false);

		dom.addEventListener('touchend', function (e) {
			e.preventDefault();
			var startLt0 = vel < 0,
				lastUpdateTime = Date.now(),
				tempState = state;

			function kineticScroll() {
				var lt0 = vel < 0,
					currentTime = Date.now(),
					deltaTime = currentTime - lastUpdateTime,
					aboveThreshold, sameDirection;
				lastUpdateTime = currentTime;

				// Continue scrolling if above the movement threshold
				// and hasn't changed directions
				aboveThreshold = (lt0 ? -vel : vel) > s.SCROLL_THRESHOLD_SPEED;
				sameDirection = startLt0 === lt0;

				if (aboveThreshold && sameDirection && state === s.STATE.NONE) {
					// Apply friction in the opposite movement direction
					// based on the time passed for smoother movement
					vel += (lt0 ? s.SCROLL_FRICTION : -s.SCROLL_FRICTION) * deltaTime;

					container.fireEvent('touchScroll', pickedElement, vel);
					setTimeout(kineticScroll, s.SCROLL_TIME_STEP);
				}
			}

			state = s.STATE.NONE;

			if (tempState === s.STATE.SCROLLING) {
				// Cap the ending velocity at the max speed
				if (Math.abs(vel) > s.SCROLL_MAX_SPEED) {
					vel = startLt0 ? -s.SCROLL_MAX_SPEED : s.SCROLL_MAX_SPEED;
				}
				kineticScroll();
			}

		}); // eo touchEnd

	} // eo setupTouchHandlers
});
