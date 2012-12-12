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
		{tag: 'img', cls: 'slide'},
		{id: '{id}-body', html:'{%this.renderContainer(out,values)%}'}
	]),

	renderSelectors: {
		slideImage: 'img.slide'
	},

	updateSlide: function(v,slide){
		this.slide = slide;
		if(!this.slideImage){
			return;
		}

		this.slideImage.set({src: slide.get('image')});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.slideImage,'load',this.updateLayout,this);
		if(this.slide){
			this.updateSlide({},this.slide);
		}
	}

});
