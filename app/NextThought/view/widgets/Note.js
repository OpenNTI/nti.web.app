Ext.define('NextThought.view.widgets.Note', {
	extend: 'NextThought.view.widgets.Widget',

	_rec: null,
	_cmp: null,
	_menu: null,

	constructor: function(record, container, component){
		var d = Ext.query('.document-nibs',container);
		
		this._cmp = component;
		
		this._div = d.length>0? d[0] : this.createElement('div',container,'document-nibs');
		this._img = this.createImage(Ext.BLANK_IMAGE_URL,this._div,'action','width: 24px; height: 24px; background: yellow; position: absolute;');

		this._cmp.on('resize', this.onResize, this);
		Ext.EventManager.onWindowResize(this.onResize, this);
		
		//Ext.get(this._img).on('click',function(){ this.cleanup(); record.destroy(); }, this);
		
		//this.render();
		return this;
	},
	onResize : function(e){
		//this.render();
	},
	cleanup: function(){
		this._cmp.un('resize', this.onResize, this);
		Ext.EventManager.removeResizeListener(this.onResize, this);
		Ext.get(this._img).remove();
		delete this._rec;
	}
});