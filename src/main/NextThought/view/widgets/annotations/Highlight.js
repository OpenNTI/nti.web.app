Ext.define('NextThought.view.widgets.annotations.Highlight', {
	extend:'NextThought.view.widgets.annotations.Annotation',
	requires:[
		'NextThought.util.Color'
	],


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
		this.self._eventRouter.fireEvent('render');
	},


    savePhantom: function(){
        if(!this._record.phantom)return;
        this.isSaving = true;
        this._record.save({
            scope: this,
            failure:function(){
                console.error('Failed to save highlight', this, this._record);
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
		item.on('afterrender',Ext.bind(this.updateMenuIcon, item, [o.getColor().toString()]));
	},

    getColor: function(){
		return this.self.getColor(this._userId);
    },


	_addNote: function(){
        this.savePhantom();
		this.getCmp().fireEvent('create-note',this._sel);
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

		if(!this._isVisible)return;

        var nib = Ext.get(this._img),
            r = this._sel.getBoundingClientRect(),
            s = this._sel.getClientRects(),
            c = this._canvas,
            p = this._parent ? this._parent : (this._parent = Ext.get(this._div.parentNode)),
            l = s.length,
            cXY = Ext.get(c).getXY(),
            color = this.getColor(),
            rgba = Color.toRGBA(color),
            rgb = color.toString();

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
            var	c = Ext.query('#canvas-highlight-container canvas')[0],
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

        getColor: function(userId){
            return Color.getColor( Ext.Array.indexOf(this._sources,userId) );
        }
    }

},
function(){
    this.render = Ext.Function.createBuffered(this.render,5,this);
	this._eventRouter.on('render', this.render, this);
});
