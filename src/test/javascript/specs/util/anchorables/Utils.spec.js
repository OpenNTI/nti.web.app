describe("Anchor Utils", function() {

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

			document.body.appendChild(txtNode1);
			document.body.appendChild(txtNode2);
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
			document.body.appendChild(nonTxtNode1);
			document.body.appendChild(txtNode2);
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
			document.body.appendChild(txtNode2);
			document.body.appendChild(nonTxtNode1);
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
			document.body.appendChild(txtNode2);
			document.body.appendChild(nonTxtNode1);
			range.setStart(txtNode2, 5);
			range.setEnd(nonTxtNode2, 0);

			expect(Anchors.nodeThatIsEdgeOfRange(range, false).getAttribute('test')).toEqual('test');
		});
	});
});
