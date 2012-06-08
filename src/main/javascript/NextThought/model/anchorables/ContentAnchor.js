/**
 * Content Anchor Class defines an anchorable node in the DOM, defined
 * by an id and a tagName.  both must match and be found or an anchor to be
 * valid.
 *
 * A ContentAnchor can be created via 2 means:
 *
 * 1) A DOM Node
 * 2) A JSON object
 */
Ext.define('NextThought.model.anchorables.ContentAnchor', {
	config: {
		tagName: '',
		domId: ''
	},
	constructor: function(o){
		//If we are given a dom element as input, pull the necessary parts and
		//create a config we can use to create this.
		if (o instanceof Node) {
			o = {tagName:o.tagName, domId:o.getAttribute('Id')};
		}

		//do a little cleaning up, uppercase tagName if we plan on matching tag name later
		if (o.tagName){o.tagName = o.tagName.toUpperCase();}

		this.initConfig(o);
	}
});