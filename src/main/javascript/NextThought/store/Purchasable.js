Ext.define('NextThought.store.Purchasable',{
	extend: 'NextThought.store.NTI',

	requires: [
	],

	autoLoad: false,

	model: 'NextThought.model.GenericObject',

	sorters: [
		function(a,b){
			var re = /NTI/;
			a = re.test(a.get('Provider')|| a.get('Title'));
			b = re.test(b.get('Provider')|| b.get('Title'));
			return a===b? 0 : a ? 1 : -1;//move NTI items to the end
		},
		{
			property: 'Featured',
			direction: 'DESC'
//		},{
//			property: 'courseName',
//			direction: 'DESC'
		},{
			property: 'Title',
			direction: 'DESC'
		}
	],

	proxy: {
		url: 'tbd',
		type: 'rest',
		reader: {
			type: 'nti',
			root: 'Items'
		},
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json'
		},
		model: 'NextThought.model.GenericObject'
	},

	/**
	 * Returns a Purchasable if we have one in the store that looks
	 * like it would contain the following ntiid.  This is sort of a weird
	 * place to put this b/c it requires library, toc, and purchasable inspection.
	 * We need it in a few places though.
	 *
	 * @param ntiid A content ntiid or sub ntiid (question ntiid)
	 */
	purchasableForContentNTIID: function(ntiid){
		var root = ContentUtils.getLineage(ntiid).last(),
			purchasable;

		//NOTE this again assumes 1-to-1 purchase to content root.
		//but what the hell

		if(!root){
			root = ParseUtils.bookPrefixIfQuestionNtiid(ntiid);
			root = root ? Library.findTitleWithPrefix(root) : null;
			root = root ? root.get('NTIID') : null;
		}

		if(root){
			purchasable = this.findBy(function(record){
				var items = record.get('Items') || [];
				return Ext.Array.contains(items, root);
			}, this);
		}
		return purchasable >= 0 ? this.getAt(purchasable) : null;
	}

});

