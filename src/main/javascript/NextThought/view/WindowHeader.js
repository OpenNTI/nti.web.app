Ext.define('NextThought.view.WindowHeader', {
	extend: 'Ext.Component',
	alias: 'widget.nti-window-header',

	cls: 'nti-window-header',

	renderTpl: [
		'<div id="{id}-body" class="header-body">',
			'<div class="controls {hasTools}">',
				'<img src="{[Ext.BLANK_IMAGE_URL]}"	class="tool close" />',
				'<img src="{[Ext.BLANK_IMAGE_URL]}" class="tool minimize" />',
			'</div>',

			'<div class="tools">',
				//TODO: render tool images here AND add CSS rules
				'<tpl for="tools">',
					'<img src="{[Ext.BLANK_IMAGE_URL]}" class="tool {tool}" alt="{tip}" />',
				'</tpl>',
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
	 * { whiteboard: { handler: function(){}, scope: this, tip: 'tool tip' } }
	 *
	 * A null scope will resolve to this components' parent (the window)
	 *
	 * A string value for the handler will resolve to a property name inside the scope: Ex: scope[handler]
	 *
	 * The key will be the tool's class and will always be like img.tool.x where x is the tool's key in the dictionary.
	 * The generated HTML will look something like this:
	 *
	 * <img src="..." class="tool x" alt="tool tip"/>
	 */

	renderSelectors: {
		textEl: 'span',
		closeEl: 'img.tool.close',
		minimizeEl: 'img.tool.minimize'
	},

	childEls: ['body'],


	getTargetEl: function () {
		return this.body;
	},


	initComponent: function(){
		this.callParent(arguments);

		var me = this,
			tools = [];

		Ext.Object.each(this.tools,function(tool,info){
			tools.push({ tool: tool, tip: info.tip });
			me.renderSelectors[tool] = Ext.String.format('img.tool.{0}',tool);
		});

		this.renderData = Ext.apply(this.renderData||{},{
			title: this.title,
			tools: tools,
			hasTools: tools.length===0 ? '' : 'has-tools'
		});
	},


	addTools: function(tools){
		var me = this,
			rd = this.renderData;

		if(!me.rendered){
			Ext.Object.each(tools,function(tool,info){
				if(!me.renderSelectors[tool]){
					me.tools[tool] = info;//merge it in
					me.renderSelectors[tool] = Ext.String.format('img.tool.{0}',tool);
					rd.tools.push({tool: tool, tip: info.tip});
					rd.hasTools = 'has-tools';
				}
			});
		}
		else {
			Ext.Error.raise('not implemented yet');
//			this.applyToolHandlers();
		}
	},


	applyToolHandlers: function(){
		var me = this;
		Ext.Object.each(me.tools,function(tool,info){
			var t = me[tool];
			if(t && !t.toolAttached){
				var sc = info.scope||me.ownerCt,
					fn = info.handler;
				fn = typeof fn === 'string' ? sc[fn] : fn;
				t.on('click',fn,sc);
				t.addClsOnOver('tool-over');
				t.toolAttached = true;
			}
		});
	},


	update: function(text){
		this.title = text;
		if(this.textEl){
			this.textEl.update(text);
		}
		else {
			this.renderData.title = text;
		}
	},


	getTitle: function(){
		if(this.textEl){
			return this.textEl.getHTML();
		}
		return this.renderData.title;
	},


	afterRender: function(){
		var me = this;

		me.callParent(arguments);
		me.closeEl.on('click', me.ownerCt.close, me.ownerCt);
		me.minimizeEl.on('click', me.ownerCt.minimize, me.ownerCt);

		 if(!me.ownerCt.closable){ me.closeEl.remove(); }
		 if(!me.ownerCt.minimizable){ me.minimizeEl.remove(); }

		 me.applyToolHandlers();
	 }
});
