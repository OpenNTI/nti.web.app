const Ext = require('extjs');
const AnimationFrame = require('./AnimationFrame');


module.exports = exports = Ext.define('NextThought.util.Scrolling', {
	statics: {
		getPageScrollingEl () {
			return Ext.isIE11p || Ext.isGecko ? document.documentElement : document.body;
		},


		getPageScrollingHeight () {
			return this.getPageScrollingEl().scrollHeight;
		},


		getPageHeight () {
			return document.documentElement.clientHeight;
		},


		getPageScrolling () {
			if (!this.pageScrolling) {
				this.pageScrolling = this.create({
					el: this.getPageScrollingEl(),
					heightOverride: Ext.Element.getViewportHeight(),
					topOverride: 0
				});
			}

			return this.pageScrolling;
		},


		scrollCompletelyIntoView (node, container, padding = 0, duration = 500) {
			container = container || this.getPageScrollingEl();

			const nodeRect = node.getBoundingClientRect();
			const containerRect = container.getBoundingClientRect();
			const originalScrollTop = container.scrollTop;
			let scrollTop;

			//If the node is taller than the container just scroll to its top
			if (nodeRect.height > container.height) {
				scrollTop = nodeRect.top - padding;
			} else if (nodeRect.top - containerRect.top < 0) {
				scrollTop = nodeRect.top - padding;
			} else if (nodeRect.bottom > containerRect.bottom) {
				scrollTop = originalScrollTop + (nodeRect.bottom - containerRect.bottom - padding);
			} else {
				scrollTop = originalScrollTop;
			}

			if (scrollTop === originalScrollTop) { return; }

			scrollTop = Math.max(scrollTop, 0);

			const direction = scrollTop > originalScrollTop ? 1 : -1;
			const scrollDiff = direction * (scrollTop - originalScrollTop);

			const animation = new AnimationFrame ((next, diff) => {
				const scrollDelta = scrollDiff * (diff / duration);
				const currentScrollTop = container.scrollTop;
				const newScrollTop = currentScrollTop + (direction * scrollDelta);

				container.scrollTop = newScrollTop;

				if ((direction < 0 && newScrollTop > scrollTop) || (direction > 0 && newScrollTop < scrollTop)) { next(); }
			});

			animation.start();
		}
	},

	constructor (config) {
		this.targetEl = config.el;

		this.heightOverride = config.heightOverride;
		this.topOverride = config.topOverride;

		this.scrollingVelocity = config.scrollingVelocity || 1 / 1000;//in pixels/ms

		this.edgeScrollTolerance = config.edgeScrollTolerance || 30;

		this.handlers = {
			dragover: this.__onDragOver.bind(this),
			dragleave: this.__onDragLeave.bind(this)
		};
	},

	__getTop () {
		const rect = this.targetEl && this.targetEl.getBoundingClientRect();

		return this.topOverride !== undefined ? this.topOverride : (rect && rect.top);
	},

	__getHeight () {
		const rect = this.targetEl && this.targetEl.getBoundingClientRect();

		return this.heightOverride !== undefined ? this.heightOverride : (rect && rect.height);
	},

	scrollWhenDragNearEdges () {
		if (this.targetEl && this.targetEl.addEventListener) {
			this.targetEl.addEventListener('dragover', this.handlers.dragover, true);
			this.targetEl.addEventListener('dragleave', this.handlers.dragleave, true);
		} else {
			console.error('Invalid targetEl');
		}
	},

	unscrollWhenDragNearEdges () {
		if (this.targetEl && this.targetEl.removeEventListener) {
			this.targetEl.removeEventListener('dragover', this.handlers.dragover, true);
			this.targetEl.removeEventListener('dragleave', this.handlers.dragleave, true);
		}

		this.endDragOverScroll();
	},

	__onDragOver (e) {
		this.scrollIfNearEdge(e.clientX, e.clientY);
	},

	__onDragLeave () {
		this.endDragOverScroll();
	},

	getScrollAnimationFn (direction) {
		const velocity = this.scrollingVelocity;
		const targetEl = this.targetEl;
		// let lastScroll = targetEl.scrollTop;

		return (next, diff) => {
			const scrollTop = targetEl.scrollTop;
			// const top = this.__getTop();
			const height = this.__getHeight();

			//If something else has scrolled us
			// if (lastScroll !== scrollTop) { return; }

			//If we are moving up and already at the top
			if (direction < 0 && scrollTop <= 0) { return; }

			//If we are moving down and already at the bottom
			if (direction > 0 && (height + scrollTop) >= targetEl.scrollHeight) { return; }

			const distance = Math.ceil(diff * velocity);

			targetEl.scrollTop = scrollTop + (direction * distance);
			// lastScroll = targetEl.scrollTop;

			next();
		};
	},

	endDragOverScroll () {
		if (this.scrollingAnimation) {
			this.scrollingAnimation.stop();
		}

		if (this.dragScrollStartTimeout) {
			clearTimeout(this.dragScrollTimeout);
		}
	},

	scrollIfNearEdge (x, y) {
		const top = this.__getTop();
		const height = this.__getHeight();
		const tol = this.edgeScrollTolerance;
		const oldScrollDirection = this.dragScrollDirection;

		const getNewScrollAnimation = (direction) => {
			//If we have changed direction create a new animation frame
			if (oldScrollDirection !== direction) {
				return new AnimationFrame(this.getScrollAnimationFn(direction));
			}
		};

		this.lastScroll = this.targetEl.scrollTop;

		let animation;
		let scrollDirection = 0;

		if (y < top + tol) {
			animation = getNewScrollAnimation(-1);
			scrollDirection = -1;
		} else if (y > (top + height) - tol) {
			animation = getNewScrollAnimation(1);
			scrollDirection = 1;
		}

		if (scrollDirection !== this.dragScrollDirection) {
			this.endDragOverScroll();

			if (animation) {
				this.dragScrollStartTimeout = setTimeout(animation.start.bind(animation), 500);
				this.scrollingAnimation = animation;
			}

			this.dragScrollDirection = scrollDirection;
		}

	}
});
