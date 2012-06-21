describe("Anchor Utils", function() {

	var testBody;

	beforeEach(function(){
		testBody = document.createElement('div');
		document.body.appendChild(testBody);
	});

	afterEach(function(){
		document.body.removeChild(testBody);
	});

	describe('createRangeDescriptionFromRange Tests', function(){
		it('Create Description with non-anchorable', function(){
			var div = document.createElement('div'),
				span = document.createElement('span'),
				p = document.createElement('p'),
				t1 = document.createTextNode('text node 1'),
				span2 = document.createElement('span'),
				p2 = document.createElement('p'),
				t2 = document.createTextNode('text node 2'),
				a = document.createElement('div'),
				range, result;

			p2.appendChild(t2);
			span2.appendChild(p2);
			p.appendChild(t1);
			span.appendChild(p);
			span.appendChild(span2);
			span.appendChild(a);
			span.setAttribute('Id', '12312312');
			span.setAttribute('data-non-anchorable', 'true');
			div.setAttribute('Id', 'ThisIdIsTheBest');
			div.appendChild(span);
			testBody.appendChild(div);
			range = document.createRange();
			range.setStartBefore(p);
			range.setEndAfter(a);

			result = Anchors.createRangeDescriptionFromRange(range, document);
			expect(result.getAncestor().getElementId()).toEqual(div.getAttribute('Id'));
		});
	});

	describe("isNodeAnchorable Tests", function(){
		it('Null Node', function(){
			expect(Anchors.isNodeAnchorable(null)).toBeFalsy();
		});

		it('Text Node with value', function(){
			var node = document.createTextNode('this is come text');
			expect(Anchors.isNodeAnchorable(node)).toBeTruthy();
		});

		it('Text Node with empty value', function(){
			var node = document.createTextNode('');
			expect(Anchors.isNodeAnchorable(node)).toBeFalsy();
		});

		it('MathJax node', function(){
			var node = document.createElement('span');
			node.setAttribute('Id', 'MathJax-blahblah');
			expect(Anchors.isNodeAnchorable(node)).toBeFalsy();
		});

		it('Node without Id', function(){
			var node = document.createElement('span');
			expect(Anchors.isNodeAnchorable(node)).toBeFalsy();
		});

		it('Node with Id', function(){
			var node = document.createElement('span');
			node.setAttribute('id', 'a1234567');
			expect(Anchors.isNodeAnchorable(node)).toBeTruthy();
		});

		it('Node with Id and data-non-anchorable Attribute', function(){
			var node = document.createElement('span');
			node.setAttribute('id', 'a1234567');
			node.setAttribute('data-non-anchorable', 'true');
			expect(Anchors.isNodeAnchorable(node)).toBeFalsy();
		});
	});

	describe('nodeThatIsEdgeOfRange Tests', function(){
		it('Null Range', function(){
			try {
				Anchors.nodeThatIsEdgeOfRange(null, true);
 	 			expect(false).toBeTruthy();
			}
			catch(e) {
				expect(e.message).toEqual('Node is not defined');
			}
		});

		it ('Range of Text Nodes, start and end', function(){
			var range = document.createRange(),
				txtNode1 = document.createTextNode('Text node 1'),
				txtNode2 = document.createTextNode('Text node 2');

			testBody.appendChild(txtNode1);
			testBody.appendChild(txtNode2);
			range.setStart(txtNode1, 5);
			range.setEnd(txtNode2, 5);

 			expect(Anchors.nodeThatIsEdgeOfRange(range, true).textContent).toEqual(txtNode1.textContent);
			expect(Anchors.nodeThatIsEdgeOfRange(range, false).textContent).toEqual(txtNode2.textContent);
		});

		it ('Range of Non Text Nodes, start', function(){
			var range = document.createRange(),
				nonTxtNode1 = document.createElement('div'),
				nonTxtNode2 = document.createElement('span'),
				nonTxtNode3 = document.createElement('p'),
				txtNode1 = document.createTextNode('Text node 1'),
				txtNode2 = document.createTextNode('Text node 2');

			nonTxtNode1.appendChild(nonTxtNode3);
			nonTxtNode2.appendChild(txtNode1);
			nonTxtNode1.appendChild(nonTxtNode2);
			testBody.appendChild(nonTxtNode1);
			testBody.appendChild(txtNode2);
			range.setStart(nonTxtNode1, 1);
			range.setEnd(txtNode2, 5);

			expect(Anchors.nodeThatIsEdgeOfRange(range, true).tagName).toEqual('SPAN');
		});

		it ('Range of Non Text Nodes, end', function(){
			var range = document.createRange(),
				nonTxtNode1 = document.createElement('div'),
				nonTxtNode2 = document.createElement('span'),
				nonTxtNode3 = document.createElement('p'),
				txtNode1 = document.createTextNode('Text node 1'),
				txtNode2 = document.createTextNode('Text node 2');

			nonTxtNode1.appendChild(nonTxtNode3);
			nonTxtNode2.appendChild(txtNode1);
			nonTxtNode1.appendChild(nonTxtNode2);
			testBody.appendChild(txtNode2);
			testBody.appendChild(nonTxtNode1);
			range.setStart(txtNode2, 5);
			range.setEnd(nonTxtNode1, 2);

			expect(Anchors.nodeThatIsEdgeOfRange(range, false).tagName).toEqual('SPAN');
		});


		it ('Range of Non Text Nodes, negative offset', function(){
			var range = document.createRange(),
				nonTxtNode1 = document.createElement('div'),
				nonTxtNode2 = document.createElement('span'),
				nonTxtNode22 = document.createElement('span'),
				nonTxtNode3 = document.createElement('p'),
				txtNode1 = document.createTextNode('Text node 1'),
				txtNode2 = document.createTextNode('Text node 2');

			nonTxtNode22.setAttribute('test', 'test');
			nonTxtNode1.appendChild(nonTxtNode3);
			nonTxtNode2.appendChild(txtNode1);
			nonTxtNode1.appendChild(nonTxtNode22);
			nonTxtNode1.appendChild(nonTxtNode2);
			testBody.appendChild(txtNode2);
			testBody.appendChild(nonTxtNode1);
			range.setStart(txtNode2, 5);
			range.setEnd(nonTxtNode2, 0);

			expect(Anchors.nodeThatIsEdgeOfRange(range, false).getAttribute('test')).toEqual('test');
		});
	});

	describe('searchFromRangeStartInwardForAnchorableNode Tests', function(){
		it ('Null Node', function(){
			expect(Anchors.searchFromRangeStartInwardForAnchorableNode(null)).toBeNull();
		});

		it('Already Anchorable Node', function(){
			var anchorable = document.createTextNode('This is a text node, yay'),
				result = Anchors.searchFromRangeStartInwardForAnchorableNode(anchorable);

			expect(result).toBe(anchorable);
		});

		it('Buried Anchorable text node', function(){
			var div = document.createElement('div'),
				p = document.createElement('p'),
				txt = document.createTextNode('This is text'),
				result;

			//setup heirarchy
			p.appendChild(txt);
			div.appendChild(p);

			result = Anchors.searchFromRangeStartInwardForAnchorableNode(div);
			expect(result).toBe(txt);
		});

		it('Buried Anchorable non-text node', function(){
			var div = document.createElement('div'),
				p = document.createElement('p'),
				a = document.createElement('a'),
				result;

			//setup heirarchy
			a.setAttribute('id', 'a12345');
			p.appendChild(a);
			div.appendChild(p);

			result = Anchors.searchFromRangeStartInwardForAnchorableNode(div);
			expect(result).toBe(a);
		});

		it('Buried Non Anchorable nodes', function(){
			var div = document.createElement('div'),
				p = document.createElement('p'),
				a = document.createElement('a'), //no id, not anchorable
				result;

			//setup heirarchy
			p.appendChild(a);
			div.appendChild(p);

			result = Anchors.searchFromRangeStartInwardForAnchorableNode(div);
			expect(result).toBeNull();
		});
	});

	describe('walkDownToLastNode Tests', function(){
		it ('Null Node', function(){
			try {
				Anchors.walkDownToLastNode(null);
				expect(false).toBeTruthy();
			}
			catch(e) {
				expect(e.message).toEqual('Node cannot be null');
			}
		});

		it ('Already At Bottom', function(){
			var bottom = document.createElement('a');
			expect(Anchors.walkDownToLastNode(bottom)).toBe(bottom);
		});

		it ('Several Layers Deep', function(){
			var n4 = document.createTextNode('Text Node'),
				n3 = document.createElement('p'),
				n2 = document.createElement('span'),
				n1 = document.createElement('div');

			n3.appendChild(n4);
			n2.appendChild(n3);
			n1.appendChild(n2);

			expect(Anchors.walkDownToLastNode(n1)).toBe(n4);
		});

		it ('Several Layers Deep With Siblings', function(){
			var n5 = document.createTextNode('More Text'),
				n4 = document.createTextNode('Text Node'),
				n4a = document.createElement('p'),
				n3 = document.createElement('p'),
				n3a = document.createElement('span'),
				n2 = document.createElement('span'),
				n1 = document.createElement('div');

			n4a.appendChild(n5);
			n3a.appendChild(n4a);
			n3.appendChild(n4);
			n2.appendChild(n3a);
			n2.appendChild(n3);
			n1.appendChild(n2);

			expect(Anchors.walkDownToLastNode(n1)).toBe(n4);
		});
	});

	describe('searchFromRangeEndInwardForAnchorableNode Tests', function(){
		it('Null Node', function(){
			expect(Anchors.searchFromRangeEndInwardForAnchorableNode(null)).toBeNull();
		});

		it('Already Anchorable Node', function(){
			var anchorable = document.createTextNode('This is a text node, yay'),
				result = Anchors.searchFromRangeEndInwardForAnchorableNode(anchorable);

			expect(result).toBe(anchorable);
		});

		it('Buried Non Anchorable Node', function(){
			var div = document.createElement('div'),
				p = document.createElement('p'),
				a = document.createElement('a'), //no id, not anchorable
				result;

			//setup heirarchy
			p.appendChild(a);
			div.appendChild(p);

			result = Anchors.searchFromRangeEndInwardForAnchorableNode(div);
			expect(result).toBeNull();
		});

		it('Buried Anchorable Node', function(){
			var div = document.createElement('div'),
				span1 = document.createElement('span'),
				p1 = document.createElement('p'),
				t1 = document.createTextNode('Textify!'),
				span2 = document.createElement('span'),
				div2 = document.createElement('div'),
				start = document.createElement('a');

			p1.appendChild(t1);
			span1.appendChild(p1);
			div2.appendChild(start);
			span2.appendChild(div2);
			div.appendChild(span1);
			div.appendChild(span2);

			expect(Anchors.searchFromRangeEndInwardForAnchorableNode(start)).toBe(t1);
		});

		it('Walks Down Into Current Node', function(){
            var div = document.createElement('div'),
				span1 = document.createElement('span'),
				t1 = document.createTextNode('Foo'),
				span2 = document.createElement('span'),
				result;

			div.setAttribute('Id', 'a1234');

			span1.appendChild(t1);
			div.appendChild(span1);
			div.appendChild(span2);

			testBody.appendChild(div);
			result = Anchors.searchFromRangeEndInwardForAnchorableNode(span1);
            expect(result).toBe(t1);
        });
	});

	describe('makeRangeAnchorable Tests', function(){
		it('Range Already Valid', function(){
			var div = document.createElement('div'),
				t1 = document.createTextNode('test node 1'),
				t2 = document.createTextNode('test node 2'),
				range, result;

			//make sure div is valid
			div.setAttribute('Id', 'someid');

			//add this stuff to the body so we can then put it in a range
			div.appendChild(t1);
			div.appendChild(t2);
			testBody.appendChild(div);

			range = document.createRange();
			range.setStart(div, 0);
			range.setEnd(t2, 2);

			result = Anchors.makeRangeAnchorable(range, document);
			expect(result).toBe(range); //should not have changed
		});

		it('Range Both Sides Need Digging', function(){
			var div = document.createElement('div'),
				span = document.createElement('span'),
				p = document.createElement('p'),
				t1 = document.createTextNode('text node 1'),
				span2 = document.createElement('span'),
				p2 = document.createElement('p'),
				t2 = document.createTextNode('text node 2'),
				a = document.createElement('div'),
				range, result;

			p2.appendChild(t2);
			span2.appendChild(p2);
			p.appendChild(t1);
			span.appendChild(p);
			span.appendChild(span2);
			span.appendChild(a);
			div.appendChild(span);
			testBody.appendChild(div);
			range = document.createRange();
			range.setStartBefore(p);
			range.setEndAfter(a);

			result = Anchors.makeRangeAnchorable(range, document);

			expect(result.startContainer).toBe(t1);
			expect(result.startOffset).toEqual(0);
			expect(result.endContainer).toBe(t2);
			expect(result.endOffset).toEqual(11);
		});

		it ('Null Range', function(){
			try {
				Anchors.makeRangeAnchorable(null, null);
				expect(false).toBeTruthy();
			}
			catch (e) {
				expect(e.message).toEqual('Range cannot be null');
			}
		});

		it ('Range With NO Anchorables', function(){
			var div = document.createElement('div'),
				span = document.createElement('span'),
				p = document.createElement('p'),
				span2 = document.createElement('span'),
				p2 = document.createElement('p'),
				a = document.createElement('a'),
				range, result;

			span2.appendChild(p2);
			span.appendChild(p);
			span.appendChild(span2);
			span.appendChild(a);
			div.appendChild(span);
			testBody.appendChild(div);
			range = document.createRange();
			range.setStartBefore(p);
			range.setEndAfter(a);

			result = Anchors.makeRangeAnchorable(range, document);
			expect(result).toBeNull();
		});
	});

	describe('referenceNodeForNode Tests', function(){
		it ('Null Node', function(){
			expect(Anchors.referenceNodeForNode(null)).toBeNull();
		});

		it ('Node Already Anchorable', function(){
			var textNode = document.createTextNode('Scott Pilgram vs. The World');
			expect(Anchors.referenceNodeForNode(textNode)).toBe(textNode);
		});

		it ('Parent Node Anchorable', function(){
			var first = document.createElement('div'),
				second = document.createElement('span'),
				third = document.createElement('p');

			first.setAttribute('Id', 'someid');
			second.appendChild(third);
			first.appendChild(second);

			expect(Anchors.referenceNodeForNode(third)).toBe(first);
		});
	});

	describe('locateElementDomContentPointer Tests', function(){
		it('Null Pointer', function(){
			try{
				Anchors.locateElementDomContentPointer(null, null, false);
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toEqual('This method expects ElementDomContentPointers only');
			}
		});

		it('Wrong Node Type', function(){
			var domContentPointer = Ext.create('NextThought.model.anchorables.DomContentPointer', {role: 'start'});
			try {
				Anchors.locateElementDomContentPointer(domContentPointer, null, null);
				this.fail('Not supposed to happen')
			}
			catch(e) {
				expect(e.message).toEqual('This method expects ElementDomContentPointers only');
			}
		});

		it('Contains Node, No After', function(){
			var div = document.createElement('div'),
				span = document.createElement('span'),
				p = document.createElement('p'),
				t1 = document.createTextNode('text node 1'),
				span2 = document.createElement('span'),
				p2 = document.createElement('p'),
				t2 = document.createTextNode('text node 2'),
				a = document.createElement('div'),
				pointer = Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {role: 'start', elementTagName: 'p', elementId: 'SomeId'}),
				result = {};

			p2.appendChild(t2);
			span2.appendChild(p2);
			p.appendChild(t1);
			span.appendChild(p);
			span.appendChild(span2);
			span.appendChild(a);
			div.appendChild(span);
			p2.setAttribute('Id', 'SomeId');
			testBody.appendChild(div);

			result = Anchors.locateElementDomContentPointer(pointer, div, {});
			expect(result.confidence).toEqual(1);
			expect(result.node).toBe(p2);
		});

		it('Contains Node, After', function(){
			var div = document.createElement('div'),
				span = document.createElement('span'),
				p = document.createElement('p'),
				t1 = document.createTextNode('text node 1'),
				span2 = document.createElement('span'),
				p2 = document.createElement('p'),
				t2 = document.createTextNode('text node 2'),
				a = document.createElement('div'),
				pointer = Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {role: 'end', elementTagName: 'p', elementId: 'SomeId2'}),
				result = {};

			p.setAttribute('Id', 'SomeId1');
			p2.appendChild(t2);
			span2.appendChild(p2);
			p.appendChild(t1);
			span.appendChild(p);
			span.appendChild(span2);
			span.appendChild(a);
			div.appendChild(span);
			p2.setAttribute('Id', 'SomeId2');
			testBody.appendChild(div);

			console.warn('ExtJS means after is not necessary, dupe test')
			result = Anchors.locateElementDomContentPointer(pointer, div, {node:span2});
			expect(result.confidence).toEqual(1);
			expect(result.node).toBe(p2);
		});

		it('Does Not Contain Node', function(){
			var div = document.createElement('div'),
				span = document.createElement('span'),
				p = document.createElement('p'),
				t1 = document.createTextNode('text node 1'),
				span2 = document.createElement('span'),
				p2 = document.createElement('p'),
				t2 = document.createTextNode('text node 2'),
				a = document.createElement('div'),
				pointer = Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {role: 'start', elementTagName: 'p', elementId: 'SomeId'}),
				result = {};


			p2.appendChild(t2);
			span2.appendChild(p2);
			p.appendChild(t1);
			span.appendChild(p);
			span.appendChild(span2);
			span.appendChild(a);
			div.appendChild(span);
			testBody.appendChild(div);

			result = Anchors.locateElementDomContentPointer(pointer, div, {node:span2});
			expect(result.confidence).toEqual(0);
			expect(result.node).toBeFalsy();
		});
	});

	describe('resolveSpecBeneathAncestor Tests', function(){
		it('Null Description', function(){
			try {
				Anchors.resolveSpecBeneathAncestor(null, null, document);
				expect(false).toBeTruthy();
			}
			catch(e){
				expect(e.message).toEqual('Must supply Description');
			}
		});

		it('Null Doc Root', function(){
			try {
				Anchors.resolveSpecBeneathAncestor(true, true, null);
				expect(false).toBeTruthy();
			}
			catch(e){
				expect(e.message).toEqual('Must supply a docElement');
			}
		});

		it('Good Description, ElementDomContentPointers Used', function(){
			var div1 = document.createElement('div'),
				div2 = document.createElement('div'),
				span = document.createElement('span'),
				desc = Ext.create('NextThought.model.anchorables.DomContentRangeDescription', {
					start: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						role: 'start',
						elementTagName: 'div',
						elementId: 'Id1'
					}),
					end: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						role: 'end',
						elementTagName: 'div',
						elementId: 'Id2'
					}),
					ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						role: 'ancestor',
						elementTagName: 'SPAN',
						elementId: 'Span1'
					})
				}),
				result;

			div1.setAttribute('Id', 'Id1');
			div2.setAttribute('Id', 'Id2');
			span.setAttribute('Id', 'Span1');
			span.appendChild(div1);
			span.appendChild(div2);

			testBody.appendChild(span);

			//send in doc.body for maximum workage
			result = Anchors.resolveSpecBeneathAncestor(desc, document.body, document);
			expect(result.collapsed).toBe(false);
			expect(result.commonAncestorContainer).toBe(span);
			expect(result.startContainer).toBe(div1);
			expect(result.endContainer).toBe(div2);
		});

		it('Good Description, TextDomContentPointers Used', function(){
			var div1 = document.createElement('div'),
				text1 = document.createTextNode('Text Node Number 1'),
				div2 = document.createElement('div'),
				text2 = document.createTextNode('Some Test Number 2'),
				span = document.createElement('span'),
				desc = Ext.create('NextThought.model.anchorables.DomContentRangeDescription', {
					start: Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
						role: 'start',
						edgeOffset: 1,
						ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
							role: 'ancestor',
							elementTagName: 'div',
							elementId: 'DivId1'
						}),
						contexts: [
							Ext.create('NextThought.model.anchorables.TextContext', {
								contextText:'Node Number',
								contextOffset:13
							})
						]
					}),
					end: Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
						role: 'end',
						edgeOffset: 1,
						ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
							role: 'ancestor',
							elementTagName: 'DIv', //just pass in weird caps, should not matter
							elementId: 'DivId2'
						}),
						contexts: [
							Ext.create('NextThought.model.anchorables.TextContext', {
								contextText:'Test Number',
								contextOffset:5
							})
						]
					}),
					ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						role: 'ancestor',
						elementTagName: 'SPAN',
						elementId: 'SpanId1'
					})
				}),
				result;

			div1.setAttribute('Id', 'DivId1');
			div2.setAttribute('Id', 'DivId2');
			span.setAttribute('Id', 'SpanId1');
			div1.appendChild(text1);
			div2.appendChild(text2);
			span.appendChild(div1);
			span.appendChild(div2);

			testBody.appendChild(span);

			//send in doc.body for maximum workage
			result = Anchors.resolveSpecBeneathAncestor(desc, document.body, document);
			expect(result.collapsed).toBe(false);
			expect(result.commonAncestorContainer).toBe(span);
			expect(result.startContainer).toBe(text1);
			expect(result.endContainer).toBe(text2);
		});

		it('Good Description Not Findable Nodes', function(){
			var desc = Ext.create('NextThought.model.anchorables.DomContentRangeDescription', {
					start: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						role: 'start',
						elementTagName: 'div',
						elementId: 'Id1xxx'
					}),
					end: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						role: 'end',
						elementTagName: 'div',
						elementId: 'Id2xxx'
					}),
					ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						role: 'ancestor',
						elementTagName: 'SPAN',
						elementId: 'Span1xxx'
					})
				}),
				result;

			//send in doc.body for maximum workage
			result = Anchors.resolveSpecBeneathAncestor(desc, document.body, document);
			expect(result).toBeNull();
		});
	});

	describe('locateRangeEdgeForAnchor Tests', function(){
		it('Null Pointer', function(){
			try {
				Anchors.locateRangeEdgeForAnchor(null, null);
				expect(false).toBeTruthy();
			}
			catch (e) {
				expect(e.message).toEqual('Must supply a Pointer');
			}
		});

		it('Invalid Pointer', function(){
			var pointer = Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
					role: 'start',
					elementTagName: 'div',
					elementId: '12345'
				});

			//send in doc.body for maximum workage
			try{
				Anchors.locateRangeEdgeForAnchor(pointer, document.body);
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toEqual('ContentPointer must be a TextDomContentPointer');
			}
		});

		it('Nothing Findable, No Start Result', function(){
			var pointer = Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					role: 'start',
					edgeOffset: 1,
					ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						role: 'ancestor',
						elementTagName: 'div',
						elementId: 'GobbleDeGook!!!'
					}),
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {
							contextText:'Unfindable Text, Boogie Boo!!!',
							contextOffset:19
						})
					]
				}),
				result;

			//send in doc.body for maximum workage
			result = Anchors.locateRangeEdgeForAnchor(pointer, document.body);
			expect(result.confidence).toEqual(0);
		});
	});

	describe('firstWordFromString and lastWordFromString Tests', function(){
		it('lots of general tests', function(){
			expect(Anchors.lastWordFromString('word')).toEqual('word');
			expect(Anchors.firstWordFromString('word')).toEqual('word');

			expect(Anchors.lastWordFromString('word1 word2')).toEqual('word2');
			expect(Anchors.firstWordFromString('word1 word2')).toEqual('word1');

			expect(Anchors.firstWordFromString('word1 word2 word3')).toEqual('word1');
			expect(Anchors.lastWordFromString('word1 word2 word3')).toEqual('word3');

			expect(Anchors.firstWordFromString('')).toEqual('');
			expect(Anchors.lastWordFromString('')).toEqual('');

			try {
				Anchors.lastWordFromString(null);
				expect(false).toBeTruthy();
			}
			catch (e) {
				expect(e.message).toEqual('Must supply a string')
			}

			try {
				Anchors.firstWordFromString(null);
				expect(false).toBeTruthy();
			}
			catch (e) {
				expect(e.message).toEqual('Must supply a string')
			}
		});
	});

	describe('generatePrimaryContext Tests', function(){
		it('Null Range', function(){
			try {
				Anchors.generatePrimaryContext(null);
				expect(false).toBeTruthy();
			}
			catch(e) {
				expect(e.message).toEqual('Range must not be null');
			}
		});

		it('No Text in Range', function(){
			var div = document.createElement('div'),
				span = document.createElement('span'),
				p = document.createElement('p'),
				span2 = document.createElement('span'),
				p2 = document.createElement('p'),
				a = document.createElement('a'),
				range, result;

			span2.appendChild(p2);
			span.appendChild(p);
			span.appendChild(span2);
			span.appendChild(a);
			div.appendChild(span);
			testBody.appendChild(div);
			range = document.createRange();
			range.setStartBefore(p);
			range.setEndAfter(a);

			result = Anchors.generatePrimaryContext(range);
			expect(result).toBeNull();
		});

		it('Good Range', function(){
			var div = document.createElement('div'),
				span = document.createElement('span'),
				p = document.createElement('p'),
				t = document.createTextNode('This is some text'),
				span2 = document.createElement('span'),
				p2 = document.createElement('p'),
				t2 = document.createTextNode('Also, this is more text'),
				a = document.createElement('a'),
				range, result;

			p.appendChild(t);
			p2.appendChild(t2);
			span2.appendChild(p2);
			span.appendChild(p);
			span.appendChild(span2);
			span.appendChild(a);
			div.appendChild(span);
			testBody.appendChild(div);
			range = document.createRange();
			range.setStart(t, 3);
			range.setEnd(t, 6);

			result = Anchors.generatePrimaryContext(range, 'start');
			expect(result.getContextText()).toEqual('This');
			expect(result.getContextOffset()).toEqual(17);
		});
	});

	describe('generateAdditionalContext', function(){
		it('Null Node', function(){
			try {
				Anchors.generateAdditionalContext(null, 'start');
				expect(false).toBeTruthy();
			}
			catch(e) {
				expect(e.message).toEqual('Node must not be null');
			}
		});

		it('Non-Text Node', function(){
			expect(Anchors.generateAdditionalContext(document.createElement('div'), 'start')).toBeNull();
		});

		it('Text Node', function(){
			var t = document.createTextNode('This is a text node, yay'),
				result1 = Anchors.generateAdditionalContext(t, 'start'),
				result2 = Anchors.generateAdditionalContext(t, 'end');

			expect(result1.getContextText()).toEqual('yay');
			expect(result2.getContextText()).toEqual('This');
			expect(result1.getContextOffset()).toEqual(3);
			expect(result2.getContextOffset()).toEqual(0);
		});
	});

	describe('createTextPointerFromRange Tests', function(){
		it('Null and Collapsed Ranges', function(){
			try {
				Anchors.createTextPointerFromRange(null, 'start');
				expect(false).toBeTruthy();
			}
			catch(e) {
				expect(e.message).toEqual('Cannot proceed without range or with a collapsed range');
			}

			try {
				Anchors.createTextPointerFromRange(document.createRange(), 'start');
				expect(false).toBeTruthy();
			}
			catch(e) {
				expect(e.message).toEqual('Cannot proceed without range or with a collapsed range');
			}
		});

		it('Range Without Text Containers', function(){
			var div = document.createElement('div'),
				span = document.createElement('span'),
				p = document.createElement('p'),
				span2 = document.createElement('span'),
				p2 = document.createElement('p'),
				a = document.createElement('a'),
				range;

			span2.appendChild(p2);
			span.appendChild(p);
			span.appendChild(span2);
			span.appendChild(a);
			div.appendChild(span);
			testBody.appendChild(div);
			range = document.createRange();
			range.setStartBefore(p);
			range.setEndAfter(a);

			try {
				Anchors.createTextPointerFromRange(range);
				expect(false).toBeTruthy();
			}
			catch(e) {
				expect(e.message).toEqual('Range must contain text containers');
			}


		});

		it('Good Range', function(){
			var div = document.createElement('div'),
				span = document.createElement('span'),
				p = document.createElement('p'),
				t1 = document.createTextNode('Once upon a time, there lived a BEAST!'),
				span2 = document.createElement('span'),
				p2 = document.createElement('p'),
				t2 = document.createTextNode('The beasts name was, NextThoughtASaurus!'),
				a = document.createElement('a'),
				range, result;

			p.setAttribute('Id', 'xzy1232314');
			p.appendChild(t1);
			p2.setAttribute('Id', 'xzydasdasae2342');
			p2.appendChild(t2);
			span2.appendChild(p2);
			span.appendChild(p);
			span.appendChild(span2);
			span.appendChild(a);
			div.appendChild(span);
			testBody.appendChild(div);
			range = document.createRange();
			range.setStart(t1, 3);
			range.setEnd(t2, 5);


			result = Anchors.createTextPointerFromRange(range, 'end');
			expect(result).toBeTruthy();
			expect(result.getRole()).toEqual('end');
			expect(result.getAncestor().getElementId()).toEqual(p2.getAttribute('Id'));
			expect(result.getContexts().length).toBeGreaterThan(0);
		});
	});

	describe('Integration Tests', function(){
		it('Ancestor Spanning Identical Text Node Bug', function(){
			var root = document.createElement('div'), //this should be the ancestor
				p1 = document.createElement('p'),
				t1 = document.createTextNode('This is some text.'), //same as t2
				p2 = document.createElement('p'),
				t2 = document.createTextNode('This is some text.'),
				range, desc, recreatedRange;

			//set up ids and heirarchy
			root.setAttribute('Id', 'a123242354543523');
			p1.setAttribute('position', 1);
			p1.appendChild(t1);
			p2.setAttribute('position', 2);
			p2.appendChild(t2);
			root.appendChild(p1);
			root.appendChild(p2);
			testBody.appendChild(root);

			//create a range now starting at the first char of t1 and the last of t2
			range = document.createRange();
			range.setStart(t1, 0);
			range.setEnd(t2, t2.length);

			//double check that my range has different nodes and is set up correctly
			expect(range.startContainer).toBe(t1);
			expect(range.endContainer).toBe(t2);
			expect(t1).not.toBe(t2);
			expect(range.startContainer).not.toBe(range.endContainer);
			expect(range.toString()).toEqual(t1.textContent+t2.textContent);

			//now turn that into a description, and check a few assumptions
			desc = Anchors.createRangeDescriptionFromRange(range, document);
			expect(desc).toBeTruthy();
			expect(desc.getAncestor()).toBeTruthy();
			expect(desc.getAncestor().getElementId()).toEqual(root.getAttribute('Id'));

			//now round trip back to a range, verify that it is the same range as before
			recreatedRange = Anchors.toDomRange(desc, document);
			expect(recreatedRange).toBeTruthy();
			expect(recreatedRange.startContainer).toBe(range.startContainer);
			expect(recreatedRange.endContainer).toBe(range.endContainer);
			expect(recreatedRange.commonAncestorContainer).toBe(range.commonAncestorContainer);
		});

		it('Ambigious Model Causing Incorrect Highlight Bug', function(){
			/*
			From the documentation:, this does not highlight correctly
			<p id="id">
					[|This is a sentence]
					<b class="bfseries"><em>WOW</em></b>
					[. Another sentence]<em>YIKES</em>[ and ]<em>foo</em>[. |]
			</p>
			*/
			//declare our elements and nodes and stuff:
			var p = document.createElement('p'),
				t1 = document.createTextNode('This is a sentence'),
				b = document.createElement('b'),
				em1 = document.createElement('em'),
				t2 = document.createTextNode('WOW'),
				t3 = document.createTextNode('. Another sentence'),
				em2 = document.createElement('em'),
				t4 = document.createTextNode('YIKES'),
				t5 = document.createTextNode(' and '),
				em3 = document.createElement('em'),
				t6 = document.createTextNode('foo'),
				t7 = document.createTextNode('. '),
				range, desc, recreatedRange,
				expectedRangeToString = 'This is a sentenceWOW. Another sentenceYIKES and foo. ';

			//setup ids and heirarchies:
			p.setAttribute('Id', 'id');
			b.setAttribute('class', 'bfseries');
			//fill up ems
			em3.appendChild(t6);
			em2.appendChild(t4);
			em1.appendChild(t2);
			//fill up bold tag
			b.appendChild(em1);
			//put the rest under the paragraph
			p.appendChild(t1);
			p.appendChild(b);
			p.appendChild(t3);
			p.appendChild(em2);
			p.appendChild(t5);
			p.appendChild(em3);
			p.appendChild(t7);
			//now put the paragraph in the body
			testBody.appendChild(p);

			//okay, whew, now create the range described in the docs
			range = document.createRange();
			range.setStart(t1, 0);
			range.setEnd(t7, t7.length);

			//verify assumptions
			expect(range).toBeTruthy();
			expect(range.startContainer).toBe(t1);
			expect(range.endContainer).toBe(t7);
			expect(range.commonAncestorContainer).toBe(p);
			expect(range.toString()).toEqual(expectedRangeToString);

			//now turn that into a description, and check a few assumptions
			desc = Anchors.createRangeDescriptionFromRange(range, document);
			expect(desc).toBeTruthy();
			expect(desc.getAncestor()).toBeTruthy();
			expect(desc.getAncestor().getElementId()).toEqual(p.getAttribute('Id'));

			//now round trip back to a range, verify that it is the same range as before
			recreatedRange = Anchors.toDomRange(desc, document);
			expect(recreatedRange).toBeTruthy();
			expect(recreatedRange.startContainer).toBe(range.startContainer);
			expect(recreatedRange.endContainer).toBe(range.endContainer);
			expect(recreatedRange.commonAncestorContainer).toBe(range.commonAncestorContainer);
			expect(recreatedRange.toString()).toEqual(expectedRangeToString);
		});
	});
});
