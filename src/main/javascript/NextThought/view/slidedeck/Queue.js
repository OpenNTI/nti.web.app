Ext.define('NextThought.view.slidedeck.Queue',{
	extend: 'Ext.view.View',
	alias: 'widget.slidedeck-queue',

	singleSelect: true,
	allowDeselect: false,
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
			startOn = this.startOn,
			keyMap;

		if(startOn){
			start = this.store.findRecord('NTIID', startOn, 0, false, true, true) || start;
		}

		this.selectSlide(start);

		keyMap = new Ext.util.KeyMap({
			target: document,
			binding: [{
				key: [Ext.EventObject.DOWN,Ext.EventObject.RIGHT,Ext.EventObject.SPACE],
				fn: this.nextSlide,
				scope: this
			},{
				key: [Ext.EventObject.UP,Ext.EventObject.LEFT],
				fn: this.previousSlide,
				scope: this
			}]
		});
		this.on('destroy',function(){keyMap.destroy(false);});
	},


	selectSlide: function(slide){
		var n = Ext.get(this.getNode(slide));
		if(n && n.needsScrollIntoView(this.el)){
			n.scrollIntoView(this.el);
		}
		this.getSelectionModel().select(slide);
	},


	changeSlide: function(direction){
		var s = this.store,
			sel = this.getSelectionModel().getLastSelected();

		sel = s.getAt(s.indexOf(sel) + direction);
		if( sel ){
			this.selectSlide(sel);
		}
	},


	nextSlide: function(){ this.changeSlide(1); },


	previousSlide: function(){ this.changeSlide(-1); },


	updateSlideFromVideo: function(){
		console.log('updateSlideFromVideo',arguments);
	}
});
