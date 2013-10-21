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
		try {
			if (!this.isVisible()) {
				return;
			}

		var data = this.mixinData.customScroll,
			parentContainerEl = data.container,
			parentContainerPadding = parentContainerEl && parentContainerEl.getPadding('t'),
			parentEl = data.adjustmentEl,
			targetEl = data.targetEl,
			currentScroll = data.targetEl.getScrollTop(),
			delta = currentScroll < parentContainerPadding ? currentScroll : parentContainerPadding,
			tMargin = -delta,
			bMargin = -parentContainerPadding + delta,
			shouldScroll = (targetEl.el.dom.scrollHeight - targetEl.getHeight()) > Math.abs(bMargin);

			// NOTE: If we have a reader, we don't want to show the alternate tabbar,
			// we control that behavior by adding this cls "reader-in-view" to the parent of the parentContainerEl
			// TODO: Move this logic into a callback.
			parentContainerEl[data.targetEl.up('.x-reader-pane') ? 'addCls' : 'removeCls']('reader-in-view');
			parentContainerEl[data.targetEl.is('.course-forum') ? 'addCls' : 'removeCls']('forum-in-view');//really needs to be in callback
			
			if(shouldScroll){
				parentContainerEl[delta > 60 ? 'addCls' : 'removeCls']('has-alt-tabbar');
				parentEl.setStyle({marginTop: tMargin + 'px', marginBottom: bMargin + 'px'});
				setReverseMargin.apply(this, [bMargin]);
			}
			
			

			// NOTE: we need to make sure the main tabbar width matches the parentEl width
			// since we will show the main tabbar on top of it. Better way to do this?
			if (!data.mainTabbar) {
				data.mainTabbar = Ext.get('view-tabs');
			}
			if (data.mainTabbar.getWidth() !== parentEl.getWidth()) {
				data.mainTabbar.setStyle({width: parentEl.getWidth() + 'px'});
			}
		}
		catch (e) {
			console.error(e.stack || e.stacktrace || e.message || e);
		}
	}


	function setReverseMargin(bottomMargin) {
		try {
			updateSideHeight.call(this, -bottomMargin);
		}
		catch (e) {
			console.error(e.stack || e.stacktrace || e.message || e);
		}
	}


	function updateCaches() {
		var data = this.mixinData.customScroll;
		delete data.cachedTargetHeight;
		updateSideHeight.call(this);
	}


	function updateSideHeight(heightAdjustOffset) {
		var data = this.mixinData.customScroll, nH,
			el = data.secondaryViewEl,
        //			cmp = data.reverseMarginCmp, f,
			o = heightAdjustOffset || 0,
			attr = 'custom-scroll-height-adjustment';

		o = data.lastHeightAdjustOffset = o || data.lastHeightAdjustOffset || 0;

		if (!el) { return; }

		if (Ext.isString(el)) {
			el = data.secondaryViewEl = resolve(el, data.container) || el;
			if (Ext.isString(el)) {
				return;//doesn't exist (yet?)
			}
		}

		el = Ext.get(el);

    //		if(!cmp ) {
    //			cmp = data.reverseMarginCmp = Ext.getCmp(el.id);
    //			if( cmp ) {
    //				f = Ext.bind(updateCaches,this);
    //				this.mon(cmp,{
    //					resize: f,
    //					afterlayout: f
    //				});
    //			}
    //		}

		if (!Ext.isNumber(data.cachedTargetHeight)) {
			data.cachedTargetHeight = el.getHeight();
			if (data.cachedTargetHeight === +el.getAttribute(attr)) {
				data.cachedTargetHeight += data.lastHeightAdjustOffset || (o || 0);
			}
			//console.debug('data',data.cachedTargetHeight, el.getAttribute(attr));
		}

		nH = (data.cachedTargetHeight - o);// - data.secondaryViewElInitialMargin;
		el.setHeight(nH);

		o = {};
		o[attr] = nH;
		el.set(o);
	}


	function resolve(el, refEl) {
		return el && (Ext.get(el) || Ext.getDom(refEl).querySelector(el));
	}


	function onAfterRender() {
		var parentContainerEl = Ext.get('view'), mb, pd,
			me = this,
			data = me.mixinData.customScroll,
			adjustmentEl = data.adjustmentEl,
			targetEl = data.targetEl,
			secondaryViewEl = data.options && data.options.secondaryViewEl;

		data.container = parentContainerEl;
		data.targetEl = data.targetEl ? resolve(targetEl, parentContainerEl) : me.getTargetEl();
		data.adjustmentEl = resolve(adjustmentEl, parentContainerEl);
		data.secondaryViewEl = secondaryViewEl;

		if (!data.adjustmentEl) {
			console.error('No adjustment element found for:', adjustmentEl);
			return;
		}

		if (!data.targetEl) {
			console.error('No target element found for:', targetEl);
			return;
		}

		if (parentContainerEl) {
			mb = parentContainerEl.getPadding('t');
			pd = data.targetEl.getPadding('b');
			data.adjustmentEl.setStyle({marginBottom: -mb + 'px'});
			data.targetEl.setStyle({paddingBottom: (mb + pd) + 'px'});
			Ext.DomHelper.append(data.targetEl,{style:{height: mb + 'px'}, cls:'scroll-buffer'});
		}
		me.mon(data.targetEl, 'scroll', adjustOnScroll, me);

		me.on('add', function(container, cmp, index){
			debugger;
			data.targetEl.el.down('.scroll-buffer').destroy();

			Ext.DomHelper.append(data.targetEl, {style: {height: mb + 'px'}, cls: 'scroll-buffer'});
		});
		me.on('activate', adjustOnScroll, me);
		monitorCardChange(me);
		monitorLayout.call(me);
		updateCaches.call(me);
	}


	function monitorLayout() {
		this.mon(this.up(), 'afterlayout', updateCaches, this);
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
		initCustomScrollOn: function(adjustmentEl, targetEl, options) {

			if (!isFeature('fancy-scroll')) { return; }

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
