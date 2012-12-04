Ext.define('NextThought.model.MessageInfo', {
	extend: 'NextThought.model.Base',

	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	fields: [
		{ name: 'inReplyTo', type: 'string' },
		{ name: 'Status', type: 'string' },
		{ name: 'body', type: 'auto', defaultValue: [''] },
		{ name: 'channel', type: 'string' },
		{ name: 'recipients', type: 'auto' }
	],

    hasBeenModerated: function(){
        var flag = this.getLink('flag') || this.getLink('flag.metoo');
        if (!flag){return true;}
        return false;
    }
});
