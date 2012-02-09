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
			locationProvider: Ext.getCmp('breadcrumb'),
			parent: container,
			ownerCmp: cmp,
			body: body,
			width: 45,
//			base: "",
			numberOfDots: 50,
			height: 0,
//			sectionHeights: [],
			diameter: 0,
			radius: 0,
			gap: 0,
			regions: [],
			offsetX: 0,
			offsetY: 0,
			canvas: (function(){
				var c = document.createElement('canvas');
				Ext.fly(c).set({ width: 45, height: 0, style: 'position: absolute; top: 0px; left: 0px;'});
				container.appendChild(c);
				return c;
			}())
		});
		
		var c = Ext.get(this.canvas),
			h = this.hoverHandler;

		c.on({ scope: this, click: this.clickHandler, mousemove: h });
		Ext.fly(body).on({scope:this, scroll:h, mousemove:h, mouseover:h, mouseout:h});

		//add tooltip
		this.toolTip = Ext.create('Ext.tip.ToolTip', {
			cls: 'tracker-tip-container',
			target: c,
			trackMouse: true,
			html: '',
			dismissDelay: 0
		});

		cmp.on('resize', this.onResize, this);
		
		this.locationProvider.on('change',this.onChangeLocation, this);
		Ext.EventManager.onWindowResize(this.onResize, this);
		return this;
	},


	destroy: function(){
		this.toolTip.destroy();
		delete this.toolTip;

		var b = Ext.get(this.body),
			c = Ext.get(this.canvas),
			h = this.hoverHandler;

		delete this.body;
		delete this.parent;
		delete this.canvas;

		c.un({scope:this, click:this.clickHandler, mousemove:h});
		b.un({scope:this, mousemove:h, mouseover:h, mouseout:h,scroll:h});

		this.ownerCmp.un('resize', this.onResize, this);
		this.locationProvider.un('change',this.onChangeLocation, this);
		Ext.EventManager.removeResizeListener(this.onResize, this);

		delete this.ownerCmp;
		delete this.locationProvider;
		c.remove();
	},
	
	
	onResize : function(e){
		this.offsetX = undefined;//reset
		this.hoverHandler(e);
	},


	onChangeLocation : function(loc){
		try{
			var c = this.canvas;
			c.width = c.height = 0;
			this.render(loc.toc, loc.location);
		}
		catch(e){
			console.error('Change Location Error:',e, arguments);
		}
	},
	
	
	scrollToPercent: function(toYPercent){
		
		var m = Ext.get(this.body).getHeight(),
			//t = this.body.scrollTop,
			h = this.body.scrollHeight-m;
		
		this.body.scrollTop = (h*toYPercent);
	},
	
	
	hoverHandler: function(e){
		var region = this.getRegion(e),
			current = this.locationProvider.getLocation();
		this.render(
			current.toc,
			current.location,
			region?region.rect:undefined);

		if (!region) {
			return;
		}

		//set current node in tooltip if it has changed
		try{
			this.renderToolTip(region.node);
		}
		catch (err) {
			console.error('error', err.message, err.stack);
		}

	},

	renderToolTip: function(node) {
		if ((!this.tipRendered && !node) || this.toolTip.currentNode === node) {
			return;
		}

		var current = this.locationProvider.getLocation(),
			book = current.book,
			host = $AppConfig.server.host,
			root = book.get('root'),
			bookIcon = book.get('icon'),
			data = {
				title: book.get('title'),
				label: node ? node.getAttribute('label') : '',
				icon: this.findChapterIcon(node)
			};

		if (data.icon) {
			data.icon = host + root + data.icon;
		}
		else {
			data.icon = host + bookIcon;
		}

		this.toolTip.currentNode = node;
		this.toolTip.update(this.toolTipTpl.apply(data));

		this.tipRendered = true;
	},

	findChapterIcon: function(node) {
		var nodeIcon = node ? node.getAttribute('icon') : null;

		if (!nodeIcon && node && node.parentNode) {
			return this.findChapterIcon(node.parentNode);
		}

		return nodeIcon;
	},
	
	clickHandler: function(e){
		var self = this,
			region = this.getRegion(e),
			current = this.locationProvider.getLocation(),
			book = current.book,
			n, f = region ? region.first : null;

		function scrollTo(){ self.scrollToPercent(f?0:region.position); }
			
		if(region) {
			if(region.active) {
				this.scrollToPercent(region.first? 0:region.position);
			}
			else {
				n = region.node.getAttribute('href');
				VIEWPORT.fireEvent('navigate',book, book.get('root')+n, scrollTo);
			}
		}
	},
	
	
	
	getRegion: function(e){
		var i, c, r, x, y, region;

		c = Ext.get(this.canvas);
		this.offsetX = c.getLeft();
		this.offsetY = c.getTop();

		if(!e){
			return null;
		}

		x = e.getX? e.getX()-this.offsetX : -1;
		y = e.getY? e.getY()-this.offsetY : -1;

		for( i = this.regions.length-1; i>=0; i--){
			r = this.regions[i].rect;
			if(x>=r.x && x<=(r.x+r.w) && y>=r.y && y<=(r.y+r.h)){
				region = this.regions[i];
				break;
			}
		}
		return region;
	},
	
	
	sum: function(a,f){
		var s=0,i=0,l=a.length;
		if(f) { for(i;i<l;i++){ s+=a[i][f]; } }
		else  { for(i;i<l;i++){ s+=a[i]; } }
		return s;
	},
	
	

	calculateSizes: function(current){
		this.height = Ext.get(this.parent).getHeight(true);

		this.canvas.width = this.width;
		this.canvas.height = this.height;
	
		var d,
			guessedHeight,
//			halfWidth = Math.ceil(this.width/2),
			padding = 30,
			info = this.getSectionCount(current),
			sum = this.sum(info,'height'),
			dots = this.numberOfDots,
			dotv = sum/dots,
			total = 0,
			lines = info.length+1;//top and bottom lines
			
		this.sections = info;
	
		Ext.each(info, function(s,i){
			var v = s.height/dotv;
			v = Math.round(v<1?1:v);
			info[i].height = v;
			total += v;
		});

		d = (this.height-padding)/(total+lines);

		this.diameter = Math.ceil( d );

		this.radius = this.diameter/2;
		this.radius = this.radius < 4.5 ? 4.5 : this.radius;

		this.gap = Math.floor(this.radius/2);
		this.gap = this.gap > 1 ? this.gap : 1;
		
		this.radius -= this.gap;
		this.diameter = this.radius * 2;

		guessedHeight = (total*(this.gap + this.diameter)) +
						(lines*(this.gap + this.radius + 3));
		
		this.top = Math.floor(this.height/2)-Math.floor(guessedHeight/2);
		this.top = this.top<5 ? 5 : this.top;
	},
	
	
	
	
	
	
	getSectionCount : function(n){
		var r=[],
			p=n? n.parentNode : null,
			a='NTIRelativeScrollHeight';
			
		

		if(n) {
			Ext.each(p.childNodes,function(v){
				if(v.nodeName==="#text"||!v.hasAttribute(a)) {
					return;
				}
				
				r.push({
					height: parseInt(v.getAttribute(a),10),
					node: v
				});
			});
		}
		
		if(!r.length){
			r.push({height:this.numberOfDots});
		}
		return r;
	},
	
	
	calculateCurrentPosition: function(){
		var m = Ext.get(this.body).getHeight(),
			t = this.body.scrollTop,
			h = this.body.scrollHeight-m,
			v = t/h;
		return isNaN(v)? 0 : v>1 ? 1 : v;
	},
	
	
	
	
	render: function(toc,current,activeRegion){
		if(!toc){
			this.clear();
			return;
		}
		this.calculateSizes(current);
		if(this.regions){
			delete this.regions;
		}
		this.regions = [];//reset regions
		
		var self = this,
			ctx = this.canvas.getContext("2d"),
			r = this.radius,
			x = r*2 + this.gap,
			g = r + this.gap,
			y = this.top,
			pos = this.calculateCurrentPosition(),
			normalColor = "rgba(127,127,127,.5)",
			scrollColor = "rgba(0,0,245,.5)",
			hoverColor = "rgba(0,255,0,.6)";
	
		ctx.fillStyle = normalColor;
		ctx.strokeStyle = normalColor;
		
		Ext.each(this.sections,function(s){
			var v = s.height,
				isCurentSection = current===s.node,
				i = 0,
				p, pp, isScroll, isHover;

			self.renderLineAt(ctx, r, y);
			for(i; i<v; i++) {
				y += (g+r);
				p = (i+1)/v;
				pp = i/v;
				isScroll = isCurentSection && pos <= p && pos >= pp;
				isHover = activeRegion && activeRegion.cy === y;

				ctx.fillStyle = isHover ? hoverColor : isScroll ? scrollColor : normalColor;
					
				self.regions.push({
					first: i===0,
					rect: self.renderDotAt(ctx, x, y),
					active: isCurentSection,
					position: p,
					node: s.node
				});

				//console.log(self.regions[self.regions.length - 1].rect);
			}
			
			y += (g+r);
		});
		this.renderLineAt(ctx, r, y);
	},
	
	
	
	
	
	clear: function(){
		var c = this.canvas, w = 'width';
		//reassign the same value to cause the canvas to clear and do it in a way that JSLint doesn't think you're crazy
		c[w] = c.width;
	},
	
	
	renderLineAt: function(ctx, x, y){
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(this.diameter*3, y);
		ctx.closePath();
		ctx.stroke();
	},
	
	renderDotAt: function(ctx, x, y){
		var r = {
			x: 0, 
			y: y-this.radius-(this.gap/2), 
			w: this.width, 
			h: this.diameter+(this.gap),
			cx: x,
			cy: y
		};
		
		// ctx.beginPath();
		// ctx.rect(r.x, r.y, r.w, r.h);
		// ctx.closePath();
		// ctx.fill();
		
		ctx.beginPath();
		ctx.arc((this.diameter*3)-this.radius-this.gap, y, this.radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		
		return r;
	}


});
