Ext.define('NextThought.overrides.Ext',{
	override: 'Ext'
},function(){

	var get = Ext.getElementById;

	/**
	 *  This is not to be confused with document.getElementById.  Ext has a periodic task that checks that cached
	 *  elements are still present, and if not cleans their registered event listeners and destroys the associated cache
	 *  entries.
	 *
	 *  This is all fine and desired. However, their implementation does not account for nodes accross iframe boundries.
	 *
	 *  This patch is intended to make the garbage collector see the objects in various iframes as well as the host
	 *  document.
	 *
	 *  Caveat:
	 *
	 *  This function on the Ext object is only used in two places in the entire Ext framework. 1) to determine a node's
	 *  existence for the "garbage collector" task, and 2) the "string" fallback branch of Ext.getDom().  It is very
	 *  unlikely this change will offend any existing code, nor future code. (getDom is predominately used to normalize
	 *  an input from either Ext.dom.Element or a Node and allow you to assume you are working with a raw Node)
	 *
	 *
	 *  An alternative is to reimplement their (Ext's) garbage collector function and make it inspect the node's
	 *  ownerDocument.
	 *
	 *  Notes on reimplementing Ext's GC:
	 *
	 *  clear the interval: Ext.Element.collectorThreadId
	 *  Copy function garbageCollect() from ext/src/dom/Element.js as a starting point, then restart the 30second interval.
	 */
	Ext.getElementById = function(id){
			var el = get.apply(this,arguments);

			function testFrame(frame){
				var win = frame.contentWindow || window.frames[frame.name];
				el = win.document.getElementById(id) || false;
				return !el;
			}

			if(!el){
				Ext.each(document.getElementsByTagName('iframe'),testFrame);
			}

			return el;
		};

});
