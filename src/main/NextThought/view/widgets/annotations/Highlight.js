Ext.define('NextThought.view.widgets.annotations.Highlight', {
	extend:'NextThought.view.widgets.annotations.Annotation',
	

	constructor: function(selection, record, container, component){
		Ext.apply(this,{
            _sel: null,
            _canvas: null,
            _rgba: null,
            _color: null
        });

        var me = this;
		me.addEvents({
            colorchanged : true
        });
        me.callParent([record, container, component,'resources/images/charms/highlight-white.png']);
		me._sel = selection;

		me._canvas = me._createCanvas();
		me.requestRender = Ext.Function.createDelayed(me.requestRender, 10, me);
        me.self._eventRouter.on('render',me.requestRender, me);

        me._updateColor();
        return me;
	},
	
	_createCanvasContainer: function(id){
		var e = Ext.get(id),
			n = e ? e.dom : this.createElement('div',this._cnt,'document-highlights unselectable'),
			p = n.parentNode;
		n.setAttribute('id',id);
		p.appendChild(n);
//        p.insertBefore(n,p.firstChild);
		return Ext.get(n);
	},

    _createCanvas: function(){
        var cont = this._createCanvasContainer('canvas-highlight-container'),
            c = cont.query('canvas')[0];

        if(!c){
            c = this.createElement(
                'canvas',
                cont.dom,
                'highlight-object unselectable','position: absolute; pointer-events: none;');
            this._cmp.on('resize', this.canvasResize, this);
        }
        return c;
    },

    canvasResize: function(){
        var c = Ext.get(this._canvas),
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
		var c = Ext.get(this._canvas);
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
		item.on('afterrender',Ext.bind(this.updateMenuIcon, item, [o._color]));
		o.on('colorchanged', this.updateMenuIcon, item);
	},
	
	_updateColor: function() {
		this._color = this._record.get('color');
		if ('yellow' == this._color) {
			this._color = 'FFFF00';
		}
		this._rgba = this._hexToRGBA(this._color);

		Ext.get(this._img).setStyle('background', '#' + this._color);
        this.self._eventRouter.fireEvent('render');
	},
	
	_colorSelected: function(colorPicker, color) {
		this._record.set('color', color);
		this._updateColor();
		this._record.save();	
		this.fireEvent('colorchanged', color);	
	},
	
	
	_addNote: function(){
        this.savePhantom();
		this._cmp.fireEvent('create-note',this._sel);
	},

	updateMenuIcon: function(color) {
		var img = this.el.select('img.x-menu-item-icon').first()
		if(img){
			img.setStyle('background', '#'+color);
		}
	},
	
	cleanup: function(){
		this.callParent(arguments);
		delete this._sel;
        this.self._eventRouter.un('render',this.requestRender, this);
        this.self._eventRouter.fireEvent('render');
	},
	
	
	onResize : function(e){
        this.requestRender();
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

        var r = this._sel.getBoundingClientRect(),
            s = this._sel.getClientRects(),
            c = this._canvas,
            p = this._parent ? this._parent : (this._parent = Ext.get(this._div.parentNode)),
            l = s.length,
            cXY = Ext.get(c).getXY();

        if(!r){
            return;
        }

        //move nib
        Ext.get(this._img).moveTo(p.getLeft(), r.top);

        //stage draw
        var avgH = 0;
        Ext.each(s,function(v){ avgH += v.height; });
        avgH /= l;

        for(var i=0; i<l; i++){
            if(s[i].right == r.right && s[i].height>avgH) continue;
            this.self.enqueue(this.drawRect(this.adjustCoordinates(s[i],cXY), this._rgba));
        }

        this.self.render();//buffered
    },



    statics : {
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
        }
    }

},
function(){
    this.render = Ext.Function.createBuffered(this.render,10,this);
});
