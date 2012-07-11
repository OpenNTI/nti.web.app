Ext.define('NextThought.view.annotations.renderer.Manager',{
	singleton: true,

	requires: [
		'NextThought.util.Line'
	],

	events: new Ext.util.Observable(),
	registry: {},
	sorter: {},
	gutter: {},
	buckets: {},

	controlLineTmpl: Ext.DomHelper.createTemplate( '<div class="controlContainer"></div>' ).compile(),
	widgetLineTmpl: Ext.DomHelper.createTemplate( '<div class="widgetContainer"></div>' ).compile(),


	/**
	 * @constructor Inner class
	 */
	Bucket: function(){
		this.values = {};
		this.length = 0;

		this.free = function(){
			this.each(function(v,k,o){ delete o[k]; },this);
			Ext.Object.each(this,function(k,o,me){ delete me[k]; });
		};

		this.put = function(o,key){
			key = typeof key === 'number'? key : guidGenerator();
			if(this.values[key]){throw 'existing value';}
			this.values[key] = o;
			this.length += 1;
			return key;
		};

		this.each = function(cb,s){
			Ext.Object.each(this.values,function(key,value,o){
				Ext.callback(cb,s,[value,key,o]);
			});
		};

		this.get = function(key){ return this.values[key]; };
	},


	registerGutter: function(el, reader){
		var p = reader.prefix;
		if(!p){ Ext.Error.raise('Prefix required'); }
		if(this.gutter[p]){
			console.warn('replacing exisiting gutter?', this.gutter[p]);
		}
		this.gutter[p] = el;

		el.controls = el.down('.controls');
		el.widgets = el.down('.widgets');

		this.render(p);//renders wait for the gutter to exist
	},


	register: function(o){
		var p = o.prefix;
		if(!this.registry[p]){
			this.registry[p] = [];
		}
		this.registry[p].push(o);
		o.requestRender();
	},


	unregister: function(o){
		var p = o.prefix, r;
		r = this.registry[p];
		if(r){
			this.registry[p] = Ext.Array.remove(r,o);
			if(this.registry[p].legend===0){
				this.sorter[p] = null;
			}
		}
	},


	getReader: function(prefix){
		var cache = this.readerPanels, c;
		if(!cache ){ cache = this.readerPanels = {}; }

		c = cache[prefix];
		if(!c){
			c = cache[prefix] = ReaderPanel.get(prefix);
			c.on('destroy',function(){ delete cache[prefix]; });
		}

		return c;
	},


	getDoc: function(prefix){
		return this.getReader(prefix).getDocumentElement();
	},


	buildSorter: function(prefix){},


	clearBuckets: function(prefix){
		var g = this.gutter[prefix];
		g.controls.dom.innerHTML = '';
		g.widgets.dom.innerHTML = '';

		if( this.buckets[prefix] ){
			this.buckets[prefix].free();
		}
		this.buckets[prefix] = new this.Bucket();
	},


	getBucket: function(prefix, line){
		var lineInfo = LineUtils.findLine(line,this.getDoc(prefix));
		if(!lineInfo){
			console.error('could not resolve a line for '+prefix+' @'+line+'.');
			return;
		}

		var c = this.buckets[prefix],
			l = lineInfo.rect.top,//normalize lines
			b = c? c.get(l) : null;
		if(!b && c) {
			b = new this.Bucket();
			c.put(b,l);
			b.height = lineInfo.rect.height;
		}
		return b;
	},


	layoutBuckets: function(prefix){
		var r = this.getReader(prefix);
		var o = r.getAnnotationOffsets();
		var g = this.gutter[prefix];
		var b = this.buckets[prefix];
		var cT = this.controlLineTmpl;
		var wT = this.widgetLineTmpl;

		var width = o.gutter + o.contentLeftPadding;

		g.setWidth(width);
		g.controls.setLeft(width-50);
		g.widgets.setRight(50);

		b.each(function(line,y){

			line.controls = line.controls || cT.append(g.controls,[],true);
			line.widgets = line.widgets || wT.append(g.widgets,[],true);

			y = parseInt(y,10) + (Math.ceil(line.height/2)-18);

			(new Ext.CompositeElement([line.controls,line.widgets])).setTop(y);

			line.each(function(o){
				var w = o.getGutterWidget(line.length-1);
				var c = o.getControl();
				if( c ){ c.appendTo( line.controls ); }
				if( w ){ w.appendTo( line.widgets ); }
			});

			if(!line.controls.first()){ line.controls.remove(); }
			if(!line.widgets.first()){ line.widgets.remove(); }
		});
	},


	render: function(prefix){
		var me = this;
		if(me.rendering){
			console.warn('Render called while rendering...');
			me.events.on('finish',me.render,me,{single:true});
			return;
		}

		if(!me.gutter[prefix]){
			console.warn('no gutter');
			return;
		}

		if(!me.registry[prefix]){
			return;//nothing to do
		}

		me.aboutToRender = false;
		me.rendering = true;
		me.events.fireEvent('rendering');

		me.registry[prefix] = Ext.Array.unique(me.registry[prefix]);

		me.sorter[prefix] = me.sorter[prefix] || me.buildSorter(prefix);
		if(me.sorter[prefix]){
			Ext.Array.sort(me.registry[prefix], me.sorter[prefix]);
		}

		me.clearBuckets(prefix);

		Ext.each(Ext.Array.clone(me.registry[prefix]), function(o){
			try {
				var y = o.render() || -1,
					b = me.getBucket(prefix,y);
				if(b){
					b.put(o);
				}
			}
			catch(e){
				console.error(o.$className,Globals.getError(e));
			}
		});

		me.layoutBuckets(prefix);

		me.rendering = false;
		me.events.fireEvent('finish');
	}

}, function(){
	window.AnnotationsRenderer = this;

	var me = this,
		fn = this.render,
		timerId = {};

	this.render = (function() {
		return function(prefix) {
			if (timerId[prefix]) {
				clearTimeout(timerId[prefix]);
			}
			timerId[prefix] = setTimeout(function(){ fn.call(me, prefix); }, 100);
		};

	}());
});
