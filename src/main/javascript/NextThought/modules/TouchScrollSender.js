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
			velY, velX;

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

//			e.preventDefault();

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
			velY = 0;
			velX = 0;

		}, false);


		dom.addEventListener('touchmove', function (e) {
//			e.preventDefault();

			var touch = e.touches[0];

			function scrollMove() {
				velY = lastY - touch.pageY;
				velX = lastX - touch.pageX;
				updatePos();
				container.fireEvent('touchScroll', pickedElement, velY, velX);
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
					state = s.STATE.SCROLLING;
				}
			}
			else if (state === s.STATE.SCROLLING) {
				scrollMove();
			}

		}, false);

		dom.addEventListener('touchend', function (e) {
//			e.preventDefault();

			function kineticScroll() {
				var lt0 = velY < 0,
					lt1 = velX < 0,
					currentTime = Date.now(),
					deltaTime = currentTime - lastUpdateTime,
					aboveThresholdX, aboveThresholdY,
					sameDirectionX, sameDirectionY;
				lastUpdateTime = currentTime;

				// Continue scrolling if above the movement threshold
				// and hasn't changed directions
				aboveThresholdY = (lt0 ? -velY : velY) > s.SCROLL_THRESHOLD_SPEED;
				sameDirectionY = startLt0 === lt0;
				aboveThresholdX = (lt1 ? -velX : velX) > s.SCROLL_THRESHOLD_SPEED;
				sameDirectionX = startLt1 === lt1;

				if (aboveThresholdY && sameDirectionY && state === s.STATE.NONE) {
					// Apply friction in the opposite movement direction
					// based on the time passed for smoother movement
					velY += (lt0 ? s.SCROLL_FRICTION : -s.SCROLL_FRICTION) * deltaTime;
				}

				if (aboveThresholdX && sameDirectionX && state === s.STATE.NONE) {
					// Apply friction in the opposite movement direction
					// based on the time passed for smoother movement
					velX += (lt1 ? s.SCROLL_FRICTION : -s.SCROLL_FRICTION) * deltaTime;
				}

				if ((aboveThresholdY && sameDirectionY) || (aboveThresholdX && sameDirectionX)
					&& state === s.STATE.NONE) {
					container.fireEvent('touchScroll', pickedElement, velY, velX);
					setTimeout(kineticScroll, s.SCROLL_TIME_STEP);
				}
			}

			var startLt0 = velY < 0,
				startLt1 = velX < 0,
				lastUpdateTime = Date.now(),
				tempState = state;
			state = s.STATE.NONE;

			if (tempState === s.STATE.SCROLLING) {
				// Cap the ending velocity at the max speed
				if (Math.abs(velY) > s.SCROLL_MAX_SPEED) {
					velY = startLt0 ? -s.SCROLL_MAX_SPEED : s.SCROLL_MAX_SPEED;
				}
				if (Math.abs(velX) > s.SCROLL_MAX_SPEED) {
					velX = startLt1 ? -s.SCROLL_MAX_SPEED : s.SCROLL_MAX_SPEED;
				}
				kineticScroll();
			}

		}); // eo touchEnd

	} // eo setupTouchHandlers
});
