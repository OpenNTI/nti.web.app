Ext.define('NextThought.model.RoomInfo', {
    extend: 'NextThought.model.Base',
    requires: [
        'NextThought.model.FriendsList'
    ],
    idProperty: 'RoomId',
    fields: [
        { name: 'RoomId', type: 'string' },
        { name: 'Active', type: 'bool' },
        { name: 'Class', type: 'string', defaultValue: 'RoomInfo' },
        { name: 'MessageCount', type: 'int' },
        { name: 'Occupants', type: Ext.data.Types.USER_LIST}
    ],

    getModelName: function() {
        return 'RoomInfo';
    },

    getKey: function() {
        
    }
});