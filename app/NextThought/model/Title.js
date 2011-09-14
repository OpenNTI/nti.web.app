Ext.define('NextThought.model.Title', {
    extend: 'Ext.data.Model',
    idProperty: 'index',
    proxy: {
        type: 'ajax',
        url : _AppConfig.server.host + _AppConfig.server.library,
        reader: {
            type: 'json',
            root: 'titles'
        }
    },
    fields: [
        { name: 'Archive Last Modified', type: 'date', dateFormat: 'timestamp' },
        { name: 'archive', type: 'string' },
        { name: 'href', type: 'string' },
        { name: 'icon', type: 'string' },
        { name: 'index', type: 'string' },
        { name: 'installable', type: 'bool' },
        { name: 'root', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'version', type: 'string'}
    ]
});