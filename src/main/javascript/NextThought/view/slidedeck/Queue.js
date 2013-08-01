Ext.define('NextThought.view.slidedeck.Queue',{
	extend: 'Ext.view.View',
	alias: 'widget.slidedeck-queue',
    selModel: {enableKeyNav: false},
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
						{ tag: 'h3', html: '{title:ellipsis(60)}' }
					]
				}]
			}]
		}]
	}),


	afterRender: function(){
		this.callParent(arguments);

		var keyMap;

		this.on('select',this.markLastSelectedTime, this);

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
		this.on('viewready',this.onViewReady,this,{single: true, defer: 100});
        this.on('selectionchange', this.onSelectionChange, this);
	},

	onViewReady: function(){
		var me = this,
			imgs = me.el.select('img'),
			count = imgs.getCount();

		function gotoStart(){
			var start = me.store.getAt(0),
				startOn = me.startOn;

			if(startOn){
				start = me.store.findRecord('NTIID', startOn, 0, false, true, true) || start;
			}

			me.setStartingSlide(start);
		}

		function maybeFinish(){
			count--;

			if(count <= 0){
				gotoStart();
			}
		}

		imgs.on('load',maybeFinish);
		imgs.on('error',maybeFinish);

		imgs.each(function(img){
			if(img.complete){
				maybeFinish();
			}
		});
	},

	markLastSelectedTime: function(){
		this.lastChanged = new Date().getTime();
    },

	justChanged: function(){
		return Boolean((new Date().getTime() - this.lastChanged) < 1000);
	},

    // when entering slidedeck, moves the active slide to the top
    setStartingSlide: function(slide){

	    if(isFeature('transcript-presentation') && this.ownerCt.hasSlides && !this.ownerCt.slidesReady){
		    this.mon(this.ownerCt,{
			    'finished-loading-slides':Ext.bind(this.setStartingSlide,this,arguments),
			    single: true
		    });
		    return;
	    }

		var n = Ext.get(this.getNode(slide));
        if(n && n.needsScrollIntoView(this.el)){
            this.el.scroll('b', n.dom.offsetTop, true);
		}
		this.getSelectionModel().select(slide);
	},

    selectSlide: function(slide){
        var n = Ext.get(this.getNode(slide));
        if(n && n.needsScrollIntoView(this.el)){
			n.scrollIntoView(this.el);

        }
        this.getSelectionModel().select(slide);
        this.fireEvent('slide-selected',slide);
    },

    // moves the active slide into view when navigating or
    // watching the clip
	changeSlide: function(direction){
		var sel = this.getSelectionModel().getLastSelected();

		sel = sel? sel.getSibling(direction) : null;

		if( sel ){
			this.selectSlide(sel);
		}
	},

	nextSlide: function(){ this.changeSlide(1); },


	previousSlide: function(){ this.changeSlide(-1); },


	updateSlideFromVideo: function(){
		console.log('updateSlideFromVideo',arguments);
	},

    onSelectionChange: function(sm, records){
        if(Ext.isEmpty(records)){
            var lastSelected = sm.getLastSelected();
            if (lastSelected) {
                sm.select(sm.getLastSelected());
            }
        }else{
        	this.selectSlide(records[0]);
        }
	}
});
