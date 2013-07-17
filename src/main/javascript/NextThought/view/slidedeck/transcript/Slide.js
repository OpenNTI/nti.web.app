Ext.define('NextThought.view.slidedeck.transcript.Slide',{
	extend: 'Ext.Component',
	alias: 'widget.slide-component',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'image-wrap', cn:[
			{tag: 'img', cls: 'slide'},
			{cls: 'left', cn:[{cls: 'prev'}]},
			{cls: 'right',cn:[{cls: 'next'}]}
		]}
	]),

	ui: 'slide',

	renderSelectors: {
		slideImage: 'img.slide',
		next: '.next',
		prev: '.prev'
	},


	afterRender: function(){
		this.callParent(arguments);

		var slide = this.slide;
		if(slide){
			this.mon(this.slideImage,'load', Ext.defer(this.updateLayout, 1, this),this);
			this.slideImage.set({src: slide.get('image')});
		}
	}
});