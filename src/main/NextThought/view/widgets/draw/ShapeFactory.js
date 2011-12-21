Ext.define('NextThought.view.widgets.draw.ShapeFactory',
{
    alternateClassName: 'ShapeFactory',
    singleton: true,
    requires: [
        'NextThought.view.widgets.draw.Polygon',
        'NextThought.view.widgets.draw.Line',
        'NextThought.view.widgets.draw.Ellipse',
        'NextThought.util.Color'
    ],

    shapeTypeMap: {
        ellipse: 'ellipse',
        line: 'line',
        path: 'base',
        polygon: 'polygon',
        text: 'base'
    },

    strokeScalingRequired: function(j){
        //right now, only need to scale strokes for lines, which is a poly with 1 side
        return (j.Class === 'CanvasPolygonShape' && j.sides ===1);
    },

    toolDefaults: function(shape, x, y, strokeWidth, sides, selectedColor){
        strokeWidth = strokeWidth||2;
        sides = sides || 4;

        var cfg,
            d = {
            circle: {},
            polygon: { sides: sides },
            path: { type: 'path', fill: '#000000', translate: {} },
            line: { type: 'path', fill: '#000000', translate: {}, getShape:function(){return 'line';}},
            text: {
                type: 'text',
                text: 'Place holder text',
                font: '18px Arial'
            }
        };

        cfg = {
            translate: {x:x,y:y},
            'stroke-width': strokeWidth,
            stroke: selectedColor.stroke,
            fill: selectedColor.fill
        };

        return Ext.apply(cfg,d[shape]);
    },


    /**
     * Scale some JSON according to a scale factor
     *
     * @param factor
     * @param json
     * @returns modified json, or modifies passed in json if supplied
     */
    scaleJson: function(factor, json) {
        var k;

        if (this.strokeScalingRequired(json)) {
            json.strokeWidth *= factor;
        }

        for(k in json.transform){
            if(!json.transform.hasOwnProperty(k))continue;
            if(typeof json.transform[k] === 'number')
                json.transform[k] *= factor;
        }

        return json;
    },

    getSpriteClass: function(c, sides)
    {
        var m = {
            'CanvasPolygonShape': 'sprite-polygon',
            'CanvasCircleShape': 'sprite-ellipse'
        },
            s = m[c];

        //special case for lines
        if (s == m.CanvasPolygonShape && sides == 1)
            return 'sprite-line';
        return s;
    },

    //TODO : opacity for fill and stroke are available, hook them up.
    restoreShape: function m(shape, scaleFactor){
        var t = shape.transform,
            c = Color.cleanRGB(shape.fillColor) || Color.getColor(m.i=(m.i||-1)+1),
            p = Color.cleanRGB(shape.strokeColor) || c.getDarker(0.2),
            s;


        //scale up the matrix
        this.scaleJson(scaleFactor, shape);

        t = Ext.create('Ext.draw.Matrix',t.a,t.b,t.c,t.d,t.tx,t.ty).split();

        s = Ext.widget(this.getSpriteClass(shape.Class, shape.sides),{
            sides: shape.sides,
            'stroke-width': parseFloat(shape.strokeWidth),
            stroke: p.toString(),
            fill: c.toString(),
            translate: {
                x: t.translateX,
                y: t.translateY
            },
            scale:{
                x: t.scaleX,
                y: t.scaleY
            },
            rotate: {
                degrees: Ext.draw.Draw.degrees(t.rotate)
            }
        });

        this.relay(s, 'click');
        this.relay(s, 'dblClick');

        return s;
    },


    createShape: function(whiteboard, shapeName, x, y, sides, selectedColors, strokeWidth) {
        var sp = Ext.widget('sprite-'+this.shapeTypeMap[shapeName],
				this.toolDefaults(shapeName, x, y, strokeWidth, sides, selectedColors));
        sp.whiteboardRef = whiteboard;
        this.relay(sp, 'click');
        this.relay(sp, 'dblClick');
        return sp;
    },


    relay: function(sprite, event){
        if (!sprite.el) {
            sprite.on('render', Ext.bind(this.relay, this, Ext.toArray(arguments)), {single: true});
            return;
        }

        sprite.el.on(
            event,
            function(e){
                e.stopPropagation();
                e.preventDefault();
                this.fireEvent('sprite-'+event,sprite, this);
            },
            this);
    }

}, function(){
        window.ShapeFactory = this;
    }
);
