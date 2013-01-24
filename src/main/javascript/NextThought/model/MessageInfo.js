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
        return Boolean(!this.getLink('flag') && !this.getLink('flag.metoo'));
    },

	hasBeenFlagged: function(){
		return Boolean(this.getLink('flag.metoo'));
	}
});
