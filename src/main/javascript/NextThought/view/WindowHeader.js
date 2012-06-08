Ext.define('NextThought.view.WindowHeader', {
	extend: 'Ext.container.Container',
	alias: 'widget.nti-window-header',

	requires: [
		'NextThought.layout.component.TemplatedContainer'
	],

	cls: 'nti-window-header',
	layout: 'auto',
	componentLayout: 'templated-container',
	renderTpl: [
		'{title}',
		'<div id="{id}-body" class="header-body">',
			'{%this.renderContainer(out,values)%}',
			'<div class="controls">',
				'<img src="{[Ext.BLANK_IMAGE_URL]}"	class="tool close">',
				'<img src="{[Ext.BLANK_IMAGE_URL]}" class="tool minimize">',
			'</div>',
		'</div>'
	],

	renderSelectors: {
		closeEl: 'img.tool.close',
		minimizeEl: 'img.tool.minimize'
	},

	childEls: ['body'],


	getTargetEl: function () {
		return this.body;
	},


	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},{
			title: this.title
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.closeEl.on('click', this.ownerCt.close, this.ownerCt);
		this.minimizeEl.on('click', this.ownerCt.minimize, this.ownerCt);

		if(!this.ownerCt.closable){ this.closeEl.remove(); }
		if(!this.ownerCt.minimizable){ this.minimizeEl.remove(); }
	}
});