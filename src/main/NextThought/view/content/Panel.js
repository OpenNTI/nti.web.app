Ext.define('NextThought.view.content.Panel', {
	extend: 'Ext.panel.Panel',
	
	autoScroll:true,
	frame: false,
	border: false,
	defaults: {frame: false, border: false},

	initComponent: function(){
		this.addEvents('relayedout');
		this.callParent(arguments);

		this.bufferedDelayedRelayout = Ext.Function.createBuffered(
			Ext.Function.createDelayed(this.relayout, 100, this),
			100, this);
	},

	getContainerId: function(){
		return this.containerId;
	},
	
	relayout: function(){
		if (this.ownerCt) {
			this.ownerCt.doComponentLayout();
		}
		this.doComponentLayout();
		this.doLayout();
		this.fireEvent('relayedout', this);
	},


	
	getPathPart: function(path) {
		if(!path){
			return path;
		}
		return path.substring(0, path.lastIndexOf('/')+1);
	},
	
	
	
	
	getFilename: function(path) {
		if(!path){
			return path;
		}
		var b = path.split('/');
		return b[b.length-1];
	},
	
	
	
	getCurrentPath: function() {
		return this.getPathPart(window.location.pathname);
	},


	resolveBase: function(base) {
		//relative path
		if(base && base!=="" && (base === '.' || base[0]!=='/') && base.indexOf(':')<0) {
			var b = this.getCurrentPath();
			
			if(base.indexOf(b)!==0) {
				base = b+'/'+(base==='.'?'':base);
			}
			
		}
		//absolute paths (book content)
		else {
			base = $AppConfig.server.host + base;
		}
		
		//make sure this ends in a slash
		if(base && base[base.length-1] !== '/'){
			base = base + '/';
		}
		
		return base;
	}

	
});
