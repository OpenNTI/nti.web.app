Ext.define('NextThought.view.Window',{
	extend: 'Ext.window.Window',
	alias: 'widget.nti-window',

	cls: 'nti-window',
	ui: 'nti-window',
	plain: true,
	shadow: false,

	border: false,
	frame: false,
	header: false,

	constrainHeader: false,
	liveDrag: true,

	renderSelectors: {
		closeEl: 'img.tool.close',
		minimizeEl: 'img.tool.minimize'
	},


	constructor: function(config){
		delete config.title;
		return this.callParent([config]);
	},


	initDraggable: function() {
		this.dd = new Ext.util.ComponentDragger(this, {
			constrain: true,
			constrainDelegate: true,
			constrainTo: Ext.getBody(),
			el: this.el,
			delegate: '#' + Ext.escapeId(this.id) + '-body'
		});
		this.dd.on('beforedragstart',this.onBeforeDragStart,this);
		this.relayEvents(this.dd, ['dragstart', 'drag', 'dragend']);
	},


	onBeforeDragStart: function(dd,e){
		var id = e.getTarget('[id]',null,true),
			cmp;
		if(id){
			cmp = Ext.getCmp(id.id);
			if(cmp){
				console.log(cmp.is('button,field'));
				return !cmp.is('button,field');
			}
		}
		return true;
	},


	afterRender: function(){
		this.callParent(arguments);
		this.closeEl.on('click', this.close, this);
		this.minimizeEl.on('click', this.minimize, this);
		if(!this.minimizable){
			this.minimizeEl.remove();
		}
	}

}, function(){
	var p = this.prototype,
		r = p.renderTpl,
		tpl = [	'<div class="controls">',
					'<img src="{[Ext.BLANK_IMAGE_URL]}"	class="tool close">',
					'<img src="{[Ext.BLANK_IMAGE_URL]}" class="tool minimize">',
				'</div>' ];

	//if this is loaded after the inital classloader finishes, renderTpl will be an
	// XTemplate instance instead of a raw array of strings.
	if(Ext.isArray(r)){
		r = p.renderTpl = r.slice();
		r.push.apply(r, tpl);
	}
	else {
		p.renderTpl = new Ext.XTemplate(r.html,tpl.join(''));
	}
});
