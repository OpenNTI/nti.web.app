Ext.define('NextThought.util.HighlightUtils',
{
	requires: ['NextThought.model.Highlight'],
	alternateClassName: 'HighlightUtils',
	statics: {
		getPathTo: function(element) {
			var nodeName = element.nodeName;
			
		    if (element.id && element.id.indexOf('ext-')!=0)
		        return 'id("'+element.id+'")';
		    if (element===document.body)
		        return nodeName;
		
			if (nodeName == '#text') {
				nodeName = 'text()';
			}
		
		    var ix= 0;
		    var siblings= element.parentNode.childNodes;
		    for (var i= 0; i<siblings.length; i++) {
		        var sibling= siblings[i];
		        if (sibling===element)
		            return this.getPathTo(element.parentNode)+'/'+nodeName+'['+(ix+1)+']';
		        if (/*sibling.nodeType===1 && */sibling.nodeName===element.nodeName)
		            ix++;
		    }
		},
		selectionToNTIHighlight: function(range) {
			var highlight = Ext.create('NextThought.model.Highlight');
			
			var startNode = range.startContainer;
			highlight.set('startAnchor', this.getPathTo(startNode));
			highlight.set('startOffset', range.startOffset);
			var endNode = range.endContainer;
			highlight.set('endAnchor', this.getPathTo(endNode));
			highlight.set('endOffset', range.endOffset);
	
		},
		ascendToAnchor: function(textNode) {
			var parentNode = textNode;
			if (this.isTextNode(textNode)) {
				textNode = textNode.parentNode;
			}
		
			while (parentNode != null) {
				if (parentNode.nodeName == 'A') {
					var name = this.anchorNameOrNull(parentNode);
					if (name != null) {
						//if we found a name, return it, otherwise allow this to continue.
						return name;
					}
				}
		
				//Look at all prior siblings at this level looking for an anchor
				var previousSibling = parentNode.previousSibling;
				while(previousSibling != null) {
					if (previousSibling.nodeName == 'A') {
						var name = this.anchorNameOrNull(previousSibling);
						if (name != null) {
							//if we found a name, return it, otherwise allow this to continue.
							return name;
						}
		
					}
					//look into the children of this previous node
					var anchorFromChildrenOrNull = this.findLastAnchorFromChildren(previousSibling);
					if (anchorFromChildrenOrNull == null) {
						previousSibling = previousSibling.previousSibling;
					}
					else {
						return anchorFromChildrenOrNull;
					}
				}
				parentNode = parentNode.parentNode;
			}
		
			//if we make it here, we haven't found an anchor name:
			return null;
		},
		anchorNameOrNull: function(node) {
			if (node.name != null && node.name.trim().length > 0) {
				return node.name;
			}
			else {
				return null;
			}
		},
		findLastAnchorFromChildren: function(node) {
			var children = node.childNodes;
			var anchorFound = null;
		
			if (node.nodeName == 'A') {
				anchorFound = this.anchorNameOrNull(node);
			}
		
			if (children != null) {
				for(var i = 0; i < children.length; i++) {
					var child = children[i];
					if (child.nodeName == 'A') {
						anchorFound = this.anchorNameOrNull(child);
					}
					var grandchildren = child.childNodes;
					if (grandchildren != null) {
						for (var y = 0; y < grandchildren.length; y++) {
							var grandchild = grandchildren[y];
							var newAnchorFound = this.findLastAnchorFromChildren(grandchild);
							if (newAnchorFound != null) {
								anchorFound = newAnchorFound;
							}
						}
					}
				}
			}
		
			return anchorFound;
		},
		isMathNode: function(node) {
			return node && $(node).hasClass( 'math' );
		},		
		isTextNode: function(node) {
			if( node.nodeValue != null ) {
				return true;
			}
			return false;
		},
		isImageNode: function(node) {
			if (node.nodeName == "IMG") {
				return true;
			}
			return false;
		},
		getNodeTextValue: function(node) {
			var math = this.climbToMathNode(node);
			var img = this.digForImageNode(node);
			if (math != null) {
				//we have a math parent node
				//TODO - using the id here is fragile because changing content can break this when saved
				return this.getDOMTreeId(math);
			}
			else if (img != null) {
				return this.getDOMTreeId(img);
			}
			else if (this.isTextNode(node)) {
				return node.nodeValue;
			}
			else {
				//console.log("Cannot figure out the textual value of the node " + node);
				return null;
			}
		
		},
		getDOMTreeId: function(node) {
			var parentNode = node;
			var parents = 0;
			var sibs = 0;
		
			while (parentNode != null) {
				parents++;
		
				//Look at all prior siblings at this level looking for an anchor
				var previousSibling = parentNode.previousSibling;
				while(previousSibling != null) {
					sibs++;
		
					previousSibling = previousSibling.previousSibling;
				}
				parentNode = parentNode.parentNode;
			}
		
			//if we make it here, we haven't found an anchor name:
			return "DOMTreeID:" + parents + "," + sibs;
		},
		digForImageNode: function(n) {
			if (this.isImageNode(n)) {
				return n;
			}
		
			var child = n.firstChild;
			while (child) {
				if (this.isImageNode(child)) {
					return child;
				}
				var next = child.nextSibling;
				if (next == null) {
					child = child.firstChild;
				}
				else {
					child = next;
				}
			}
		},
		climbToMathNode: function(node) {
			var topMathNode = null;
		
			if (this.isMathNode(node)) {
				topMathNode = node;
			}
		
			var parent = node.parentNode;
			while (parent != null) {
				if (this.isMathNode(parent)) {
					topMathNode = parent;
				}
				parent = parent.parentNode;
			}
		
			return topMathNode;
		},
		findLastHighlightableNodeFromChildren: function(node, stopNode) {
			var children = node.childNodes;
			var last = null;
		
			if ((isTextNode(node) && node.nodeValue.trim() != "") || isMathNode(node) || isImageNode(node)) {
				last = node;
			}
		
			if (children != null) {
				for(var i = 0; i < children.length; i++) {
					var child = children[i];
		
					if (child == stopNode) {
						return last;
					}
		
					if ((this.isTextNode(child) && child.nodeValue.trim() != "") || this.isMathNode(child) || this.isImageNode(child)) {
						last = child;
					}
					var grandchildren = child.childNodes;
					if (grandchildren != null) {
						for (var y = 0; y < grandchildren.length; y++) {
							var grandchild = grandchildren[y];
							if (grandchild == stopNode) {
								return last;
							}
							var x = this.findLastHighlightableNodeFromChildren(grandchild, stopNode);
							if (x) { last = x;}
						}
					}
				}
			}
		
			return last;
		}

	}
});