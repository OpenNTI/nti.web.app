const Ext = require('extjs');
const Scrolling = require('../util/Scrolling');


module.exports = exports = Ext.define('NextThought.mixins.Scrolling', {
	initScrolling () {
		if (!this.Scrolling) {
			this.Scrolling = {
				scrollingEl: Scrolling.getPageScrollingEl()
			};
		}
	},

	getPageScrollingEl () {
		return Scrolling.getPageScrollingEl();
	},

	getPageScrollHeight () {
		return Scrolling.getPageScrollingHeight();
	},

	getPageHeight () {
		return Scrolling.getPageHeight();
	},

	findScrollableParent (node) {
		this.initScrolling();

		const isScrollable = (el) => {
			const computed = el && getComputedStyle(el);

			//if the node is scrollable and the overflow allows it to scroll
			return el
				&& el.scrollHeight > el.clientHeight
				&& (
					computed['overflow-y'] === 'auto'
					|| computed['overflow-y'] === 'scroll'
				);
		};

		while (node && node !== this.Scrolling.scrollingEl && node !== document && !isScrollable(node)) {
			node = node.parentNode;
		}

		return node !== this.Scrolling.scrollingEl && node !== document && node;
	},

	maybeStopScrollBleed (e) {
		const target = this.findScrollableParent(e.target);
		const scrollTop = target && target.scrollTop;
		const scrollHeight = target && target.scrollHeight;
		const height = target && target.clientHeight;
		const delta = e.wheelDelta;
		const up = delta > 0;

		function prevent () {
			e.stopPropagation();
			e.preventDefault();
			e.returnValue = false;
			return false;
		}

		if (!target || target.classList.contains('allow-scroll-bleed') || (e.target === target && target.tagName === 'HTML')) {
			return true;
		}

		//if we are scrolling down and it will take us past the bottom
		if (!up && -delta > scrollHeight - height - scrollTop) {
			target.scrollTop = scrollHeight;
			return prevent();
		}

		//if we are scrolling and it will take us past the top
		if (up && delta > scrollTop) {
			target.scrollTop = 0;
			return prevent();
		}
	},

	scrollPageTo (position) {
		this.initScrolling();

		const page = this.getPageScrollingEl();

		if (position < 0) {
			position = 0;
		} else if (position > page.scrollHeight) {
			position = page.scrollHeight;
		}

		page.scrollTop = position;
	},

	scrollPageToTop () {
		this.scrollPageTo(0);
	}
});
