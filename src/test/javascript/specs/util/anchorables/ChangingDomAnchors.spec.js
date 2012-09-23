describe("Tests with Changing Documents", function() {

	var testBody;

	beforeEach(function(){
		testBody = document.createElement('div');
		document.body.appendChild(testBody);
	});

	afterEach(function(){
		document.body.removeChild(testBody);
	});

	function addElement(daddy, tag, attrs) {
		var sonny = document.createElement(tag);
		for (var a in attrs) sonny.setAttribute(a, attrs[a]);
		if (daddy) daddy.appendChild(sonny); 
		return sonny;
	}

	function insertElement(daddy, bigBrother, tag, attrs) {
		var sonny = document.createElement(tag);
		for (var a in attrs) sonny.setAttribute(a, attrs[a]);
		if (daddy) daddy.insertBefore(sonny, bigBrother); 
		return sonny;
	}

	function addTextNode(daddy, text) {
		var sonny = document.createTextNode(text);
		if (daddy) daddy.appendChild(sonny); 
		return sonny;
	}

	function makeRange(sn, so, fn, fo) {
		var range = document.createRange();
		range.setStart(sn,so);
		range.setEnd(fn,fo);
		return range;
	}

	describe('Fuzzy Anchoring Tests', function() {
		it('Single paragraph', function() {
			var div = addElement(testBody,'div',{'Id':'ThisIdIsTheBest'});
				var p = addElement(div,'p',{});
					var t1 = addTextNode(p,'This is some somewhat but not particularly long text for readers with short attention spans.');
			range = makeRange(t1,13,t1,47);
			rangeDescription = Anchors.createRangeDescriptionFromRange(range, document).description;
			start = rangeDescription.getStart()
			expect(start.getContexts()[0].contextOffset).toEqual(84);
			t1.data = 'This is some somewhat but not particularly long text for readers with short attention spans. Here are some extra words.';
			var walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
			walker.currentNode = t1;
			var pointer = rangeDescription.getStart();
			expect(Anchors.getCurrentNodeMatches(pointer, walker)[0].confidence).toBeCloseTo(0.458);
		});
        it('Multiple paragraphs with in-between additions', function() {       
            var div = addElement(testBody,'div',{'Id':'ThisIdIsTheBest'});                
                var p1 = addElement(div,'p',{});                                          
                    var t1 = addTextNode(p1,'This is some somewhat but not particularly long text for readers with short attention spans.');
                var p2 = addElement(div,'p',{});                                          
                    var t2 = addTextNode(p2,'This is some more text containing many, many uninteresting words.');
            range = makeRange(t1,13,t2,22);                                               
            rangeDescription = Anchors.createRangeDescriptionFromRange(range, document).description;
            var start = rangeDescription.getStart();                                      
            var startWalker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);       
            startWalker.currentNode = t1;                                                 
            var end = rangeDescription.getEnd();                                          
            var endWalker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);         
            endWalker.currentNode = t2;                                                   
            //Insert image element in between                                             
            var img = insertElement(div,p2,'img',{});                                     
            expect(Anchors.getCurrentNodeMatches(start, startWalker)[0].confidence).toEqual(1);
            expect(Anchors.getCurrentNodeMatches(end, endWalker)[0].confidence).toEqual(1);
            //Insert span containing text in between                                      
            var span = insertElement(div,p2,'span',{});                                   
                var t15 = addTextNode(span,'Here are some extra words in a span');        
            expect(Anchors.getCurrentNodeMatches(start, startWalker)[0].confidence).toEqual(1);
            expect(Anchors.getCurrentNodeMatches(end, endWalker)[0].confidence).toEqual(1);
        });
		it('Multiple paragraphs with empty paragraphs added outside the range', function() {
			var div = addElement(testBody,'div',{'Id':'ThisIdIsTheBest'});
				var p1 = addElement(div,'p',{});
					var t1 = addTextNode(p1,'This is some somewhat but not particularly long text for readers with short attention spans.');
				var p2 = addElement(div,'p',{});
                	var t2 = addTextNode(p2,'This is some more text containing many, many uninteresting words.');
			range = makeRange(t1,13,t2,22);
			rangeDescription = Anchors.createRangeDescriptionFromRange(range, document).description;
			var start = rangeDescription.getStart();
			var startWalker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
			startWalker.currentNode = t1;
			var end = rangeDescription.getEnd();
			var endWalker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
			endWalker.currentNode = t2;
			//Insert empty paragraphs before and after
			var p0 = insertElement(div,p1,'p',{});
				var t0 = addTextNode(p0,'');
			var p3 = addElement(div,'p',{});
				var t3 = addTextNode(p3,'');
			var preStartWalker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
			preStartWalker.currentNode = t0;
			var afterEndWalker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
			afterEndWalker.currentNode = t3;
			expect(Anchors.getCurrentNodeMatches(start, startWalker)[0].confidence).toBeCloseTo(0.666);
			expect(Anchors.getCurrentNodeMatches(start, preStartWalker).length).toEqual(0);
			expect(Anchors.getCurrentNodeMatches(end, endWalker)[0].confidence).toBeCloseTo(0.666);
			expect(Anchors.getCurrentNodeMatches(end, afterEndWalker).length).toEqual(0);
		});
		it('Multiple paragraphs with fals-matching paragraphs added outside the range', function() {
			var div = addElement(testBody,'div',{'Id':'ThisIdIsTheBest'});
				var p1 = addElement(div,'p',{});
					var t1 = addTextNode(p1,'This is some somewhat but not particularly long text for readers with short attention spans.');
				var p2 = addElement(div,'p',{});
                	var t2 = addTextNode(p2,'This is some more text containing many, many uninteresting words.');
			range = makeRange(t1,13,t2,22);
			rangeDescription = Anchors.createRangeDescriptionFromRange(range, document).description;
			var start = rangeDescription.getStart();
			var startWalker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
			startWalker.currentNode = t1;
			var end = rangeDescription.getEnd();
			var endWalker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
			endWalker.currentNode = t2;
			//Insert empty paragraphs before and after
			var p0 = insertElement(div,p1,'p',{});
				var t0 = addTextNode(p0,'This is some somewhat misleading (to the anchoring system) introductory text');
			var p3 = addElement(div,'p',{});
				var t3 = addTextNode(p3,'And more text containing things normal text containing which is quite hard to find');
			var preStartWalker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
			preStartWalker.currentNode = t0;
			var afterEndWalker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
			afterEndWalker.currentNode = t3;
			//Make those paragraphs contain false matches
			expect(Anchors.getCurrentNodeMatches(start, preStartWalker).length).toEqual(1);
			expect(Anchors.getCurrentNodeMatches(start, preStartWalker)[0].confidence).toBeCloseTo(0.535);
			expect(Anchors.getCurrentNodeMatches(end, afterEndWalker).length).toEqual(2);
			expect(Anchors.getCurrentNodeMatches(end, afterEndWalker)[0].confidence).toBeCloseTo(0.679);
			console.log(Anchors.getCurrentNodeMatches(end, afterEndWalker));
			expect(Anchors.getCurrentNodeMatches(end, afterEndWalker)[1].confidence).toBeCloseTo(0.476);
			var bkStart = Anchors.locateRangeEdgeForAnchor(start,div,null);
			var bkEnd = Anchors.locateRangeEdgeForAnchor(end,div,null);
			expect(bkStart.confidence).toBeCloseTo(0.554);
			expect(bkStart.node.data).toEqual(t1.data);
			//Currently breaks on this case
			expect(bkEnd.confidence).toBeCloseTo(0.372);
			expect(bkEnd.node.data).toEqual(t3.data);
		});
	});
	describe('Roundtrip Tests', function(){
		it('Can do roundtrips with modifications all within a textnode', function(){
			var div = addElement(testBody,'div',{'Id':'ThisIdIsTheBest'});
				var span = addElement(div,'span',{'Id':'12312312'});
					var p = addElement(span,'p',{});
						var t1 = addTextNode(p,'This is some somewhat but not particularly long text for readers with short attention spans.');
					var p2 = addElement(span,'p',{});
						var t2 = addTextNode(p2,'This is some more text containing many uninteresting words.');

			range = makeRange(t1,13,t1,47);
			result = Anchors.createRangeDescriptionFromRange(range, document).description;
			bk = Anchors.toDomRange(result,document);
			expect(""+bk).toEqual("somewhat but not particularly long");
			t1.data = 'This is some somewhat but not particularly long text for readers with short attention spans. Here are some extra words.';
			bk = Anchors.toDomRange(result,document);
			expect(""+bk).toEqual("somewhat but not particularly long");
		});
	});
});
