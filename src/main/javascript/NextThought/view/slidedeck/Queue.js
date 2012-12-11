Ext.define('NextThought.view.slidedeck.Queue',{
	extend: 'Ext.view.View',
	alias: 'widget.slidedeck-queue',

	singleSelect: true,
	allowDeselect: false,
	overflowX: 'hidden',
	overflowY: 'scroll',
	overItemCls: 'over',
	itemSelector: 'div.item-wrap',
	cls: 'slidedeck-queue',

	tpl: Ext.DomHelper.markup({tag:'tpl', 'for':'.', cn: [
			{cls:'item-wrap', cn:[{
				cls: 'ordinal', html: '{ordinal}'
			},{
				cls: 'content-wrap',
				cn:[{
					cls:'item',
					tag: 'img',
					src: '{image-thumbnail}'
				},{
					cls: 'title', cn:[
						{ tag: 'h3', html: '{title:ellipsis(60)}' },
						'{meta?}'
					]
				}]
			}]
		}]
	}),


	afterRender: function(){
		this.callParent(arguments);

		var start = this.store.getAt(0),
			startOn = this.startOn;

		if(startOn){
			start = this.store.findRecord('NTIID', startOn, 0, false, true, true) || start;
		}

		this.getSelectionModel().select(start);
	},


	updateSlideFromVideo: function(){
		console.log('updateSlideFromVideo',arguments);
	}
});
