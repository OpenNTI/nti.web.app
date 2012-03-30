Ext.define('NextThought.view.widgets.annotations.SelectionHighlight', {
	extend: 'NextThought.view.widgets.Widget',
	alias: 'annotations.SelectionHighlight',

	constructor: function(selections, component){
		this.callParent();
		Ext.apply(this, {
			selections: selections || [],
			ownerCmp: component,
			container: component.body.dom,
			canvas: null,
			canvasId: 'search-highlight-'+guidGenerator()
		});

		var me = this;

		me.color = 'rgba(255,255,0,0.3)';
		me.canvas =  me.createCanvas();
		me.render = Ext.Function.createBuffered(me.render,100,me,[true]);

		component.on('resize', me.canvasResize, me);
		me.canvasResize();
		return me;
	},

	cleanup: function(){
		try{
			Ext.get(this.canvas).remove();
		}
		catch(e){
			console.error(e);
		}
		delete this.selections;
	},

	createCanvas: function(){
		return this.createElement(
			'canvas',
			this.container,
			'search-highlight-object unselectable','position: absolute; pointer-events: none',
			this.canvasId
			);
	},


	canvasResize: function(){
		var c = Ext.get(this.canvas || this.canvasId),
			cont = Ext.get(this.ownerCmp.getIframe()),
			pos = cont.getXY(),
			size = cont.getSize();
		c.moveTo(pos[0], pos[1]);
		c.setSize(size.width, size.height);
		c.set({
			width: size.width,
			height: size.height
		});
		this.render();
	},

	render: function(){
		if(!this.selections || !this.canvas){
			return;
		}

		var c = this.canvas,
			w = 'width',
			ctx = c.getContext("2d");

		c.width = c[w];

		ctx.fillStyle = this.color;

		Ext.each(this.selections, function(sel){

			var s = sel.getClientRects(),
				i = s.length-1;

			for(; i>=0; i--){
				this.drawRect(ctx,s[i]);
			}
		}, this);
	},

	drawRect: function(ctx, rect){
		ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
	}

});
