Ext.define('NextThought.view.slidedeck.Queue',{
	extend: 'Ext.view.View',
	alias: 'widget.slidedeck-queue',

	singleSelect: true,
	allowDeselect: false,
	overflowX: 'hidden',
	overflowY: 'scroll',
	overItemCls: 'over',
	itemSelector: 'div.item-wrap',

	tpl: Ext.DomHelper.markup({tag:'tpl', 'for':'.', cn: [
			{cls:'item-wrap', cn:[{
				cls: 'ordinal', html: '{#}'
			},{
				cls:'item',
				tag: 'img',
				src: '{slide-image}'
			},{
				cls: 'title', cn:[
					{ tag: 'h3', html: '{title}' },
					'{meta?}'
				]
			}]
		}]
	}),


	updateSlideFromVideo: function(){
		console.log('updateSlideFromVideo',arguments);
	}
});
