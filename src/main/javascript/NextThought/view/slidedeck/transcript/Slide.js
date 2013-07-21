Ext.define('NextThought.view.slidedeck.transcript.Slide',{
	extend: 'Ext.Component',
	alias: 'widget.slide-component',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'image-wrap', cn:[
			{tag: 'img', cls: 'slide'},
			{tag: 'span', cls:'add-note-here', cn:{cls:'note-here-control-box hidden', tag:'span'}}
			//			{cls: 'left', cn:[{cls: 'prev'}]},
//			{cls: 'right',cn:[{cls: 'next'}]}
		]}
	]),

	ui: 'slide',

	renderSelectors: {
		slideImage: 'img.slide',
		createNoteEl: '.add-note-here'
//		next: '.next',
//		prev: '.prev'
	},


	afterRender: function(){
		this.callParent(arguments);

		var slide = this.slide;
		if(slide){
			this.mon(this.slideImage,'load', Ext.defer(this.updateLayout, 1, this),this);
			this.slideImage.set({src: slide.get('image')});

			this.mon(this.el, {
				scope: this,
				'mouseover': 'onMouseOver',
				'mouseout':'onMouseOut'
			});

			this.mon(this.createNoteEl,{
				scope:this,
				'click': 'openNoteEditor'
			});
		}
	},

	openNoteEditor: function(e){
		var data = {startTime: this.slide.get('startTime'), endTime: this.slide.get('endTime'), range:{}};
		this.fireEvent('show-editor', data, e.getTarget('.add-note-here', null, true));
	},


	onMouseOver: function(e){
		var t = e.getTarget('.image-wrap', null, true),
			box = t && t.down('.add-note-here'), me = this;

		if(this.suspendMoveEvents || !t || !box){ return; }

		this.mouseLeaveTimeout = setTimeout(function () {
			box.down('.note-here-control-box').removeCls('hidden');
			me.activeCueEl = t;
		}, 100);

	},

	onMouseOut: function(e){
		if (this.suspendMoveEvents) {
			return;
		}

		var target = e.getTarget('.image-wrap', null, true),
			box = target && target.down('.add-note-here');

		clearTimeout(this.mouseLeaveTimeout);
	}
});