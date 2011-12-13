Ext.define('NextThought.view.widgets.draw.Line', {
    extend: 'NextThought.view.widgets.draw.Shape',
    alias: 'widget.sprite-line',

    constructor: function(config){
        this.applyClipRect = false;

        var x1 = 0,
            y1 = 0,
            s = config.scale ? config.scale.x : 1,
            d = (config.rotate && config.rotate.degrees) ? Ext.draw.Draw.rad(config.rotate.degrees) : 0,
            x2 = s * Math.cos(d),
            y2 = s * Math.sin(d),
            c = Ext.clone(config),
            path = [];

        //delete rotate and scale since we've done this already, let system do translate
        delete c.rotate;
        delete c.scale;

        path.push(['M', x1, y1]);
        path.push(['L', x2, y2]);

        this.callParent([Ext.apply(c,{ type: 'path', path: path })]);
    },

    getShape: function(){
        return 'line';
    },

    toJSON: function(){
        function degrees(x0,y0, x1,y1){
            var dx	= (x1-x0),
                dy	= (y1-y0),
                a	= (dx<0? 180: dy<0? 360: 0);
            return ((180/Math.PI)*Math.atan(dy/dx)) + a;
        }
        
        function length(x,y,x1,y1){
            return Math.sqrt(Math.pow(x-x1,2)+Math.pow(y-y1,2));
        }

        var path = this.attr.path,
            x1 = path[0][1],
            y1 = path[0][2],
            x2 = path[1][1],
            y2 = path[1][2],
            r = length(x1, y1, x2, y2),
            a = degrees(x1, y1, x2, y2),
            m = this.matrix.clone(),
            matrix;

        //apply rotation and scaling back into transform:
        m.translate(x1, y1);
        m.rotate(a, 0, 0);
        m.scale(r, r, 0, 0);

        matrix = {
            'Class': 'CanvasAffineTransform',
            a : m.get(0,0),
            b : m.get(1,0),
            c : m.get(0,1),
            d : m.get(1,1),
            tx: m.get(0,2),
            ty: m.get(1,2)
        };

        return Ext.apply(
            {
                'Class' : 'CanvasPolygonShape',
                transform: Ext.clone(matrix)
            },
            {
                sides: 1,
                'strokeColor': Color.toRGB(this.stroke),
                'strokeOpacity' : 1, //TODO: once we have tools to adjust this, set
                'fillColor': Color.toRGB(this.fill),
                'fillOpacity': 1, //TODO: once we have tools to adjust this, set
                'strokeWidth': this['stroke-width']
            }
        );
    }
});
