Ext.define('NextThought.mixins.CustomScroll', {

	/*
	 * Mixin to add the fancy scroll that scrolls the whole page.
	 * This mixin assumes we are mixin into a view(an observable)
	 */

	constructor: function(){

		function onAfterRender(){
			var parentContainerEl = me.el.up('#view'), mb;
			if(parentContainerEl){
				mb = parentContainerEl.getPadding('t');
				me.el.up('#content').setStyle({marginBottom: -mb+'px'});
			}
			me.mon(me.getTargetEl(), 'scroll', 'adjustOnScroll', me);
		}

		var me = this;
		me.on('afterrender', onAfterRender);
	},

	adjustOnScroll: function(e){
		/**
		 * NOTE: To Achieve the desired behavior of scrolling the whole parent view as
		 * the page scrolls till we hit the top menu-bar,
		 * we will are handling it by manipulating top and bottom margin.
		 **/
		var t = e.getTarget(),
			parentContainerEl = Ext.fly(t).up('#view'),
			parentContainerPadding = parentContainerEl && parentContainerEl.getPadding('t'),
			parentEl = Ext.fly(t).up('#content'),
			currentScroll = Ext.fly(t).getScrollTop(),
			delta = currentScroll < parentContainerPadding ? currentScroll : parentContainerPadding,
			tMargin = -delta,
			bMargin = -parentContainerPadding + delta;

//		console.log('setting top margin to: ', tMargin, ' and bottom margin to: ', bMargin);
		parentEl.setStyle({marginTop: tMargin+'px', marginBottom: bMargin+'px'});
	}
});