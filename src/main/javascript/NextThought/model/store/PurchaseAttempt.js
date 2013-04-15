Ext.define('NextThought.model.store.PurchaseAttempt', {
    extend: 'NextThought.model.Base',

    fields: [
        { name: 'Items', type: 'auto', persist: false },
        { name: 'State', type: 'string', persist: false },
        { name: 'Processor', type: 'string', persist: false },
        { name: 'StartTime', type: 'date', persist: false, dateFormat: 'timestamp', defaultValue: new Date() },
        { name: 'EndTime', type: 'date', persist: false, dateFormat: 'timestamp', defaultValue: new Date() },
        { name: 'ErrorMessage', type: 'string', persist: false },
        { name: 'Description', type: 'string', persist: false },
        { name: 'Quantity', type: 'int', persist: false },
        { name: 'InvitationCode', type: 'string', persist: false }
    ]
});
