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
    ],

	//TODO we want the pricing link on the actual purchasable
	getLink: function(rel){
		if(rel === 'get_purchase_attempt'){
			return getURL('/dataserver2/store/get_purchase_attempt');
		}
		return this.mixins.hasLinks.getLink.call(this, rel);
	}
});
