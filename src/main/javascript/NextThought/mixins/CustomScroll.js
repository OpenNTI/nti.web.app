Ext.define('NextThought.mixins.CustomScroll', function() {
	/*
	 * Mixin to add the fancy scroll that scrolls the whole page.
	 * This mixin assumes we are mixed into a view(an observable)
	 */
	function adjustOnScroll() {
		/**
		 * NOTE: To Achieve the desired behavior of scrolling the whole parent view as
		 * the page scrolls till we hit the top menu-bar,
		 * we will are handling it by manipulating top and bottom margin.
		 **/
		//give it a chance to prevent the custom scroll after the first time through.
		if (!this.isVisible() || (this.allowCustomScrolling && !this.allowCustomScrolling() && this.alreadySetMargin)) {
			return;
		}

		var data = this.mixinData.customScroll,
			container = data.container,
			targetEl = data.targetEl,
			adjustmentEl = data.adjustmentEl,
			containerTop = container.getPadding('t'),
			currentScroll = this.getScrollTop(),
			//if we are already at the top, don't go higher
			topChange = currentScroll < containerTop ? currentScroll : containerTop,

			targetDom = Ext.getDom(targetEl && targetEl.el),

			shouldScroll = targetDom && (targetDom.scrollHeight - targetDom.offsetHeight) >= Math.abs(topChange),
			shouldHaveAlt = (topChange / containerTop) > data.tolerance;

		if (shouldScroll || !this.alreadySetMargin) {
			container[shouldHaveAlt ? 'addCls' : 'removeCls'](['has-alt-tabbar', data.altClass]);
			adjustmentEl.setStyle({
				marginTop: -topChange + 'px',
				marginBottom: topChange + 'px'
			});

			this.alreadySetMargin = true;

			if (this.realignSidebar) {
				this.realignSidebar();
			}

			if (data.secondaryViewEl) {
				adjustSecondaryView(data.secondaryViewEl, adjustmentEl);
			}
		}


		// NOTE: we need to make sure the main tabbar width matches the parentEl width
		// since we will show the main tabbar on top of it. Better way to do this?
		if (!data.mainTabbar) {
			data.mainTabbar = Ext.get('view-tabs');
		}
		if (data.mainTabbar.getWidth() !== adjustmentEl.getWidth()) {
			data.mainTabbar.setStyle({width: adjustmentEl.getWidth() + 'px'});
		}
	}


	function adjustSecondaryView(el, parentEl) {
		var newBottom, oldBottom,
		//getBottom() is deprecated...
			bodyBottom = Ext.getBody().getBottom(),
			parentBottom = parentEl ? parentEl.getBottom() : 0;

		if (!el || !el.dom) {return;}

		oldBottom = el.getAttribute('data-desired-bottom');

		oldBottom = parseInt(oldBottom, 10);

		if (!oldBottom && oldBottom !== 0) {
			oldBottom = 0;
			console.error('Adjusting secondary view that hasnt been init yet');
		}

		if (bodyBottom <= parentBottom) {
			newBottom = (parentBottom - bodyBottom) + oldBottom;
		} else {
			newBottom = -(bodyBottom - parentBottom) - oldBottom;
		}

		el.setStyle({
			'bottom': newBottom + 'px',
			'height': 'auto' //make sure the bottom is driving the height
		});
	}

	//add a div to buffer the height of the targetEl to reach the bottom of the screen when
	//the adjusmentEl is at the top
	function addScrollBuffer() {
		var data = this.mixinData.customScroll,
			h = data.container.getPadding('t') || 0,
			buffer = data.targetEl.el.down('.scroll-buffer');

		if (data.noBuffer) {
			return;
		}

		Ext.destroy(buffer);
		Ext.DomHelper.append(data.targetEl, { style: { height: h + 'px'}, cls: 'scroll-buffer'});
	}


	function resolve(el, refEl) {
		return el && (Ext.get(el) || Ext.get(Ext.getDom(refEl).querySelector(el)));
	}


	function initSecondaryView(el, containerTop) {
		var bottom, elHeight = el.getHeight(),
			windowHeight = Ext.Element.getViewportHeight();

		//if we've already computed it, don't reset it
		if (el.getAttribute('data-desired-bottom')) {
			return;
		}

		//if el has a bottom use it to drive the height
		if (el.getStyle('bottom') !== 'auto') {
			bottom = parseInt(el.getStyle('bottom'), 10);
		} else {
			if (elHeight) {
				//the difference in the window height and the el height when it is at the top
				bottom = windowHeight - (containerTop + elHeight);
			} else {
				bottom = 0;
			}

			if (bottom < 0) {
				console.warn('SecondaryViewEl is taller than the window');
			}

			el.setStyle('position', 'absolute');
		}

		el.dom.setAttribute('data-desired-bottom', bottom);
	}


	function onAfterRender() {
		var container = Ext.get('view'),
			data = this.mixinData.customScroll,
			adjustmentEl = data.adjustmentEl,
			targetEl = data.targetEl,
			secondaryViewEl = data.options && data.options.secondaryViewEl,
			tolerance = data.options && data.options.tolerance,
			altClass = data.options && data.options.altClass,
			containerTop, targetBottom;

		data.container = container;
		data.targetEl = data.targetEl ? resolve(targetEl, container) : this.getTargetEl();
		data.adjustmentEl = resolve(adjustmentEl, container);
		//the % of the top to allow the adjustmentEl to move before adding alt classes
		data.tolerance = tolerance || 0.3;
		//a class to add along with has has-alt-tabbar
		data.altClass = altClass;

		data.noBuffer = data.options && data.options.noBuffer;

		if (!data.adjustmentEl) {
			console.error('No adjustment element found for:', adjustmentEl);
			return;
		}

		if (!data.targetEl) {
			console.error('No target element found for:', targetEl);
			return;
		}

		containerTop = container.getPadding('t');
		targetBottom = data.targetEl.getPadding('b');
		data.adjustmentEl.setStyle({marginBottom: -containerTop + 'px'});
		data.targetEl.setStyle({paddingBottom: (containerTop + targetBottom) + 'px'});

		addScrollBuffer.call(this);

		if (secondaryViewEl) {
			data.secondaryViewEl = resolve(secondaryViewEl, container);
			initSecondaryView(data.secondaryViewEl, container.getTop());
		}

		if (this.realignSidebar) {
			this.realignSidebar();
		}

		this.on('activate', adjustOnScroll, this);
		monitorCardChange(this);
		monitorLayout.call(this);

		this.mon(data.targetEl, 'scroll', adjustOnScroll, this);
		this.mon(data.targetEl, 'scrollstop', adjustOnScroll, this);

		Ext.EventManager.onWindowResize(adjustOnScroll, this);

		this.on('add', addScrollBuffer, this);
	}


	function monitorLayout() {
		this.mon(this.up(), 'afterlayout', function() {
			//Go through adjustOnScroll like its the first time
			delete this.alreadySetMargin;
			if (!this.destroying && !this.isDestroyed) {
				adjustOnScroll.call(this, true);
			}
		}, this);
	}


	function monitorCardChange(cmp, me) {
		var c = cmp.up('{isOwnerLayout("card")}');
		me = me || cmp;
		if (c) {
			me.mon(c, {
				activate: adjustOnScroll,
				scope: me
			});
			monitorCardChange(c, me);
		}
	}


	return {

		getScrollTop: function() {
			try {
				return this.mixinData.customScroll.targetEl.getScrollTop();
			} catch (e) {
				return 0;
			}
		},

		/**
		 * Returns a menu with all of the tab options for courses
		 * @param  {Int} width How wide to make the menu
		 * @return {jump-menu} the menu of tab options
		 */
		getMainTabbarMenu: function(width, current) {
			var tabView = Ext.get('view-tabs').dom,
			children = tabView && tabView.children,
			items = [];

			current = current || 'Lessons';

			Ext.each(children, function(item) {
				items.push({
					text: item.textContent,
					viewId: item.getAttribute('data-view-id'),
					cls: item.textContent.toLowerCase() === current.toLowerCase() ? 'current' : ''
				});
			});

			if (Ext.isEmpty(items)) {
				return;
			}

			this.tabMenu = Ext.widget('jump-menu', { ownerButton: this, items: items, width: width });

			this.mon(this.tabMenu, {
				scope: this,
				click: function(menu, item) {
					console.log('tab item clicked: ', arguments);
					this.fireEvent('main-tab-clicked', item);
				}
			});

			this.on('destroy', 'destroy', this.tabMenu);

			return this.tabMenu;
		},

		/**
		 * Set correct styles for the elements, and start listening to scroll to update
		 * @param  {String} adjustmentEl Selector for the element to move
		 * @param  {String} targetEl     Selector for the element to monitor scroll on
		 * @param  {Object} options      what options to use such as secondaryViewEl
		 */
		initCustomScrollOn: function(adjustmentEl, targetEl, options) {
			this.enableBubble('main-tab-clicked');
			if (!isFeature('fancy-scroll')) { return; }
			if (Ext.is.iOS) { return; }

			this.mixinData = this.mixinData || {};
			this.mixinData.customScroll = {adjustmentEl: adjustmentEl, targetEl: targetEl, options: options};

			var me = this;

			if (!me.rendered) {
				me.on('afterrender', onAfterRender, me);
				return;
			}

			onAfterRender.call(me);
		}
	};
});
