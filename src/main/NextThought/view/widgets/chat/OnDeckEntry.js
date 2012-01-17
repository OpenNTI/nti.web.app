Ext.define('NextThought.view.widgets.chat.OnDeckEntry', {
	extend: 'Ext.container.Container',
	alias: 'widget.on-deck-log-entry',

	requires: [
		'NextThought.util.AnnotationUtils',
		'NextThought.cache.IdCache'
	],

	renderTpl: new Ext.XTemplate(
		'<div class="x-on-deck-log-entry">',
			'<span class="buttons">',
				'<span class="script-to-chat"></span>',
			'</span>',
			'<div>',
				'<span class="body-text">{body}</span> ',
			'</div>',
		'</div>'
		),

	renderSelectors: {
		box: 'div.x-on-deck-log-entry',
		text: 'span.body-text'
	},

	initComponent: function(){
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
		me.renderData['body'] = AnnotationUtils.compileBodyContent(m);

		if(this.rendered){
		   me.text.update(me.renderData.body);
		}
	},

	click: function(event, target, eOpts){
		console.log('somebody clicked dis!');

		if (!this.box) return; //happens when a WB is clicked...

		target = Ext.get(target);
		var inBox = target && this.box.contains(target);
		if(inBox && target.hasCls('promote')){
			this.fireEvent('script-to-chat', this, null, null, null);
		}
	},

	getValue: function() {
		return this.message.get('body');
	},

	setValue: function() {
		//who cares, this is just here to appease the chat controller.
	}
});
