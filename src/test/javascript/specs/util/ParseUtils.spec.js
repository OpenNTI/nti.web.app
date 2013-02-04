describe("Check Parsing Utility Functions", function() {

	describe("parseItems", function(){

		it("This Change blew up on Alpha", function(){
			var changeJSON = {
				"Creator":"chris.utz@nextthought.com",
				"Last Modified":1334086521.476041,
				"ChangeType":"Shared",
				"ID":"tag:nextthought.com,2011-10:chris.utz@nextthought.com-OID-0x1e24:5573657273",
				"Item":{
					"startAnchor":"a0000000144",
					"startOffset":0,
					"CreatedTime":1334086514.851546,
					"startHighlightedText":"You know how to add, subtract, multiply, and divide. In fact, you may already know how to solve many of the problems in this chapter. So why do we start this book with an entire chapter on arithmetic? ",
					"MimeType":"application/vnd.nextthought.highlight",
					"endAnchor":"",
					"top":0,
					"tags":[],
					"NTIID":"tag:nextthought.com,2011-10:chris.utz@nextthought.com-OID-0x1e24:5573657273",
					"AutoTags":[],
					"Class":"Highlight",
					"startXpath":"id(\"NTIContent\")/DIV[1]/P[1]/text()[1]",
					"endOffset":29,
					"endXpath":"id(\"NTIContent\")/DIV[1]/P[1]/text()[1]",
					"ID":"tag:nextthought.com,2011-10:chris.utz@nextthought.com-OID-0x1e24:5573657273",
					"endHighlightedText":"You know how to add, subtract",
					"startHighlightedFullText":"You know how to add, subtract, multiply, and divide. In fact, you may already know how to solve many of the problems in this chapter. So why do we start this book with an entire chapter on arithmetic? ",
					"anchorPoint":"",
					"ContainerId":"tag:nextthought.com,2011-10:AOPS-HTML-prealgebra.0",
					"Creator":"chris.utz@nextthought.com",
					"Last Modified":1334086521.475648,
					"OID":"tag:nextthought.com,2011-10:chris.utz@nextthought.com-OID-0x1e24:5573657273",
					"sharedWith":["jason.madden@nextthought.com"],
					"anchorType":"",
					"endHighlightedFullText":"You know how to add, subtract, multiply, and divide. In fact, you may already know how to solve many of the problems in this chapter. So why do we start this book with an entire chapter on arithmetic? ",
					"left":0
				},
				"Class":"Change"
			},
			result;

			result = ParseUtils.parseItems(changeJSON)[0];
			expect(result).toBeTruthy();
			expect(result.get('Item').get('Class')).toEqual('Highlight');
		});

	});

	describe("NTIID parsing", function(){

		var parse = ParseUtils.parseNtiid;

		function theParts(ntiid){
			var parts = [];

			if(!ntiid){
				return null;
			}

			if(ntiid.authority){
				parts.push(ntiid.authority.name);
				parts.push(ntiid.authority.date);
			}
			else{
				parts.push(null);
				parts.push(null);
			}

			if(ntiid.specific){
				parts.push(ntiid.specific.provider);
				parts.push(ntiid.specific.type);
				parts.push(ntiid.specific.typeSpecific);
			}
			else{
				parts.push(null);
				parts.push(null);
				parts.push(null);
			}

			return parts;
		}

		it('Handles complete junk', function(){
			var id = 'http://foobar.com';
			expect(parse(id)).toBeFalsy();
		});

		it('Handles bad authority', function(){
			var id = 'tag:foo:a-b-c';
			expect(parse(id)).toBeFalsy();
		});

		it('Parses ntiid', function(){
			var id = 'tag:a,b:c-d-e',
				r = parse(id);

			expect(r).toBeTruthy();
			expect(theParts(r)).toEqual(['a', 'b', 'c', 'd', 'e']);
			expect(r.toString()).toEqual(id);
			expect(r.toURLSuffix()).toEqual('#!d/c/e');
		});

		it('Parses ntiid with no provider', function(){
			var id = 'tag:a,b:d-e',
				r = parse(id);

			expect(r).toBeTruthy();
			expect(theParts(r)).toEqual(['a', 'b', null, 'd', 'e']);
			expect(r.toString()).toEqual(id);
			expect(r.toURLSuffix()).toEqual('#!d/e');
		});

		it('Handles : in the typespecify part', function(){
			var id = 'tag:a,b:c-d-e:f',
				r = parse(id);

			expect(r).toBeTruthy();
			expect(theParts(r)).toEqual(['a', 'b', 'c', 'd', 'e:f']);
			expect(r.toString()).toEqual(id);
			expect(r.toURLSuffix()).toEqual('#!d/c/e%3Af');
		});
	});

	describe("parseNTIHash", function(){
		var parse = ParseUtils.parseNtiHash;

		it('Parses result of ntiid', function(){
			var hash = '#!d/c/e',
				expected = 'tag:nextthought.com,2011-10:c-d-e';
				r = parse(hash);

			expect(r).toBeTruthy();
			expect(r.toString()).toEqual(expected);
		});

		it('Parses result of ntiid with no provider', function(){
			var hash = '#!d/e',
				expected = 'tag:nextthought.com,2011-10:d-e';
				r = parse(hash);

			expect(r).toBeTruthy();
			expect(r.toString()).toEqual(expected);
		});

		it('Parses result of ntiid with : in type specific part', function(){
			var hash = '#!d/c/e%3Af',
				expected = 'tag:nextthought.com,2011-10:c-d-e:f';
				r = parse(hash);

			expect(r).toBeTruthy();
			expect(r.toString()).toEqual(expected);
		});

	});
});
