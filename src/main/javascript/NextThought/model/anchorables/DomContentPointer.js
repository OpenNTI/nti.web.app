Ext.define('NextThought.model.anchorables.DomContentPointer', {
	extends: [
		'NextThought.model.anchorables.ContentPointer'
	],
	config: {
		elementTagName: '',
		elementId: '',
		type: ''
	},
	validTypes: [
		'start',
		'end',
		'ancestor'
	],
	constructor: function(o){
		//If we are given a dom element as input, pull the necessary parts and
		//create a config we can use to create this.
		if (o.node) {
			o = {elementTagName:o.node.tagName, elementId:o.node.getAttribute('Id'), type:o.type};
		}

		//do a little cleaning up, uppercase tagName if we plan on matching tag name later
		if (o.elementTagName){o.elementTagName = o.elementTagName.toUpperCase();}

		this.validateTagName(o.elementTagName);
		this.validateId(o.elementId);
		this.validateType(o.type);

		this.initConfig(o);
	},


	validateType: function(t) {
		if (!t) {
			Ext.Error.raise('Must supply a type');
		}
		else if (!Ext.Array.contains(this.validTypes, t)){
			Ext.Error.raise('Type must be of the type ' + this.validTypes.join(',') + ', supplied ' + t);
		}
	},


	validateId: function(id) {
		if (!id){
			Ext.Error.raise('Must supply an Id');
		}
	},


	validateTagName: function(n) {
		if (!n){
			Ext.Error.raise('Must supply a tag name');
		}
	}

});