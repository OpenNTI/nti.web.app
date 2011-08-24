Ext.define('NextThought.util.AnnotationUtils',
{
	requires: ['NextThought.model.Highlight',
			   'NextThought.model.Note'],
	alternateClassName: 'AnnotationUtils',
	statics: {
		
		getPathTo: function(element) {
			var nodeName = element.nodeName;
			
		    if (element.id && !/ext\-|a\d+|math/i.test(element.id))
		        return 'id("'+element.id+'")';
		    if (element===document.body)
		        throw 'too far!';
		
			if (nodeName == '#text') {
				nodeName = 'text()';
			}
		
		    var i=0,
		    	ix= 0,
		    	siblings= element.parentNode.childNodes,
		    	len = siblings.length;

		    for (; i<len; i++) {
		        var sibling = siblings[i];
		        if (sibling===element)
		            return this.getPathTo(element.parentNode)+'/'+nodeName+'['+(ix+1)+']';
		        if (sibling.nodeName==element.nodeName)
		            ix++;
		    }
		},
		
		
		selectionToNote: function(range) {
			var note = Ext.create('NextThought.model.Note');
			var node = range.startContainer || range.endContainer;
            var blockNode = this.findBlockParent(node);

			if (!blockNode) throw 'No block node found.';

            var anchorNode = this.getNextAnchorInDOM(blockNode);
            var pageOffsets = Ext.get(anchorNode).getOffsetsTo(Ext.get('NTIContent'));
            note.set('anchorPoint', anchorNode.getAttribute('name'));
            note.set('top', pageOffsets[0]);
            note.set('left', pageOffsets[1]);
			return note;
		},

        getNextAnchorInDOM: function(node) {
            var anchor = null;
            Ext.each(Ext.query('A[name]'), function(a){
                if (a.compareDocumentPosition(node) == 2) { //2 == preceedes
                    anchor = a;
                    return false;
                }
            });
            return anchor;
        },
		
		findBlockParent: function(n) {
			var c = n;
			while(c && !this.isBlockNode(c)) {
				c = c.parentNode;
			}
			return c;
		},
		
		
		isBlockNode: function(n) {
			var e = Ext.get(n),
				p = /static/i,
				d = /block|box/i;
			return (e && d.test(e.getStyle('display')) && p.test(e.getStyle('position'))); 
		},

        getNodeFromXPath: function(xpath) {
             try {
                 return document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null).iterateNext();
             }
             catch(e) {
                 if(NextThought.isDebug) {
                     console.log('xpath:', xpath, 'error:', e, e.message, e.stack);
                 }
                 return null;
             }
        },

        buildRangeFromRecord: function(r) {
            var endElement = this.getNodeFromXPath(r.get('endXpath'));
            var startElement = this.getNodeFromXPath(r.get('startXpath'));

            var range = document.createRange();

           try {
                range.setEnd(endElement ? endElement : startElement, r.get('endOffset'));
                range.setStart(startElement, r.get('startOffset'));
                if (!startElement || range.collapsed) throw 'rageing tempor tantrum';
                return range;
            }
            catch(e) {
                if(NextThought.isDebug) {
                    console.log('bad range', r, e, e.toString());
                }
            }

            //if we make it this far, there's something wrong with the range, we'll try to reconstruct from anchors
            return this.rangeFromAnchors(r);
        },

        getAnchor: function(a) {
            return Ext.query('a[name=' + a +']')[0];
        },

        getNextAnchor: function(a) {
            var all = Ext.query('a[name]'),
                result = null,
                anchor = a;

            Ext.each(all, function(e, i){
               if (e==a) {
                   result = all[i+1];
                   return false;
               }
            });

            return result;
        },

		rangeFromAnchors: function(r) {
            //TODO: this still isn't qorking quite right, if the start/end anchor are the same but have diff text nodes.
            var startAnchor = r.get('startAnchor'),
                endAnchor = r.get('endAnchor'),
                startHighlightedFullText = r.get('startHighlightedFullText'),
                endHighlightedFullText = r.get('endHighlightedFullText'),
                resultRange = document.createRange(),
                container = null;

            if(!endHighlightedFullText) {
                endHighlightedFullText = startHighlightedFullText;
            }

            //resolve anchors to their actual DOM nodes
            startAnchor = this.getAnchor(startAnchor)
            endAnchor = endAnchor ? this.getAnchor(endAnchor) : this.getNextAnchor(startAnchor);

            try {
                var tempRange = document.createRange();
                tempRange.setStart(startAnchor, 0);
                tempRange.setEnd(endAnchor, 0);
                container = tempRange.commonAncestorContainer;
            }
            catch (e) {
                console.log('End Anchor is null', e, e.message, e.stack);
                container = Ext.get(startAnchor).up('.page-contents').dom;
            }

            var text,
                texts = document.evaluate(  './/text()', container,
                                            null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

            while(resultRange.collapsed && (text = texts.iterateNext())){
                if (text.nodeValue==startHighlightedFullText) {
                    resultRange.setStart(text, r.get('startOffset'));
                }
                if (text.nodeValue==endHighlightedFullText) {
                    resultRange.setEnd(text, r.get('endOffset'));
                }
            }

            //add xpaths here for simplicity next time
            if (!resultRange.collapsed) {
                r.set('startXpath', this.getPathTo(resultRange.startContainer));
			    r.set('endXpath', this.getPathTo(resultRange.endContainer));
                r.save();

                return resultRange;
            }

            return null;
        },

		selectionToHighlight: function(range) {
			var highlight = Ext.create('NextThought.model.Highlight'),
                startNode = range.startContainer,
                endNode = range.endContainer,
                startAnchor = this.ascendToAnchor(startNode),
                endAnchor = this.ascendToAnchor(endNode);

            highlight.set('text', range.toString());

            //start information
         	highlight.set('startXpath', this.getPathTo(startNode));
			highlight.set('startAnchor', startAnchor);
            highlight.set('startOffset', range.startOffset);
            //end information
			highlight.set('endXpath', this.getPathTo(endNode));
            if (startAnchor != endAnchor) highlight.set('endAnchor', endAnchor);
			highlight.set('endOffset', range.endOffset);

            //special case when the end node is a div containing an img.
            if (this.isBlockNode(endNode) && this.isImageNode(endNode.firstChild)){
                endNode = endNode.firstChild;
            }

            //debugger;

            this._fixHighlightEndpoints(endNode, startNode, highlight);
			return highlight;
		},

        _fixHighlightEndpoints: function(endNode, startNode, highlight) {
            if (!this.isTextNode(endNode) && !this.isMathNode(endNode) && !this.isImageNode(endNode)) {

                var end = null;
                var workingNode = endNode;

                while(!end) {
                    workingNode = (workingNode.previousSibling) ? workingNode.previousSibling : workingNode.parentNode;
                    end = this.findLastHighlightableNodeFromChildren(workingNode, endNode);
                    if (end) {
                        endNode = end;
                        highlight.set('endAnchor', this.ascendToAnchor(end));
                        if (isTextNode(end)) {
                            highlight.set('endOffset', endNode.nodeValue.length);
                        }
                    }
                }
            }

            //now we have our start and end, let's see if we span anchors
            var fullText = this.getNodeTextValue(startNode),
                endOffset = highlight.get('endOffset'),
                startOffset = highlight.get('startOffset');

            if (!highlight.get('endAnchor')) {
                //same anchor, this effects our snippets, there is no end snippet
                highlight.set('startHighlightedFullText', fullText);
                highlight.set('startHighlightedText', (fullText != startNode.nodeValue) ? fullText : startNode.nodeValue.substring(startOffset, endOffset));
            }
            else {
                //different anchors, we'll have 2 snippets
                highlight.set('startHighlightedFullText', fullText);                                                                                        ß
                highlight.set('startHighlightedText', (fullText != startNode.nodeValue) ? fullText : startNode.nodeValue.substring(startOffset));
                highlight.set('endHighlightedFullText', this.getNodeTextValue(endNode));

                fullText = this.getNodeTextValue(endNode);
                highlight.set('endHighlightedText',
                    (endOffset != 0 && endNode.nodeValue != null)
                        ? (fullText != endNode.nodeValue)
                            ? fullText
                            : endNode.nodeValue.substring(0, endOffset)
                        : highlight.get('endHighlightedFullText'));
            }
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
						name = this.anchorNameOrNull(previousSibling);
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
            if (!node || !node.getAttribute) return false;

            var cls = node.getAttribute('className') || node.getAttribute('class');

            return (cls && cls.indexOf('math') >= 0);
		},
		
		
		isTextNode: function(node) {
			return (node && node.nodeValue != null);
        },

		isImageNode: function(node) {
			return (node && node.nodeName == "IMG");
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
		
			if ((this.isTextNode(node) && node.nodeValue.trim() != "") || this.isMathNode(node) || this.isImageNode(node)) {
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