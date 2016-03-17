export default Ext.define('NextThought.model.Discussion', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'icon', type: 'string'},
		{name: 'label', type: 'string'},
		{name: 'title', type: 'string'}
	]
});
