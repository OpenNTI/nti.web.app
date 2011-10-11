Ext.define('NextThought.model.RoomInfo', {
    extend: 'NextThought.model.Base',
    requires: [
        'NextThought.model.FriendsList'
    ],
    idProperty: 'ID',
    fields: [
        { name: 'ID', type: 'string' },
        { name: 'OID', type: 'string' },
        { name: 'ContainerId', type: 'string' },
        { name: 'Active', type: 'bool' },
        { name: 'Class', type: 'string', defaultValue: 'RoomInfo' },
        { name: 'MessageCount', type: 'int' },
        { name: 'Occupants', type: Ext.data.Types.USER_LIST}
    ],

    getModelName: function() {
        return 'RoomInfo';
    },

    getKey: function() {
                            //????
    }
});