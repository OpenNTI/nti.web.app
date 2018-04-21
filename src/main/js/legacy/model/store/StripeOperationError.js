const Ext = require('@nti/extjs');

require('./StripePurchaseError');


module.exports = exports = Ext.define('NextThought.model.store.StripeOperationError', {
	extend: 'NextThought.model.store.StripePurchaseError'
});
