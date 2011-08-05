
Ext.define('NextThought.view.content.Reader', {
	extend:'NextThought.view.content.Panel',
	alias: 'widget.reader-panel',
	requires: ['NextThought.model.Highlight',
			   'NextThought.util.HighlightUtils'],
	cls: 'x-reader-pane',
	
	items: [{cls:'x-panel-reset', id:'NTIContent', margin: '0 0 0 50px'}],
	_highlights: [],
	_tracker: null,
	
    initComponent: function(){
   		this.callParent(arguments);
		this._contextMenu = Ext.create('Ext.menu.Menu', {
			items : [
				{
					text : 'Highlight',
					iconCls : 'edit'//,
					// hadler : edit
				},
				{
					text : 'Note',
					iconCls : 'edit'//,
					// hadler : edit
				}
			]
		});
        // this.setActive({},'/prealgebra/index.html',true);
    },

	render: function(){
		this.callParent(arguments);

		if(!this._tracker)
			this._tracker = Ext.create('NextThought.view.widgets.Tracker',this.el.dom, this.el.dom.firstChild);

		this.el.on('mouseup', this._onContextMenuHandler, this);
	},
	
	
	_onContextMenuHandler: function(e) {
		e.preventDefault();
		
		this.saveSelection();
		if(this._selection && !this._selection.collapsed) {
			this._contextMenu.showAt(e.getXY());
			this.addHighlight();
			//setTimeout(Ext.bind(this.restoreSelection, this), 10);
		}
	},
	
	
	clearHighlights: function(){
		Ext.each(this._highlights, function(v){
			v.cleanup();
			delete v;
		});
		
		this._highlights = [];
	},
	
	
	addHighlight: function(){
		if(!this._selection) {
			return;
		}
		
		//var me = this;
		
		var highlight = HighlightUtils.selectionToNTIHighlight(this._selection);
		highlight.set('ntiid', this._ntiid);
		console.log('the highlight', highlight);
		highlight.save({
			scope:this,
			success:function(){
				this._highlights.push(
					Ext.create('NextThought.view.widgets.Highlight', this._selection, this.items.get(0).el.dom.firstChild, this));
			}
		});	
	},
	
	
	saveSelection: function() {
		if (window.getSelection) {  // all browsers, except IE before version 9
			var selection = window.getSelection();
			if (selection.rangeCount > 0) {
				this._selection = selection.getRangeAt(0);
			}
		}
		else {
			if (document.selection) {   // Internet Explorer 8 and below
				var range = document.selection.createRange();
				this._selection = range.getBookmark();
			}
		}
	},


	restoreSelection: function() {
		if (window.getSelection) {  // all browsers, except IE before version 9
			window.getSelection().removeAllRanges();
			window.getSelection().addRange (this._selection);
		}
		else {
			if (document.body.createTextRange) {    // Internet Explorer 8 and below
				rangeObj = document.body.createTextRange();
				rangeObj.moveToBookmark(this._selection);
				rangeObj.select();
			}
		}
	},
	
	
    contextHightlightAction: function(e){
    	this.renderSelection();
    	this.contextAction(e);
    },
    
    contextNoteAction: function(e){
    	this.contextAction(e);
    },
    
    contextAction: function(e){
    	this.restoreSelection();
		this._selection = undefined;
    },
    
    
    _appendHistory: function(book, path) {
	    history.pushState(
	        {
	        	book: book,
	        	path: path
	        },
	        "title","#"
	        );
	},
	
	
	_restore: function(state) {
		
		this.setActive(state.book, state.path, true);
	},
    
    _getNodeFromXPath: function(xpath) {
    	try {
    		return document.evaluate(xpath, document).iterateNext();
    	}
    	catch(e) {
    		console.log(xpath, e);
    		return null;
    	}
    },
    _highlightsLoaded: function(records, operation, success) {
    	console.log(arguments);
    	Ext.each(records, 
    		function(r){
    			var endElement = this._getNodeFromXPath(r.get('endAnchor'));
    			var startElement = this._getNodeFromXPath(r.get('startAnchor'));
    			var range = document.createRange();
    		
    			try {
    				range.setEnd(endElement ? endElement : startElement, r.get('endOffset'));
    				range.setStart(startElement, r.get('startOffset'));
    				if (!startElement || range.collapsed) throw 'rageing tempor tantrum';
    				console.log('new range', range, r);
    			}
    			catch(e) {
    				console.log('destroying', r, e);
    				r.destroy();
    				return;
    			}
    			
    			this._highlights.push(
					Ext.create('NextThought.view.widgets.Highlight', range, this.items.get(0).el.dom.firstChild, this));
    		},
    		this
    	);
	},
    
    _loadContentAnnotatoins: function(ntiid){
    	this._ntiid = ntiid;
    	console.log('this is where we will pull in highlights/notes/etc for the page: '+ntiid);
		var store = Ext.create('Ext.data.Store',{model: 'NextThought.model.Highlight', proxy: {type: 'nti', collectionName: 'Highlights', ntiid: ntiid}});
		store.load({
			scope:this,
			callback:this._highlightsLoaded
		});
    },


    /**
     * Set the active page
     * @param {URL} path The page
     * @param {boolean} skipHistory Do not put this into the history
     */
    setActive: function(book, path, skipHistory, callback) {
        this.clearHighlights();
    	this.activate();
        this.active = path;

        if(!skipHistory)
        	this._appendHistory(book, path);
        
        var b = this._resolveBase(this._getPathPart(path)),
        	f = this._getFilename(path),
			p = this.items.get(0);
        
        
		Ext.getCmp('breadcrumb').setActive(book, f);
		
		//p.update('');
		//this.items.get(0).update('');
    	this.el.dom.firstChild.scrollTop = 0;
        
        Ext.Ajax.request({
			url: b+f,
			scope: this,
			disableCaching: true,
	        success: function(data){
	        	var c = data.responseText,
	        		rf= c.toLowerCase(),
	        		start = rf.indexOf(">", rf.indexOf("<body"))+1,
	        		end = rf.indexOf("</body"),
	        		head = c.substring(0,start),
	        		body = c.substring(start, end),
	        		css = /\<link.*href="(.*\.css)".*\>/gi,
	        		meta = /\<meta.*\>/gi,
	        		ntiid;
	        	
	        	css = head.match(css);
	        	meta = head.match(meta);
	        	
	        	css = css?css.join(''):'';
	        	meta = meta?meta.join(''):'';
	        	
	        	c = meta.concat(css).concat(body)
	        					
	        		 .replace(	/src=\"(.*?)\"/mig, 
				                function fixReferences(s,g) {
				                    return (g.indexOf("data:image")==0)?s:'src="'+b+g+'"';
				                })
	        		 .replace(	/href=\"(.*?)\"/mig, 
				                function fixReferences(s,g) {
				                	if(g.indexOf("#")>=0)console.log(g);
				                    return 'href="'+b+g+'"';
				                });
	        	
	        	p.update(c);
	            this.el.select('#NTIContent .navigation').remove();
	            this.el.select('#NTIContent .breadcrumbs').remove();
	            this.el.select('.x-reader-pane a[href]').on('click',this._onClick,this,{book: book, scope:this,stopEvent:true});
	            ntiid = this.el.select('meta[name=NTIID]').first().getAttribute('content');
	            
	            this.relayout();
	            
	            if( callback ){
	            	callback();
	            }
	            
	            this._loadContentAnnotatoins(ntiid);
	        },
	    error: function(){ 
	        console.log("Error");
	        }
	    });
    },
    
    
    
    _onClick: function(e, el, o){
    	
    	var h = _AppConfig.server.host,
    		r = el.href,
    		p = r.substring(h.length);
    	
    	this.setActive(o.book, p);
    }
});

