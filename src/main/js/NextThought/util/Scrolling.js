Ext.define('NextThought.util.Scrolling', {

	requires: [
		'NextThought.util.AnimationFrame'
	],


	statics: {
		getPageScrollingEl: function() {
			return Ext.isIE11p || Ext.isGecko ? document.documentElement : document.body;
		},


		getPageScrollingHeight: function() {
			return this.getPageScrollingEl().scrollHeight;
		},


		getPageHeight: function() {
			return document.documentElement.clientHeight;
		},


		getPageScrolling: function() {
			if (!this.pageScrolling) {
				this.pageScrolling = this.create({
					el: this.getPageScrollingEl(),
					heightOverride: Ext.Element.getViewportHeight(),
					topOverride: 0
				});
			}

			return this.pageScrolling;
		}
	},


	constructor: function(config) {
		this.targetEl = config.el;

		this.heightOverride = config.heightOverride;
		this.topOverride = config.topOverride;

		this.scrollingVelocity = config.scrollingVelocity || 1 / 1000;//in pixels/ms

		this.edgeScrollTolerance = config.edgeScrollTolerance || 30;

		this.handlers = {
			dragover: this.__onDragOver.bind(this),
			dragleave: this.__onDragLeave.bind(this),
			dragenter: this.__onDragEnter.bind(this)
		};
	},


	__getTop: function() {
		var rect = this.targetEl && this.targetEl.getBoundingClientRect();

		return this.topOverride !== undefined ? this.topOverride : (rect && rect.top);
	},


	__getHeight: function() {
		var rect = this.targetEl && this.targetEl.getBoundingClientRect();

		return this.heightOverride !== undefined ? this.heightOverride : (rect && rect.height);
	},


	scrollWhenDragNearEdges: function() {
		if (this.targetEl && this.targetEl.addEventListener) {
			this.targetEl.addEventListener('dragover', this.handlers.dragover, true);
			this.targetEl.addEventListener('dragleave', this.handlers.dragleave, true);
		} else {
			console.error('Invalid targetEl');
		}
	},


	unscrollWhenDragNearEdges: function() {
		if (this.targetEl && this.targetEl.removeEventListener) {
			this.targetEl.removeEventListener('dragover', this.handlers.dragover, true);
			this.targetEl.removeEventListener('dragleave', this.handlers.dragleave, true);
		}

		this.endDragOverScroll();
	},


	__onDragOver: function(e) {
		this.scrollIfNearEdge(e.clientX, e.clientY);
	},


	__onDragLeave: function() {
		this.endDragOverScroll();
	},


	getScrollAnimationFn: function(direction) {
		var velocity = this.scrollingVelocity,
			targetEl = this.targetEl,
			getTop = this.__getTop.bind(this),
			getHeight = this.__getHeight.bind(this),
			lastScroll = targetEl.scrollTop;

		return function(next, diff) {
			var scrollTop = targetEl.scrollTop,
				top = getTop(),
				height = getHeight(), distance;

			//If something else has scrolled us
			// if (lastScroll !== scrollTop) { return; }

			//If we are moving up and already at the top
			if (direction < 0 && scrollTop <= 0) { return; }

			//If we are moving down and already at the bottom
			if (direction > 0 && (height + scrollTop) >= targetEl.scrollHeight) { return; }

			distance = Math.ceil(diff * velocity);

			targetEl.scrollTop = scrollTop + (direction * distance);
			lastScroll = targetEl.scrollTop;

			next();
		}
	},


	endDragOverScroll: function() {
		if (this.scrollingAnimation) {
			this.scrollingAnimation.stop();
		}

		if (this.dragScrollStartTimeout) {
			clearTimeout(this.dragScrollTimeout);
		}
	},


	scrollIfNearEdge: function(x, y) {
		var me = this,
			top = me.__getTop(),
			height = me.__getHeight(),
			tol = me.edgeScrollTolerance,
			oldScrollDirection = me.dragScrollDirection,
			newScrollDirection, animation;

		function getNewScrollAnimation(direction) {
			var animation;

			//If we have changed direction create a new animation frame
			if (oldScrollDirection !== direction) {
				animation = new NextThought.util.AnimationFrame(me.getScrollAnimationFn(direction));
			}

			return animation;
		}

		me.lastScroll = me.targetEl.scrollTop;

		if (y < top + tol) {
			animation = getNewScrollAnimation(-1);
			scrollDirection = -1;
		} else if (y > (top + height) - tol) {
			animation = getNewScrollAnimation(1);
			scrollDirection = 1;
		} else {
			scrollDirection = 0;
		}

		if (scrollDirection !== me.dragScrollDirection) {
			me.endDragOverScroll();

			if (animation) {
				me.dragScrollStartTimeout = setTimeout(animation.start.bind(animation), 500);
				me.scrollingAnimation = animation;
			}

			me.dragScrollDirection = scrollDirection;
		}

	}
});
