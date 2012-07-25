Ext.define('NextThought.view.annotations.note.Carousel',{
	extend: 'Ext.container.Container',
	alias: 'widget.note-carousel',

	cls: 'carousel',
	height: 68,

	renderTpl: Ext.DomHelper.createTemplate([
			{
				id: '{id}-body',
			  	tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}')
			},
			{ cls: 'slide-nav backward' },
			{ cls: 'slide-nav forward' }
		]).compile()
});
