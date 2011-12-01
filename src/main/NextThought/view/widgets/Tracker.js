Ext.define('NextThought.view.widgets.Tracker', {
	alias: 'widget.tracker',

    toolTipTpl: new Ext.XTemplate(
        '<div class="tracker-tip">',
            '<img src="{icon}" width=32 height=32"/>',
            '<div>',
                '<span class="tracker-tip-title">{title}</span> ',
                '<span class="tracker-tip-label">{label}</span>',
            '</div>',
        '</div>',
        {
            compile:true
        }),

    constructor: function(cmp,container, body){
        Ext.apply(this,{
            width: 45,
            _base: "",
            _numberOfDots: 50,
            _height: 0,
            _sectionHeights: [],
            _diameter: 0,
            _radius: 0,
            _gap: 0,
            _regions: [],
            _offsetX: 0,
            _offsetY: 0,
            _cmp: cmp
        });


        this._locationProvider = Ext.getCmp('breadcrumb');
		this._parent = container;
		this._body	 = body;
		this._canvas = document.createElement('canvas');
		this._canvas.setAttribute('width', this.width);
		this._canvas.setAttribute('height', this._height);
		this._canvas.setAttribute('style','position: absolute; top: 0px; left: 0px;');
		container.appendChild(this._canvas);
		
		var c = Ext.get(this._canvas),
			e = Ext.get(container),
			b = Ext.get(body),
			h = this.hoverHandler;

		b.on('scroll', h, this);
		c.on('click', this.clickHandler,this);
		c.on('mousemove', h, this);
		b.on('mousemove', h, this);
		b.on('mouseover', h, this);
		b.on('mouseout', h, this);

        //add tooltip
        this.toolTip = Ext.create('Ext.tip.ToolTip', {
            cls: 'tracker-tip-container',
            target: c,
            trackMouse: true,
            html: '',
            dismissDelay: 0
        });

		cmp.on('resize', this._onResize, this);
		
		this._locationProvider.on('change',this._onChangeLocation, this);
		Ext.EventManager.onWindowResize(this._onResize, this);
		return this;
	},


	destroy: function(){
		this.toolTip.destroy();
		delete this.toolTip;

		var b = Ext.get(this._body),
			c = Ext.get(this._canvas),
			h = this.hoverHandler;

		delete this._body;
		delete this._parent;
		delete this._canvas;

		c.un('click', this.clickHandler, this);
		c.un('mousemove', h, this);

		b.un('mousemove', h, this);
		b.un('mouseover', h, this);
		b.un('mouseout', h, this);
		b.un('scroll', h, this);

		this._cmp.un('resize', this._onResize, this);
		this._locationProvider.un('change',this._onChangeLocation, this);
		Ext.EventManager.removeResizeListener(this._onResize, this);

		delete this._cmp;
		delete this._locationProvider;
		c.remove();
	},
	
	
	_onResize : function(e){
		this._offsetX = undefined;//reset
		this.hoverHandler(e);
	},


	_onChangeLocation : function(loc){
		try{
			var c = this._canvas;
			c.width = c.height = 0;
			this.render(loc.toc, loc.location);
		}
		catch(e){
			console.error('Change Location Error:',e, arguments);
		}
	},
	
	
	scrollToPercent: function(toYPercent){
		
		var m = Ext.get(this._body).getHeight(),
			t = this._body.scrollTop,
			h = this._body.scrollHeight-m,
			v = h*toYPercent;
		
		this._body.scrollTop = v;
	},
	
	
	hoverHandler: function(e){
		var region = this.getRegion(e),
			current = this._locationProvider.getLocation();
		this.render(
			current.toc,
			current.location,
			region?region.rect:undefined);

        if (!region) return;
        
        //set current node in tooltip if it has changed
        try{
            this.renderToolTip(region.node);
        }
        catch (err) {
            console.error('error', err.message, err.stack);
        }

	},

    renderToolTip: function(node) {
        if ((!this.tipRendered && !node) || this.toolTip.currentNode == node) return;

        var current = this._locationProvider.getLocation(),
            book = current.book,
            host = _AppConfig.server.host,
            root = book.get('root'),
            bookIcon = book.get('icon'),
            data = {
                title: book.get('title'),
                label: node ? node.getAttribute('label') : '',
                icon: this.findChapterIcon(node)
            };

        if (data.icon) data.icon = host + root + data.icon;
        else data.icon = host + bookIcon;

        this.toolTip.currentNode = node;
        this.toolTip.update(this.toolTipTpl.apply(data));

        this.tipRendered = true;
    },

    findChapterIcon: function(node) {
        var nodeIcon = node ? node.getAttribute('icon') : null;

        if (!nodeIcon && node && node.parentNode)
            return this.findChapterIcon(node.parentNode);

        return nodeIcon;
    },
	
	clickHandler: function(e){
		var self = this,
            region = this.getRegion(e),
			current = this._locationProvider.getLocation(),
			book = current.book,
			ctx = this._canvas.getContext("2d");
			
		if(region) {
            if(region.active) {
				this.scrollToPercent(region.first? 0:region.position);
			}
			else {
				var n = region.node.getAttribute('href'),
					f = region.first;

                VIEWPORT.fireEvent('navigate',book, book.get('root')+n, scrollTo);

                function scrollTo(){
                    self.scrollToPercent(f?0:region.position);
                }
				 
			}
		}
	},
	
	
	
	getRegion: function(e){
		if(!this._offsetX){
			var c = Ext.get(this._canvas);
			this._offsetX = c.getLeft();
			this._offsetY = c.getTop();
		}
		if(!e){
			return null;
		}
		var x = e.getX? e.getX()-this._offsetX : -1, 
			y = e.getY? e.getY()-this._offsetY : -1,
			region = null;
			
		Ext.each(this._regions,function(v,i){
			var r = v.rect;
			if(x>=r.x&&x<=(r.x+r.w) && y>=r.y&&y<=(r.y+r.h)){
				region = v;
				return false;
			}
		},this);

		return region;
	},
	
	
	_sum: function(a,f){
		var s=0,i=0,l=a.length;
		if(f) for(i;i<l;s+=a[i++][f]);
		else  for(i;i<l;s+=a[i++]);
		return s;
	},
	
	

	calculateSizes: function(current){
		this._height = Ext.get(this._parent).getHeight(true);

		this._canvas.width = this.width;
		this._canvas.height = this._height;
	
		var halfWidth = Math.ceil(this.width/2),
            padding = 30,
			info = this.getSectionCount(current),
			sum = this._sum(info,'height'),
			dots = this._numberOfDots,
			dotv = sum/dots,
			total = 0,
			lines = info.length+1;//top and bottom lines
			
		this._sections = info;
	
		Ext.each(info, function(s,i){
			var v = s.height/dotv;
			v = Math.round(v<1?1:v);
			info[i].height = v;
			total += v;
		});

        var d = (this._height-padding)/(total+lines);

		this._diameter = Math.ceil( d );

		this._radius = this._diameter/2;
        this._radius = this._radius < 4.5 ? 4.5 : this._radius;

		this._gap = Math.floor(this._radius/2);
		this._gap = this._gap > 1 ? this._gap : 1;
		
		this._radius -= this._gap;
		this._diameter = this._radius * 2;

		var guessedHeight = (total*(this._gap+this._diameter))
						  + (lines*(this._gap+this._radius+3));
		
		this._top = Math.floor(this._height/2)-Math.floor(guessedHeight/2);
		this._top = this._top<5 ? 5 : this._top;
	},
	
	
	
	
	
	
	getSectionCount : function(n){
		var r=[],
			p=n? n.parentNode : null,
			a='NTIRelativeScrollHeight';
			
		

		if(n) {
			Ext.each(p.childNodes,function(v){
				if(v.nodeName=="#text"||!v.hasAttribute(a))return;
				
				r.push({
					height: parseInt(v.getAttribute(a),10),
					node: v
				});
			});
		}
		
		if(!r.length){
			r.push({height:this._numberOfDots});
		}
		return r;
	},
	
	
	calculateCurrentPosition: function(){
		var m = Ext.get(this._body).getHeight(),
			t = this._body.scrollTop,
			h = this._body.scrollHeight-m,
			v = t/h;
		return v==NaN? 0 : v>1 ? 1 : v;
	},
	
	
	
	
	render: function(toc,current,activeRegion){
		if(!toc){
			this.clear();
			return;
		}
		this.calculateSizes(current);
		if(this._regions){
			delete this._regions;
		}
		this._regions = [];//reset regions
		
		var self = this,
			ctx = this._canvas.getContext("2d"),
			r = this._radius,
			x = r*2 + this._gap,
			g = r + this._gap,
			y = this._top,
			pos = this.calculateCurrentPosition(),
			normalColor = "rgba(127,127,127,.5)",
			scrollColor = "rgba(0,0,245,.5)",
			hoverColor = "rgba(0,255,0,.6)";
	
		ctx.fillStyle = normalColor;
		ctx.strokeStyle = normalColor;
		
		Ext.each(this._sections,function(s){
			var v = s.height;
			var isCurentSection = current===s.node;

			self.renderLineAt(ctx, r, y);
			for(var i=0; i<v; i++) {
				y += (g+r);
		
				var p = (i+1)/v,
					pp = i/v,
					isScroll = isCurentSection && pos <= p && pos >= pp,
					isHover = activeRegion && activeRegion.cy == y;
				
				
				ctx.fillStyle = isHover ? hoverColor : isScroll ? scrollColor : normalColor;
					
				self._regions.push({
					first: i==0,
					rect: self.renderDotAt(ctx, x, y),
					active: isCurentSection,
					position: p,
					node: s.node
				});
			}
			
			y += (g+r);
		});
		this.renderLineAt(ctx, r, y);
	},
	
	
	
	
	
	clear: function(){
		this._canvas.width = this._canvas.width;
	},
	
	
	renderLineAt: function(ctx, x, y){
		ctx.beginPath();
		ctx.moveTo(x, y);
	  	ctx.lineTo(this._diameter*3, y);
	  	ctx.closePath();
		ctx.stroke();
	},
	
	renderDotAt: function(ctx, x, y){
		var r = {
			x: 0, 
			y: y-this._radius-(this._gap/2), 
			w: this.width, 
			h: this._diameter+(this._gap),
			cx: x,
			cy: y
		};
		
		// ctx.beginPath();
		// ctx.rect(r.x, r.y, r.w, r.h);
		// ctx.closePath();
		// ctx.fill();
		
		ctx.beginPath();
		ctx.arc((this._diameter*3)-this._radius-this._gap, y, this._radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		
		return r;
	}


});
