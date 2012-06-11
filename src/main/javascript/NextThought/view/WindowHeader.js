Ext.define('NextThought.view.WindowHeader', {
	extend: 'Ext.Component',
	alias: 'widget.nti-window-header',

	cls: 'nti-window-header',

	renderTpl: [
		'<div id="{id}-body" class="header-body">',
			'<div class="controls">',
				'<img src="{[Ext.BLANK_IMAGE_URL]}"	class="tool close" />',
				'<img src="{[Ext.BLANK_IMAGE_URL]}" class="tool minimize" />',
			'</div>',

			'<div class="tools">',
				//TODO: render tool images here AND add CSS rules
			'</div>',

			'<span>{title}</span>',
		'</div>'
	],

	/**
	 * @cfg {Object} tools
	 *
	 * A dictionary of tools dictionaries.
	 *
	 * Ex:
	 *
	 * { whiteboard: { handler: function(){}, scope: this, alt: 'tool tip' } }
	 *
	 * The key will be the tool's class and will always be like img.tool.x where x is the tool's key in the dictionary.
	 * The generated HTML will look something like this:
	 *
	 * <img src="..." class="tool x" alt="tool tip"/>
	 */

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

		//TODO: add render selectors from the tools dictionary
	},


	afterRender: function(){
		this.callParent(arguments);
		this.closeEl.on('click', this.ownerCt.close, this.ownerCt);
		this.minimizeEl.on('click', this.ownerCt.minimize, this.ownerCt);

		if(!this.ownerCt.closable){ this.closeEl.remove(); }
		if(!this.ownerCt.minimizable){ this.minimizeEl.remove(); }

		//TODO: hook tool handlers to image click events.
		//TODO: setup tool hover class using Ext.dom.Element#addClsOnOver('over')
	}
});
