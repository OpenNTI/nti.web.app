Ext.define('NextThought.mixins.CustomScroll', function(){

	/*
	 * Mixin to add the fancy scroll that scrolls the whole page.
	 * This mixin assumes we are mixed into a view(an observable)
	 */

	function adjustOnScroll(){
		/**
		 * NOTE: To Achieve the desired behavior of scrolling the whole parent view as
		 * the page scrolls till we hit the top menu-bar,
		 * we will are handling it by manipulating top and bottom margin.
		 **/
		try{
		var parentContainerEl = Ext.get('view'),
			data = this.mixinData.customScroll,
			parentContainerPadding = parentContainerEl && parentContainerEl.getPadding('t'),
			parentEl = data.adjustmentEl,
			currentScroll = data.targetEl.getScrollTop(),
			delta = currentScroll < parentContainerPadding ? currentScroll : parentContainerPadding,
			tMargin = -delta,
			bMargin = -parentContainerPadding + delta;

	//		console.log('setting top margin to: ', tMargin, ' and bottom margin to: ', bMargin);
			parentEl.setStyle({marginTop: tMargin+'px', marginBottom: bMargin+'px'});
			setReverseMargin.apply(this, [bMargin]);
		}
		catch(e){
			console.error(e.stack || e.stacktrace || e.message || e);
		}
	}


	function setReverseMargin(bottomMargin){
		/**
		 * NOTE: When we modify the top and bottom margin of the parentEl view,
		 * we sometimes need to also adjust el that depends on it. Specifically,
		 * in cases where we have sibling view which is scrollable.
		 */
		var data = this.mixinData.customScroll, nH;

		if(!data.reverseMarginEl){ return; }

		if(Ext.isString(data.reverseMarginEl)){
			data.reverseMarginEl = resolve(data.reverseMarginEl,data.container) || data.reverseMarginEl;
			if(Ext.isString(data.reverseMarginEl)){
				return;//doesn't exist (yet?)
			}
		}

		if(!this.initialReverseViewHeight){
			this.initialReverseViewHeight = Ext.fly(data.reverseMarginEl).getHeight();
		}

		try{
			nH = this.initialReverseViewHeight;
			nH = bottomMargin ? nH + bottomMargin: nH;
			Ext.fly(data.reverseMarginEl).setStyle({marginBottom: -bottomMargin + 'px', height: nH+'px'});
//			console.log('setting height to: ', nH);
		}
		catch(e){
			console.error(e.stack || e.stacktrace || e.message || e);
		}
	}


	function resolve(el, refEl){
		return el && (Ext.get(el) || Ext.query(el,refEl)[0]);
	}


	function onAfterRender(){
		var parentContainerEl = Ext.get('view'), mb,
			me = this,
			data = me.mixinData.customScroll,
			adjustmentEl = data.adjustmentEl,
			targetEl = data.targetEl,
			reverseMarginEl = data.options && data.options.reverseMarginEl;

		data.container = parentContainerEl;
		data.targetEl = data.targetEl ? resolve(targetEl,parentContainerEl) : me.getTargetEl();
		data.adjustmentEl = resolve(adjustmentEl,parentContainerEl);
		data.reverseMarginEl = resolve(reverseMarginEl,parentContainerEl) || reverseMarginEl;

		if(!data.adjustmentEl){
			console.error('No adjustment element found for:', adjustmentEl);
			return;
		}

		if(!data.targetEl){
			console.error('No target element found for:', targetEl);
			return;
		}


		if(parentContainerEl){
			mb = parentContainerEl.getPadding('t');
			data.adjustmentEl.setStyle({marginBottom: -mb+'px'});
		}
		me.mon(data.targetEl, 'scroll', adjustOnScroll,me);
		me.mon(me.up('{isOwnerLayout("card")}'),'activate',adjustOnScroll,me);
	}


	return {
		initCustomScrollOn: function(adjustmentEl, targetEl, options){

			if(!isFeature('fancy-scroll')){ return; }

			this.mixinData = this.mixinData||{};
			this.mixinData.customScroll = {adjustmentEl:adjustmentEl,targetEl:targetEl, options:options};

			var me = this;

			if(!me.rendered){
				me.on('afterrender', onAfterRender, me);
				return;
			}

			onAfterRender.call(me);
		}
	};
});
