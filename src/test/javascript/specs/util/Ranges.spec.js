describe("RangeUtils tests", function() {

	var TestRangeUtils;

	beforeEach(function(){
		TestRangeUtils = {};
		/*jslint sub:true */ //no way to ignore reserved property if using don notation
		TestRangeUtils['__proto__'] = NextThought.util.Ranges['__proto__'];
	});

	describe('rangeIfItemPropSpan', function(){

		var testBody, itemProp, img, div, range;

		//Setup fixture
		beforeEach(function(){
			testBody = document.createElement('div');

			itemProp = document.createElement('div');
			itemProp.setAttribute('itemprop', 'nti-data-markupenabled');


			img = document.createElement('span');
			itemProp.appendChild(img);

			div = document.createElement('div')

			testBody.appendChild(itemProp);
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

		it('Doesnt return a range for anything else', function(){
			var r;

			range.selectNodeContents(div);
			r = TestRangeUtils.rangeIfItemPropSpan(range, document);
			expect(r).toBe(null);
		});
	});
});
