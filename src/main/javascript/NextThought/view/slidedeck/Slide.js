Ext.define('NextThought.view.slidedeck.Slide',{
	extend: 'Ext.container.Container',
	alias: 'widget.slidedeck-slide',
	requires: [
	],

	ui: 'slide',
	layout: 'auto',

	childEls: ['body'],
	getTargetEl: function () { return this.body; },
	renderTpl: Ext.DomHelper.markup([
		{cls: 'image-wrap', cn:[
			{tag: 'img', cls: 'slide'},
			{cls: 'prev'},{cls: 'next'}
		]},
		{id: '{id}-body', html:'{%this.renderContainer(out,values)%}'}
	]),

	renderSelectors: {
		slideImage: 'img.slide',
		next: '.next',
		prev: '.prev'
	},

	updateSlide: function(v,slide){
		this.slide = slide;
		if(!this.slideImage){
			return;
		}

		var hasNext = Boolean(slide.getSibling(1)),
			hasPrev = Boolean(slide.getSibling(-1));

		this.slideImage.set({src: slide.get('image')});

		this.next[hasNext?'removeCls':'addCls']('disabled');
		this.prev[hasPrev?'removeCls':'addCls']('disabled');
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.slideImage,'load',this.updateLayout,this);
		if(this.slide){
			this.updateSlide({},this.slide);
		}

		this.mon(this.next,'click',this.queue.nextSlide,this.queue);
		this.mon(this.prev,'click',this.queue.previousSlide,this.queue);
	}
});
