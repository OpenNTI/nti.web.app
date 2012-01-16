Ext.define('NextThought.view.widgets.chat.OnDeckEntry', {
	extend: 'Ext.container.Container',
	alias: 'widget.on-deck-log-entry',

	requires: [
		'NextThought.util.AnnotationUtils',
		'NextThought.cache.IdCache'
	],

	renderTpl: new Ext.XTemplate(
		'<div class="x-on-deck-log-entry">',
			'<div>',
				'<span class="body-text">{body}</span> ',
			'</div>',
		'</div>'
		),

	renderSelectors: {
		box: 'div.x-on-deck-log-entry',
		name: '.x-chat-log-entry span.name',
		text: 'span.body-text'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.update(this.message);
	},

	afterRender: function() {
		this.el.on('dblclick', this.sendToChat, this);
	},

	sendToChat: function() {
		this.fireEvent('script-to-chat', this, null, null, null);
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

	getValue: function() {
		return this.message.get('body');
	},

	setValue: function() {
		//who cares, this is just here to appease the chat controller.
	}
});
