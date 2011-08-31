Ext.define('NextThought.view.widgets.SelectionHighlight', {
    extend: 'NextThought.view.widgets.Widget',

	_sels: [],
	_canvas: null,
    _cont: null,

	constructor: function(selections, container, component){
		var me = this;
        me._cont = container;
		me._sels = selections;
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

	onResize : function(e){
        var c = Ext.get(this._canvas),
            cont = Ext.get(this._cont),
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

        this._canvas.width = this._canvas.width;
        var c = this._canvas,
            canvasXY = Ext.get(c).getXY();
            ctx = c.getContext("2d"),
            color = this._hexToRGBA(this._color);

        ctx.fillStyle = color;

        Ext.each(this._sels, function(sel){

            var s = sel.getClientRects(),
                l = s.length;

            var avgH = 0;
            Ext.each(s,function(v){
                avgH += v.height;
            });

            avgH /= s.length;

            for(var i=0; i<l; i++){
                var ac = this.adjustCoordinates(s[i], canvasXY);
                this.drawRect(ctx,ac);
            }
        }, this);
	},

    rectEquals: function(a, b) {
        return (a.width == b.width && a.height == b.height && a.left == b.left && a.top == b.top);
    },

	_hexToRGBA: function(hex) {
		if ('yellow' == hex) {
			hex = 'FFFF00';
		}

		var red = hex.substring(0, 2);
		var green = hex.substring(2, 4);
		var blue = hex.substring(4);

		return 'rgba(' + parseInt(red, 16) + ',' + parseInt(green, 16) + ',' + parseInt(blue, 16) +',.3)';
	},

	adjustCoordinates: function(rect,offsetToTrim){
		var r = rect,
			o = offsetToTrim,
            x = o[0],
            y = o[1];

		r.top -= y; r.left -= x;
		return {
			top: r.top-y,
			left: r.left-x,
			width: r.width,
			height: r.height,
			right: r.left-x+r.width,
			bottom: r.top-y+r.height
		};
	},
	
	
	drawRect: function(ctx, rect){
		ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
	}

});