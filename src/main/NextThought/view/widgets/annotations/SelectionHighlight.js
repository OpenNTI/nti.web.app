Ext.define('NextThought.view.widgets.annotations.SelectionHighlight', {
    extend: 'NextThought.view.widgets.Widget',
    alias: 'annotations.SelectionHighlight',

	constructor: function(selections, container, component){
        this.callParent();
        Ext.apply(this, {
            _sels: selections || [],
            _canvas: null
        });

		var me = this;

        me._cnt = container;
        me._color = 'FFFF00';
        me._canvas =  me.createElement('canvas',container,'search-highlight-object unselectable','position: absolute; pointer-events: none;');
        me.render = Ext.Function.createBuffered(me.render,100,me,[true]);
        component.on('resize', me.onResize, me);
        me.onResize();
		return me;
	},

    cleanup: function(){
		Ext.get(this._canvas).remove();
		delete this._sels;
	},

	onResize : function(){
        var c = Ext.get(this._canvas),
            cont = Ext.get(this._cnt),
            pos = cont.getXY(),
            size = cont.getSize();
        c.moveTo(pos[0], pos[1]);
        c.setSize(size.width, size.height);
        this._canvas.width = size.width;
        this._canvas.height = size.height;
		this.render();
	},

	render: function(){
		if(!this._sels){
			return;
		}

        this._canvas.width = (this._canvas.width);
        var c = this._canvas,
            canvasXY = Ext.get(c).getXY(),
            ctx = c.getContext("2d");

        ctx.fillStyle = this._hexToRGBA(this._color);

        Ext.each(this._sels, function(sel){

            var s = sel.getClientRects(),
                l = s.length,
                i = 0,
                ac;

            for(; i<l; i++){
                ac = this.adjustCoordinates(s[i], canvasXY);
                this.drawRect(ctx,ac);
            }
        }, this);
	},

	_hexToRGBA: function(hex) {
		if ('yellow' == hex) {
			hex = 'FFFF00';
		}

		var red = hex.substring(0, 2),
		    green = hex.substring(2, 4),
		    blue = hex.substring(4);

		return 'rgba(' + parseInt(red, 16) + ',' + parseInt(green, 16) + ',' + parseInt(blue, 16) +',.3)';
	},

	adjustCoordinates: function(rect,offsetToTrim){
		var x = offsetToTrim[0],
            y = offsetToTrim[1];

		rect.top -= y; rect.left -= x;
		return {
			top: rect.top-y,
			left: rect.left-x,
			width: rect.width,
			height: rect.height,
			right: rect.left-x+rect.width,
			bottom: rect.top-y+rect.height
		};
	},
	
	
	drawRect: function(ctx, rect){
		ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
	}

});
