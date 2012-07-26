Ext.define('NextThought.view.annotations.note.Carousel',{
	extend: 'Ext.container.Container',
	alias: 'widget.note-carousel',

	cls: 'carousel',
	height: 68,

	renderTpl: Ext.DomHelper.createTemplate([
			{
				id: '{id}-body',
				cls: 'carousel-body',
				tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}')
			},
			{ cls: 'slide-nav backward disabled', cn:[{cls: 'circle'}] },
			{ cls: 'slide-nav forward disabled', cn:[{cls: 'circle'}] }
		]).compile()
});
