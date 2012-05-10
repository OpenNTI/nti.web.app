Ext.define('NextThought.view.classroom.ScriptEntry', {
	extend: 'Ext.container.Container',
	alias: 'widget.script-entry',

	requires: [
		'NextThought.util.Annotations',
		'NextThought.cache.IdCache'
	],

	renderTpl: new Ext.XTemplate(
		'<div class="x-script-entry">',
			'<span class="buttons">',
				'<span class="script-to-chat"></span>',
			'</span>',
			'<div>',
				'<span class="body-text">{body}</span> ',
			'</div>',
		'</div>'
		),

	promoted: false,

	renderSelectors: {
		box: 'div.x-script-entry',
		text: 'span.body-text'
	},

	initComponent: function(){
		this.addEvents('rendered-late');
		this.enableBubble('rendered-late');
		this.callParent(arguments);
		this.update(this.message);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.el.on('click', this.click, this);
	},

	update: function(m){
		var me = this, a;

		if (typeof(m) !== 'string') {
			me.message = m;
			me.messageId = IdCache.getIdentifier(m.getId());
		}
		else {
			a = Ext.isArray(m) ? m : [m];
			me.message = Ext.create('NextThought.model.MessageInfo', {body: a});
		}

		AnnotationUtils.compileBodyContent(m,function(content){
			me.renderData.body = content;
			if(me.rendered){
				me.text.update(me.renderData.body);
				me.fireEvent('rendered-late');
			}
		});
	},

	click: function(event, target, eOpts){
		if (!this.box){return;} //happens when a WB is clicked...

		target = Ext.get(target);
		var inBox = target && this.box.contains(target);
		if(inBox && target.hasCls('script-to-chat')){
			console.log('applying promoted class to entry here instead of when the msg comes back because script is currently dummied up, move once scripts are savable');
			this.setPromoted();
			this.fireEvent('script-to-chat', this, null, null, null);
		}
	},


	setPromoted: function() {
		this.addCls('promoted');
		this.promoted = true;
	},


	getValue: function() {
		return this.message.get('body');
	},

	setValue: function() {
		//who cares, this is just here to appease the chat controller.
	}
});
