Ext.define('NextThought.mixins.Scrolling', {

	initScrolling: function() {
		this.Scrolling = this.Scrolling || {};

		this.Scrolling.scrollingEl = Ext.isIE11p || Ext.isGecko ? document.documentElement : document.body;
	},


	__findScrollableParent: function(node) {
		function isScrollable(node) {
			var computed = node && getComputedStyle(node);

			//if the node is scrollable and the overflow allows it to scroll
			return node && node.scrollHeight > node.clientHeight && (computed['overflow-y'] === 'auto' || computed['overflow-y'] === 'scroll');
		}

		while (node && node !== this.Scrolling.scrollingEl && node !== document && !isScrollable(node)) {
			node = node.parentNode;
		}

		return node !== this.Scrolling.scrollingEl && node !== document && node;
	},


	maybeStopScrollBleed: function(e) {
		var target = this.__findScrollableParent(e.target),
			scrollTop = target && target.scrollTop,
			scrollHeight = target && target.scrollHeight,
			height = target && target.clientHeight,
			delta = e.wheelDelta,
			up = delta > 0;

		function prevent() {
			console.log('stopping mouse wheel');
			e.stopPropagation();
			e.preventDefault();
			e.returnValue = false;
			return false;
		}

		if (!target || target.classList.contains('allow-scroll-bleed')) {
			console.log('allowing mouse wheel', target);
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
	}
});
