Ext.define('NextThought.view.widgets.annotations.Highlight', {
	extend:'NextThought.view.widgets.annotations.Annotation',
	

	constructor: function(selection, record, container, component){
		var me = this,
            userId= record.get('Creator') || _AppConfig.userObject.getId();

        me.callParent([record, container, component,'resources/images/charms/highlight-white.png']);

        Ext.apply(me,{
            _sel: selection,
            _canvas: me._createCanvas(),
            _userId: userId
        });


		me.requestRender = Ext.Function.createDelayed(me.requestRender, 10, me);
        me.self.addSource(userId);
        me.self._eventRouter.on('render',me.requestRender, me);
        me.self._eventRouter.fireEvent('render');
        return me;
	},
	
	_createCanvasContainer: function(id){
		var e = Ext.get(id),
			n = e ? e.dom : this.createElement('div',this._cnt,'document-highlights'),
			p = n.parentNode;
		n.setAttribute('id',id);
		p.appendChild(n);
		return Ext.get(n);
	},

    _createCanvas: function(){
        var cont = this._createCanvasContainer('canvas-highlight-container'),
            c = cont.query('canvas')[0];

        if(!c){
            c = this.createElement(
                'canvas',
                cont.dom,
                'highlight-object','position: absolute; pointer-events: none;');
            this._cmp.on('resize', this.canvasResize, this);
			this.canvasResize();
        }
        return c;
    },

    canvasResize: function(){
        var c = Ext.get(this._canvas || Ext.query('#canvas-highlight-container canvas')[0]),
            cont = Ext.get(this._cnt),
            pos = cont.getXY(),
            size = cont.getSize();
        c.moveTo(pos[0], pos[1]);
        c.setSize(size.width, size.height);
        c.set({
            width: size.width,
            height: size.height
        });
    },
	
	visibilityChanged: function(show){
		this.callParent(arguments);
		//show? c.show() : c.hide();
	},


    savePhantom: function(){
        if(!this._record.phantom)return;
        this.isSaving = true;
        this._record.save({
            scope: this,
            failure:function(){
                console.log('Failed to save highlight', this, this._record);
                this.cleanup();
                delete this;
            },
            success:function(newRecord){
                this._record.fireEvent('updated', newRecord);
                this._record = newRecord;
            }
        });
    },


    updateMenuIcon: function(color) {
        var img = this.el.select('img.x-menu-item-icon').first()
        if(img){
            img.setStyle('background', color);
        }
    },


	_buildMenu: function(){
		var items = [],r = this._record;
		if(this._isMine) {
			items.push({
                    text : (r.phantom?'Save':'Remove')+' Highlight',
                    handler: Ext.bind(r.phantom? this.savePhantom : this.remove, this)
                });
		}
		
		items.push({
			text : 'Add a Note',
			handler: Ext.bind(this._addNote, this)
		});
		
		return this.callParent([items]);
	},
	
	_menuItemHook: function(o,item, menu){
		item.on('afterrender',Ext.bind(this.updateMenuIcon, item, [o._colorToRGB(o.getColor())]));
	},

    getColor: function(){
		return this.self.getColor(this._userId);
    },

    _colorToRGBA: function(color, alpha) {
        var r = color.r, g = color.g, b = color.b;

        if (typeof color == 'string') {
            if(!/^[0-9A-F]+$/i.text(color))
                color = 'FFFF00';

            r = parseInt(color.substring(0, 2), 16);
            g = parseInt(color.substring(2, 4), 16);
            b = parseInt(color.substring(4), 16);
        }

        return Ext.String.format('rgba({0},{1},{2},{3})', r,g,b,alpha||'.3');
    },


    _colorToRGB: function(color){
        var r = color.r,
            g = color.g,
            b = color.b;

        return Ext.String.format('rgb({0},{1},{2})', r,g,b);
    },


	_addNote: function(){
        this.savePhantom();
		this._cmp.fireEvent('create-note',this._sel);
	},


	cleanup: function(){
		this.callParent(arguments);
		delete this._sel;
        this.self._eventRouter.un('render',this.requestRender, this);
        this.self._eventRouter.fireEvent('render');
		this.self.render();
	},
	
	
	onResize : function(e){
        this.requestRender();
	},
	

    adjustCoordinates: function(rect,offsetToTrim){
        var r = rect,
            o = offsetToTrim,
            x = o[0] ? o[0] : o.left,
            y = o[1] ? o[1] : o.top;

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
	
	
	drawRect: function(rect, fill){
        return function(ctx){
            ctx.fillStyle = fill;
		    ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
        }
	},


    requestRender: function(){
        if(!this._sel){
            this.cleanup();
            return;
        }

        var nib = Ext.get(this._img),
            r = this._sel.getBoundingClientRect(),
            s = this._sel.getClientRects(),
            c = this._canvas,
            p = this._parent ? this._parent : (this._parent = Ext.get(this._div.parentNode)),
            l = s.length,
            cXY = Ext.get(c).getXY(),
            color = this.getColor(),
            rgba = this._colorToRGBA(color),
            rgb = this._colorToRGB(color);

        if(!r){
            return;
        }

        //move nib
        nib.moveTo(p.getLeft(), r.top);
        nib.setStyle('background', rgb);

        //stage draw
        var avgH = 0;
        Ext.each(s,function(v){ avgH += v.height; });
        avgH /= l;

        for(var i=0; i<l; i++){
            if(s[i].right == r.right && s[i].height>avgH) continue;
            this.self.enqueue(this.drawRect(this.adjustCoordinates(s[i],cXY), rgba));
        }

        this.self.render();//buffered
    },


    statics : {
        _sources : [],
        _eventRouter: new Ext.util.Observable(),
        _queue : [],

        enqueue: function(op){
            this._queue.push(op);
        },

        render: function(){
            var	c = this._canvas = (this._canvas || Ext.query('#canvas-highlight-container canvas')[0]),
                ctx = c.getContext("2d");
            //reset the context

            c.width = c.width;

            while(this._queue.length){
                (this._queue.pop())(ctx);
            }
        },

        addSource: function(userId){
			if(userId && !Ext.Array.contains(this._sources, userId)){
                this._sources.push(userId);
                Ext.Array.sort(this._sources);

                //keep the logged in user at index 0
                var id = _AppConfig.userObject.getId();
                Ext.Array.remove(this._sources,id);
                this._sources.unshift(id);
            }
        },

        getColorIndex: function(userId){
            return Ext.Array.indexOf(this._sources,userId);
        },

        /**
         * http://ridiculousfish.com/blog/posts/colors.html
         * @param idx
         */
        hue: function(idx) {
           /*
            * Here we use 31 bit numbers because JavaScript doesn't have a 32 bit
            * unsigned type, and so the conversion to float would produce a negative
            * value.
            */
           var bitcount = 31;

           /* Reverse the bits of idx into ridx */
           var ridx = 0, i = 0;
           for (i=0; i < bitcount; i++) {
              ridx = (ridx << 1) | (idx & 1);
              idx >>>= 1;
           }

           /* Divide by 2**bitcount */
           var hue = ridx / Math.pow(2, bitcount);

           /* Start at .6 (216 degrees) */
           return (hue + .166) % 1;
        },

        getColor: function(idx){
			if(typeof idx == 'string'){
				idx = this.getColorIndex(idx);
			}

            var degrees = Math.round(this.hue(idx) * 360);
            //console.log('degrees', degrees);
            return hsl2rgb(degrees, 100, 50);

            /*
            HSL to RGB function sourced from:
            http://www.codingforums.com/showpost.php?s=acaa80143f9fa9f2bb768131c14bfa3b&p=54172&postcount=2
             */
            function hsl2rgb(h, s, l) {
            	var m1, m2, hue;
            	var r, g, b
            	s /=100;
            	l /= 100;
            	if (s == 0)
            		r = g = b = (l * 255);
            	else {
            		if (l <= 0.5)
            			m2 = l * (s + 1);
            		else
            			m2 = l + s - l * s;
            		m1 = l * 2 - m2;
            		hue = h / 360;
            		r = HueToRgb(m1, m2, hue + 1/3);
            		g = HueToRgb(m1, m2, hue);
            		b = HueToRgb(m1, m2, hue - 1/3);
            	}
            	return {r: r, g: g, b: b};
            }

            function HueToRgb(m1, m2, hue) {
            	var v;
            	if (hue < 0)
            		hue += 1;
            	else if (hue > 1)
            		hue -= 1;

            	if (6 * hue < 1)
            		v = m1 + (m2 - m1) * hue * 6;
            	else if (2 * hue < 1)
            		v = m2;
            	else if (3 * hue < 2)
            		v = m1 + (m2 - m1) * (2/3 - hue) * 6;
            	else
            		v = m1;

            	return Math.round(255 * v);
            }
        }
    }

},
function(){
    this.render = Ext.Function.createBuffered(this.render,5,this);
});
