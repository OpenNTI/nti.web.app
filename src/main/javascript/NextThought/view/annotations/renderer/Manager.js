Ext.define('NextThought.view.annotations.renderer.Manager',{
	singleton: true,

	events: new Ext.util.Observable(),
	registry: {},
	sorter: {},


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


	buildSorter: function(prefix){},


	render: function(prefix){
		if(this.rendering){
			this.events.on('finish',this.render,this,{single:true});
			console.warn('Render called while rendering...');
			return;
		}
		this.aboutToRender = false;
		this.rendering = true;
		this.events.fireEvent('rendering');
		this.sorter[prefix] = this.sorter[prefix] || this.buildSorter(prefix);
		this.registry[prefix] = Ext.Array.unique(this.registry[prefix]);

		if(this.sorter[prefix]){
			Ext.Array.sort(this.registry[prefix], this.sorter[prefix]);
		}
		Ext.each(Ext.Array.clone(this.registry[prefix]), function(o,i,a){
			try {
				var n = a[i+1],
					p = 'renderPriority',
					isLastOfAnchor = !n || o[p] !== n[p] || o.getSortValue()!==n.getSortValue() ;

				o.render(isLastOfAnchor);
			}
			catch(e){
				console.error(o.$className,Globals.getError(e));
			}
		});

		this.rendering = false;
		this.events.fireEvent('finish');
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
