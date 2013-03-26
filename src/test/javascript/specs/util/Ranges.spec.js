describe("RangeUtils tests", function() {

	var TestRangeUtils;

	beforeEach(function(){
		TestRangeUtils = {};
		/*jslint sub:true */ //no way to ignore reserved property if using don notation
		TestRangeUtils['__proto__'] = NextThought.util.Ranges['__proto__'];
	});

	describe('rangeIfItemPropSpan', function(){

		var testBody, itemProp, multiItemProp, img, img2, div, range;

		//Setup fixture
		beforeEach(function(){
			testBody = document.createElement('div');

			itemProp = document.createElement('div');
			itemProp.setAttribute('itemprop', 'nti-data-markupenabled');

            multiItemProp = document.createElement('div');
            multiItemProp.setAttribute('itemprop', 'nti-data-markupenabled hello');

			img = document.createElement('span');
            img2 = document.createElement('span');
			itemProp.appendChild(img);
            multiItemProp.appendChild(img2);

			div = document.createElement('div')

			testBody.appendChild(itemProp);
            testBody.appendChild(multiItemProp);
			testBody.appendChild(div);
			document.body.appendChild(testBody);

			range = document.createRange();
		});

		//Tear down fixture
		afterEach(function(){
			document.body.removeChild(testBody);
			testBody = itemProp = img = div = range = null;
		});

		it('Returns a range if itemprop provided', function(){
			var r;

			range.selectNodeContents(itemProp);
			r = TestRangeUtils.rangeIfItemPropSpan(range, document);
			expect(r).not.toBe(null);
		});

		it('Returns a range if itemprop descendant provided', function(){
			var r;

			range.selectNodeContents(img);
			r = TestRangeUtils.rangeIfItemPropSpan(range, document);
			expect(r).not.toBe(null);
		});

        it('Returns a range if multiple itemprop provided', function(){
            var r;

            range.selectNodeContents(multiItemProp);
            r = TestRangeUtils.rangeIfItemPropSpan(range, document);
            expect(r).not.toBe(null);
        });

        it('Returns a range if multi-itemprop descendant provided', function(){
            var r;

            range.selectNodeContents(img2);
            r = TestRangeUtils.rangeIfItemPropSpan(range, document);
            expect(r).not.toBe(null);
        });

		it('Doesnt return a range for anything else', function(){
			var r;

			range.selectNodeContents(div);
			r = TestRangeUtils.rangeIfItemPropSpan(range, document);
			expect(r).toBe(null);
		});
	});

    describe('Expand Range Get String', function() {

        var testBody;

        beforeEach(function(){
            testBody = document.createElement('div');
            document.body.appendChild(testBody);
        });

        afterEach(function(){
            document.body.removeChild(testBody);
        });

        it('Fully Selected Text', function(){
            var nonTxtNode = document.createElement('div'),
                txtNode = document.createTextNode('hello'),
                range = document.createRange();

            nonTxtNode.appendChild(txtNode);
            testBody.appendChild(nonTxtNode);
            range.setStart(txtNode, 0);
            range.setEnd(txtNode, 5);
            expect(TestRangeUtils.expandRangeGetString(range, document)).toEqual('hello');
        });

        it('Partly Selected Text Left Side', function(){
            var nonTxtNode = document.createElement('div'),
                txtNode = document.createTextNode('hello'),
                range = document.createRange();

            nonTxtNode.appendChild(txtNode);
            testBody.appendChild(nonTxtNode);
            range.setStart(txtNode, 1);
            range.setEnd(txtNode, 5);
            expect(TestRangeUtils.expandRangeGetString(range, document)).toEqual('hello');
        });

        it('Partly Selected Text Right Side', function(){
            var nonTxtNode = document.createElement('div'),
                txtNode = document.createTextNode('hello'),
                range = document.createRange();

            nonTxtNode.appendChild(txtNode);
            testBody.appendChild(nonTxtNode);
            range.setStart(txtNode, 0);
            range.setEnd(txtNode, 4);
            expect(TestRangeUtils.expandRangeGetString(range, document)).toEqual('hello');
        });

        it('Partly Selected Text Both Sides', function(){
            var nonTxtNode = document.createElement('div'),
                txtNode = document.createTextNode('hello'),
                range = document.createRange();

            nonTxtNode.appendChild(txtNode);
            testBody.appendChild(nonTxtNode);
            range.setStart(txtNode, 1);
            range.setEnd(txtNode, 4);
            expect(TestRangeUtils.expandRangeGetString(range, document)).toEqual('hello');
        });

        it('Partly Selected Multi Word', function(){
            var nonTxtNode = document.createElement('div'),
                txtNode = document.createTextNode('hello world'),
                range = document.createRange();

            nonTxtNode.appendChild(txtNode);
            testBody.appendChild(nonTxtNode);
            range.setStart(txtNode, 1);
            range.setEnd(txtNode, 4);
            expect(TestRangeUtils.expandRangeGetString(range, document)).toEqual('hello world');
        });

        it('Partly Selected Punctuation', function(){
            var nonTxtNode = document.createElement('div'),
                txtNode = document.createTextNode('"hello, world"'),
                range = document.createRange();

            nonTxtNode.appendChild(txtNode);
            testBody.appendChild(nonTxtNode);
            range.setStart(txtNode, 0);
            range.setEnd(txtNode, 1);
            expect(TestRangeUtils.expandRangeGetString(range, document)).toEqual('"hello, world"');
        });

        it('Partly Selected Text Nested', function(){
            var nonTxtNode1 = document.createElement('div'),
                nonTxtNode2 = document.createElement('span'),
                nonTxtNode3 = document.createElement('p'),
                txtNode = document.createTextNode('hello'),
                range = document.createRange();

            nonTxtNode3.appendChild(txtNode);
            nonTxtNode2.appendChild(nonTxtNode3);
            nonTxtNode1.appendChild(nonTxtNode2);
            testBody.appendChild(nonTxtNode1);
            range.setStart(txtNode, 1);
            range.setEnd(txtNode, 4);
            expect(TestRangeUtils.expandRangeGetString(range, document)).toEqual('hello');
        });

        it('Partly Selected Text Two Text Nodes', function(){
            var nonTxtNode = document.createElement('div'),
                txtNode1 = document.createTextNode('hello'),
                txtNode2 = document.createTextNode(' world'),
                range = document.createRange();

            nonTxtNode.appendChild(txtNode1);
            nonTxtNode.appendChild(txtNode2);
            testBody.appendChild(nonTxtNode);
            range.setStart(txtNode1, 1);
            range.setEnd(txtNode1, 4);
            expect(TestRangeUtils.expandRangeGetString(range, document)).toEqual('hello world');
        });

        it('Partly Selected Text Two Text Nodes Single Node Selection', function(){
            var nonTxtNode1 = document.createElement('div'),
                nonTxtNode2 = document.createElement('span'),
                nonTxtNode3 = document.createElement('p'),
                txtNode1 = document.createTextNode('hello'),
                txtNode2 = document.createTextNode(' world'),
                range = document.createRange();

            nonTxtNode3.appendChild(txtNode1);
            nonTxtNode3.appendChild(txtNode2);
            nonTxtNode2.appendChild(nonTxtNode3);
            nonTxtNode1.appendChild(nonTxtNode2);
            testBody.appendChild(nonTxtNode1);
            range.setStart(txtNode1, 1);
            range.setEnd(txtNode1, 4);
            expect(TestRangeUtils.expandRangeGetString(range, document)).toEqual('hello world');
        });

        it('Partly Selected Text Two Text Nodes Multi Node Selection', function(){
            var nonTxtNode1 = document.createElement('div'),
                nonTxtNode2 = document.createElement('span'),
                nonTxtNode3 = document.createElement('p'),
                txtNode1 = document.createTextNode('hello'),
                txtNode2 = document.createTextNode(' world'),
                range = document.createRange();

            nonTxtNode3.appendChild(txtNode1);
            nonTxtNode3.appendChild(txtNode2);
            nonTxtNode2.appendChild(nonTxtNode3);
            nonTxtNode1.appendChild(nonTxtNode2);
            testBody.appendChild(nonTxtNode1);
            range.setStart(txtNode1, 1);
            range.setEnd(txtNode2, 1);
            expect(TestRangeUtils.expandRangeGetString(range, document)).toEqual('hello world');
        });

        it('Partly Selected Text Two Text Nodes Diff levels Single Node Selection', function(){
            var nonTxtNode1 = document.createElement('div'),
                nonTxtNode2 = document.createElement('span'),
                nonTxtNode3 = document.createElement('p'),
                txtNode1 = document.createTextNode('hello'),
                txtNode2 = document.createTextNode(' world'),
                range = document.createRange();

            nonTxtNode3.appendChild(txtNode1);
            nonTxtNode2.appendChild(nonTxtNode3);
            nonTxtNode2.appendChild(txtNode2);
            nonTxtNode1.appendChild(nonTxtNode2);
            testBody.appendChild(nonTxtNode1);
            range.setStart(txtNode1, 1);
            range.setEnd(txtNode1, 4);
            expect(TestRangeUtils.expandRangeGetString(range, document)).toEqual('<p>hello</p> world');
        });

        it('Partly Selected Text Two Text Nodes Diff levels Single Node Selection', function(){
            var nonTxtNode1 = document.createElement('div'),
                nonTxtNode2 = document.createElement('span'),
                nonTxtNode3 = document.createElement('p'),
                txtNode1 = document.createTextNode('hello'),
                txtNode2 = document.createTextNode(' world'),
                range = document.createRange();

            nonTxtNode3.appendChild(txtNode1);
            nonTxtNode2.appendChild(nonTxtNode3);
            nonTxtNode2.appendChild(txtNode2);
            nonTxtNode1.appendChild(nonTxtNode2);
            testBody.appendChild(nonTxtNode1);
            range.setStart(txtNode1, 1);
            range.setEnd(txtNode2, 1);
            expect(TestRangeUtils.expandRangeGetString(range, document)).toEqual('<p>hello</p> world');
        });
    });
});
