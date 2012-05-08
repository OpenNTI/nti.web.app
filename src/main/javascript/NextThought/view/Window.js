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

	liveDrag: true,

	renderSelectors: {
		closeEl: 'img.tool.close',
		minimizeEl: 'img.tool.minimize'
	},

	initDraggable: function() {
		this.dd = new Ext.util.ComponentDragger(this, {
			constrain: true,
			constrainDelegate: true,
			constrainTo: Ext.getBody(),
			el: this.el,
			delegate: '#' + Ext.escapeId(this.id) + '-body'
		});
		this.relayEvents(this.dd, ['dragstart', 'drag', 'dragend']);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.closeEl.on('click', this.close, this);
		this.minimizeEl.on('click', this.minimize, this);
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
