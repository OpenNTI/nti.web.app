

Ext.define('NextThought.view.widgets.Tracker', {
	// extend: 'Ext.util.Observable',
	_base: "",
	_numberOfDots: 50,
	_parent: null,
	_body: null,
	_height: 0,
	width: 45,
	_sectionHeights: [],
	_diameter: 0,
	_radius: 0,
	_gap: 0,
	_regions: [],
	_offsetX: 0,
	_offsetY: 0,


	constructor: function(container, body){
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
		
		this._locationProvider.on('change',this._onChangeLocation, this);
		Ext.EventManager.onWindowResize(this._onResize, this);
		return this;
	},
	
	
	_onResize : function(e){
		this._offsetX = undefined;//reset
		this.hoverHandler(e);
	},


	_onChangeLocation : function(loc){
		try{
			var c = this._canvas;
			c.width = c.height = 0;
			
			if(loc.book){
				this.render(loc.book.firstChild, loc.location);
			}
		
		}
		catch(e){
			console.log(e);
		}
	},
	
	
	scrollToPercent: function(toYPercent){
		
		var m = Ext.get(this._body).getHeight(),
			t = this._body.scrollTop,
			h = this._body.scrollHeight-m,
			v = h*toYPercent;
		console.log(v);
		this._body.scrollTop = v;
	},
	
	
	hoverHandler: function(e){
		var region = this.getRegion(e),
			current = this._locationProvider.getLocation();
		 
		this.render(
			current.toc,
			current.location,
			region?region.rect:undefined);
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
				
					Ext.getCmp('myReader').setActive(
						book, 
						book.root+n, false, 
						function(){
							self.scrollToPercent(f?0:region.position);
						});
				 
			}
		}
	},
	
	
	
	getRegion: function(e){
		
		if(!this._offsetX){
			var c = Ext.get(this._canvas);
			this._offsetX = c.getLeft(false);
			this._offsetY = c.getTop(false);
		}
		
		var x = e.getX? e.getX()-this._offsetX : -1, 
			y = e.getY? e.getY()-this._offsetY-this._topPadding : -1,
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
		// this._width = 60;//Ext.get(this._parent).getWidth();
		this._topPadding = Ext.get(this._parent).getHeight()-this._height;
		
		this._canvas.width = this.width;
		this._canvas.height = this._height;
	
		var halfWidth = Math.floor(this.width/2),
			padding = this._topPadding,
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
		
		this._diameter = Math.floor(this._height/(total+lines));
		this._diameter = this._diameter>halfWidth? halfWidth : this._diameter;
			
		this._radius = Math.floor(this._diameter/2);
		this._radius = this._radius < 5 ? 5 : this._radius;
		
		this._gap = Math.floor(this._radius/2);
		this._gap = this._gap > 1 ? this._gap : 1;
		
		this._radius -= this._gap;
		this._diameter = this._radius * 2;
		
		var guessedHeight = (total*(this._gap+this._diameter))
						  + (lines*(this._gap+this._radius+3));
		
		this._top = Math.floor(this._height/2)-Math.floor(guessedHeight/2)-padding;
		this._top = this._top<5 ? 5 : this._top;
		
		//console.log(this);
	},
	
	
	
	
	
	
	getSectionCount : function(n){
		var r=[],
			p=n? n.parentNode : null,
			a='NTIRelativeScrollHeight';
			
		

		if(n) {
			Ext.each(p.childNodes,function(v){
				if(v.nodeName=="#text")return;
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
			var isCurentSection = current==s.node;
			
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
		ctx.arc(x, y, this._radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		
		return r;
	}


});