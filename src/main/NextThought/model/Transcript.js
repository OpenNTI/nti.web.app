Ext.define('NextThought.model.Transcript', {
    extend: 'NextThought.model.Base',
    requires: [
        'NextThought.proxy.Rest'
    ],
	mimeType: 'application/vnd.nextthought.transcript',
    fields: [
        { name: 'Class', type: 'string', defaultValue: 'Transcript'},
        { name: 'RoomInfo', type: 'singleItem' },
        { name: 'Messages', type: 'arrayItem' },
        { name: 'NTIID', type: 'string' },
        { name: 'ContainerId', type: 'string' },
        { name: 'Contributors', type: 'auto' }
    ],
    proxy: {
        type: 'nti'
    },
    getModelName: function() {
        return 'Transcript';
    }
});
