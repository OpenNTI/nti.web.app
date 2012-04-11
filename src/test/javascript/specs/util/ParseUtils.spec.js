describe("Check Parsing Utility Functions", function() {

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
