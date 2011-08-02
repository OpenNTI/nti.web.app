
Ext.define('NextThought.view.content.Panel', {
	extend: 'Ext.panel.Panel',
	
	autoScroll:true,
	frame: false,
	border: false,
	defaults: {frame: false, border: false},
	
	activate: function() {
		this.relayout();
    },
    
    
    relayout: function(){
    	this.ownerCt.doComponentLayout();
    	//this.doLayout();
        //VIEWPORT.doComponentLayout();
    },
    
    
    _getPathPart: function(path) {
    	if(!path){
    		return path;
    	}
    	return path.substring(0, path.lastIndexOf('/')+1);
	},
	
	
	
	
    _getFilename: function(path) {
    	if(!path){
    		return path;
    	}
    	var b = path.split('/');
    	return b[b.length-1];
	},
	
	
	
    _getCurrentPath: function() {
    	return this._getPathPart(window.location.pathname);
	},


	_resolveBase: function(base) {   
	    //relative path
	    if(base && base!="" && (base == '.' || base[0]!='/') && base.indexOf(':')<0) {
	        var b = this._getCurrentPath();
	        
	        if(base.indexOf(b)!=0) {
	            base = b+'/'+(base=='.'?'':base);
	        }
	        
	    }
	    //absolute paths (book content)
	    else {
	        base = _AppConfig.server.host + base;
	    }
	    
	    //make sure this ends in a slash
	    if(base && base[base.length-1] != '/'){
	        base = base + '/';
	    }
	    
	    return base;
	}

    
});