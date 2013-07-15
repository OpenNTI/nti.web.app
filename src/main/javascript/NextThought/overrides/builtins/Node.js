Ext.define('NextThought.overrides.builtins.Node',{});
	//Patch-in features that might be missing.
(function(){
	window.Node = window.Node || function(){};

	Ext.applyIf(window.Node.prototype, {
		DOCUMENT_POSITION_DISCONNECTED: 1,
		DOCUMENT_POSITION_PRECEDING: 2,
		DOCUMENT_POSITION_FOLLOWING: 4,
		DOCUMENT_POSITION_CONTAINS: 8,
		DOCUMENT_POSITION_CONTAINED_BY: 16,
		DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32,
		TEXT_NODE: 3,


		getChildren: function (){
			if(this.children){
				return this.children;
			}
			var EA = Ext.Array;
			return EA.filter(
					EA.toArray(this.childNodes, 0, this.childNodes.length),
						function(i){
							return i && i.nodeType!==Node.TEXT_NODE;
						});
		}
	});
}());
