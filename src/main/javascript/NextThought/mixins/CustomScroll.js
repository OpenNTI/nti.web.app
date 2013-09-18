Ext.define('NextThought.mixins.CustomScroll', function(){

	/*
	 * Mixin to add the fancy scroll that scrolls the whole page.
	 * This mixin assumes we are mixin into a view(an observable)
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
		}
		catch(e){
			console.error(e.stack || e.stacktrace || e.message || e);
		}
	}


	function resolve(el, refEl){
		return Ext.get(el) || Ext.query(el,refEl)[0];
	}


	function onAfterRender(){
		var parentContainerEl = Ext.get('view'), mb,
			me = this,
			data = me.mixinData.customScroll,
			adjustmentEl = data.adjustmentEl,
			targetEl = data.targetEl;

		data.targetEl = data.targetEl ? resolve(targetEl,parentContainerEl) : me.getTargetEl();
		data.adjustmentEl = resolve(adjustmentEl,parentContainerEl);

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
		initCustomScrollOn: function(adjustmentEl, targetEl){

			this.mixinData = this.mixinData||{};
			this.mixinData.customScroll = {adjustmentEl:adjustmentEl,targetEl:targetEl};

			var me = this;

			if(!me.rendered){
				me.on('afterrender', onAfterRender, me);
				return;
			}

			onAfterRender.call(me);
		}
	};
});
