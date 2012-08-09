Ext.define('NextThought.ux.SearchHits', {
	alias: 'widget.search-hits',

	constructor: function(config){
		var me = this;

		Ext.apply(me, {
			selections: config.hits || [],
			ownerCmp: config.owner,
			container: config.owner.getInsertionPoint('innerCt').dom,
			canvas: null,
			canvasId: 'search-highlight-'+guidGenerator()
		});

		me.color = 'rgba(255,255,0,0.3)';
		me.canvas =  me.createCanvas();

		me.render = Ext.Function.createBuffered(me.render,100,me,[true]);

		me.ownerCmp.on('resize', me.canvasResize, me);

		if(this.ownerCmp.getIframe().getSize().height !== 0){
			me.canvasResize(); }
		else{ setTimeout( function(){me.canvasResize();}, 200 ); }

		return me;
	},

	cleanup: function(){
		try{
			Ext.fly(this.canvas).remove();
		}
		catch(e){
			console.error(e);
		}
		delete this.selections;
	},

	createElement: function(tag,parent,cls,css,id){
		var el = document.createElement(tag);
		if(cls) { Ext.get(el).addCls(cls); }
		if(css) { el.setAttribute('style',css); }
		if(id){el.setAttribute('id',id);}
		parent.appendChild(el);
		return el;
	},

	createCanvas: function(){
		return this.createElement(
			'canvas',
			this.container,
			'search-highlight-object unselectable','position: absolute; pointer-events: none; top: 0; left: 0; z-index: 999',
			this.canvasId
			);
	},


	canvasResize: Ext.Function.createBuffered( function(){
		var c = Ext.get(this.canvas || this.canvasId),
			cont = Ext.get(this.ownerCmp.getIframe()),
			pos = cont.getXY(),
			size = cont.getSize();
		c.moveTo(pos[0], pos[1]);
		c.set({
			width: size.width,
			height: size.height
		});
		this.render();
	}, 100),

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
