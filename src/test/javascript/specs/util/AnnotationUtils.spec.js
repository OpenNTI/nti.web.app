describe("Annotation Utils", function() {

	var div = null,
		testWhiteboard =
		{
			"Class":"Canvas",
			"shapeList":[
				{
					"Class":"CanvasPolygonShape",
					"sides":4,
					"fillColor": '#000000',
					"strokeColor": '#000000',
					"transform":{
						"Class":"CanvasAffineTransform",
						"a":0.151,
						"b":0,
						"c":0,
						"d":0.151,
						"tx":0.1,
						"ty":0.1
					}
				},
				{
					"Class":"CanvasCircleShape",
					"fillColor": '#000000',
					"strokeColor": '#000000',
					"transform":{
						"Class":"CanvasAffineTransform",
						"a":0.151,
						"b":0,
						"c":0,
						"d":0.151,
						"tx":0.3,
						"ty":0.1
					}
				},
				{
					"Class":"CanvasPolygonShape",
					"sides":1,
					"fillColor": '#000000',
					"strokeColor": '#000000',
					"transform":{
						"Class":"CanvasAffineTransform",
						"a":0.15,
						"b":0.15,
						"c":-0.0007071068,
						"d":0.0007071068,
						"tx":0.5,
						"ty":0.1
					}
				}
			]
		};

	function setup(){
		if(div) {
			return;
		}

		var req = new XMLHttpRequest(),
			txt, rf, start, end;

		req.open('GET',$AppConfig.server.host+'/annotation-test.html',false);
		req.send('');

		expect(req.status).toBe(200);

		txt = req.responseText;

		rf= txt.toLowerCase();

		start = rf.indexOf(">", rf.indexOf("<body"))+1;
		end = rf.indexOf("</body");

		expect(start).toBeGreaterThan(0);
		expect(start).toBeLessThan(end);

		expect(end).toBeGreaterThan(0);
		expect(end).toBeGreaterThan(start);
		expect(end).toBeLessThan(txt.length);

		div = document.createElement('div');
		expect(div).toBeTruthy();

		div.setAttribute('id','NTIContent');
		div.setAttribute('style','display: none');
		document.body.appendChild(div);

		div.innerHTML = txt.substring(start,end);
	}

	beforeEach(function(){ setup(); });


	it("AnnotationUtils is defined", function() {
		expect(NextThought.util.AnnotationUtils).toBeDefined();
		expect(AnnotationUtils).toBeDefined();
	});


	it("should only be text, no tags", function(){

		var note = Ext.create('NextThought.model.Note',{body:['test ','<b>bold</b>', '<whoKnows/> text']}),
			text = AnnotationUtils.getBodyTextOnly(note);

		expect(text).toBe('test bold text');
	});

	it("highlight body text should be some form of highlighted text", function(){

		var highlight = Ext.create('NextThought.model.Highlight',{
			startHighlightedFullText: 'In the beginning',
			startHighlightedText: 'beginning',
			endHighlightedFullText: ' was the command line',
			endHighlightedText: ' was',
			text: ''
		}),
		highlight2 = Ext.create('NextThought.model.Highlight',{
			startHighlightedFullText: 'DOMTreeID:10,47',
			startHighlightedText: 'DOMTreeID:10,47',
			endHighlightedFullText: ' was the command line',
			endHighlightedText: ' was',
			text: ''
		}),
		highlight3 = Ext.create('NextThought.model.Highlight',{
			startHighlightedFullText: 'DOMTreeID:10,47',
			startHighlightedText: 'DOMTreeID:10,47',
			endHighlightedFullText: 'DOMTreeID:10,49',
			endHighlightedText: 'DOMTreeID:10,49',
			text: ''
		});


		expect(AnnotationUtils.getBodyTextOnly(highlight)).toBe('beginning');
		expect(AnnotationUtils.getBodyTextOnly(highlight2)).toBe('was');
		expect(AnnotationUtils.getBodyTextOnly(highlight3)).toBe('content');
	});


	it("should be a note with whiteboard",function(){

		var note = Ext.create('NextThought.model.Note',{body:['test',Ext.clone(testWhiteboard)]}),
			//be carefull editing this pattern, spaces will become the pattern: .*?
			reg = 'test ' +//plain text part —
					'<div.+?class=".*?body-divider.*?".+?> ' +
						'<img.+?src="data:image/png;.+?".*?> '+
					'</div>';

		AnnotationUtils.compileBodyContent(note,function(text){
			expect(new RegExp(reg.replace(/\S+/g,'.*?'),'i').test(text)).toBeTruthy();
		});

	});


	it("should call callbacks if given",function(){


			var note = Ext.create('NextThought.model.Note',{body:[
					'test',
					Ext.clone(testWhiteboard),
					Ext.clone(testWhiteboard)
				]}),
				clickHandler = jasmine.createSpy(),
				thumbnailGen = jasmine.createSpy();

			AnnotationUtils.compileBodyContent(note,{
				getClickHandler: clickHandler,
				getThumbnail: function(v,id,c){
					thumbnailGen();
					c('');
				}
			});

			expect(clickHandler.callCount).toBe(2);
			expect(thumbnailGen.callCount).toBe(2);

		});


	it("should find an xpath", function(){

		var e = document.getElementById('a0000009638'),
			xpath = AnnotationUtils.getPathTo(e);

		expect(xpath.split('/').length).toBeGreaterThan(1);
		expect(/id\("NTIContent"\)/.test(xpath)).toBeTruthy();
	});


	it("should construct a reply",function(){

		var note = AnnotationUtils.noteToReply( Ext.create('NextThought.model.Note',{
			NTIID: 'test-note-oid-2',
			ID: 'test-2',
			inReplyTo: 'test-note-oid-1',
			references: ['test-note-oid-1'],
			ContainerId: 'foobar',
			anchorPoint: 'a00001'
		}) );

		expect(note.get('references').length).toBe(2);
		expect(note.get('inReplyTo')).toBe('test-note-oid-2');

	});


	it("should create a placeholder for a note", function(){
		var note = AnnotationUtils.replyToPlaceHolder( Ext.create('NextThought.model.Note',{
			NTIID: 'test-note-oid-2.3',
			ID: 'test-2.3',
			inReplyTo: 'test-note-oid-2.2',
			references: ['test-note-oid-1','test-note-oid-2.1','test-note-oid-2.2'],
			ContainerId: 'foobar',
			anchorPoint: 'a00001'
		}) );

		expect(note.getId()).toBe('test-note-oid-2.2');
		expect(note.get('references').length).toBe(2);
		expect(note.get('inReplyTo')).toBe('test-note-oid-2.1');
	});


	it("should build a new note from any element in the content", function(){

		var i, el, all;

		function doTest(el){
			var note = AnnotationUtils.selectionToNote({startContainer: el});

			expect(note).toBeTruthy();//todo: continue fleshing this out...
			expect(note.get('anchorPoint')).toBeTruthy();
		}

		//test all non-text nodes
		all = Ext.toArray(document.querySelectorAll('#NTIContent *'));
		for(i=all.length-1; i>=0; i--) doTest(all[i]);

		//Test all text nodes
		all = document.evaluate('id("NTIContent")//text()', document, null, XPathResult.ANY_TYPE, null);
		while((el = all.iterateNext())) doTest(el);
	});


	it("should find the next anchor", function(){

		var anchors = AnnotationUtils.getAnchors(),
			all = Ext.Array.unique(Ext.toArray(document.querySelectorAll('#NTIContent *')));

		Ext.each(anchors,function(a,i,c){
			var n = AnnotationUtils.getNextAnchor(a);
			expect(c[i+1]).toBe(n);
			expect(AnnotationUtils.getAnchor(a.getAttribute('name'))).toBe(a);
		});

		//no anchor found returns null...add it to the list of possible anchors.
		anchors.push(null);

		Ext.each(all, function(el){
			var nextAnchor = AnnotationUtils.getNextAnchorInDOM(el),
				x = Ext.Array.indexOf(anchors, nextAnchor),
				w = x-1,
				a, b,
				prevAnchor = anchors[w]||null;

			expect(x).toBeGreaterThan(-1);

			if(nextAnchor !== null){
				a = el.compareDocumentPosition(nextAnchor);
				expect(a & el.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
			}
			else {
				expect(prevAnchor).toBeTruthy();
			}

			if(prevAnchor !== null ){
				b = el.compareDocumentPosition(prevAnchor);
				if(b === 0){
					expect(el).toBe(prevAnchor);
				}
				else if(b === el.DOCUMENT_POSITION_FOLLOWING){
					expect(nextAnchor).toBeTruthy();

					a = prevAnchor.compareDocumentPosition(nextAnchor);
					expect(a & el.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
				}
				else{
					expect(b & (el.DOCUMENT_POSITION_PRECEDING | el.DOCUMENT_POSITION_CONTAINED_BY)).toBeTruthy();
				}
			}
			else {
				expect(nextAnchor).toBeTruthy();
			}
		});
	});

	it("should find the previous anchor", function(){

			var anchors = AnnotationUtils.getAnchors(),
				all = Ext.Array.unique(Ext.toArray(document.querySelectorAll('#NTIContent *')));

			//no anchor found returns null...add it to the list of possible anchors.
			anchors.unshift(null);

			Ext.each(anchors,function(a,i,c){
				if(a===null){ return; }

				var p = AnnotationUtils.getPreviousAnchorInDOM(a);

				expect(c[i-1]).toBe(p);
				expect(AnnotationUtils.getAnchor(a.getAttribute('name'))).toBe(a);
			});


			Ext.each(all, function(el){
				var prevAnchor = AnnotationUtils.getPreviousAnchorInDOM(el),
					x = Ext.Array.indexOf(anchors, prevAnchor),
					w = x+1,
					a, b,
					nextAnchor = anchors[w]||null;

				expect(x).toBeGreaterThan(-1);

				if(prevAnchor !== null){
					a = el.compareDocumentPosition(prevAnchor);
					expect(a & el.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
				}
				else {
					expect(nextAnchor).toBeTruthy();
				}

				if(nextAnchor !== null ){
					b = el.compareDocumentPosition(nextAnchor);
					if(b === 0){
						expect(el).toBe(nextAnchor);
					}
					else if(b === el.DOCUMENT_POSITION_PRECEDING){
						expect(prevAnchor).toBeTruthy();

						a = nextAnchor.compareDocumentPosition(prevAnchor);
						expect(a & el.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
					}
					else{
						expect(b & (el.DOCUMENT_POSITION_FOLLOWING | el.DOCUMENT_POSITION_CONTAINED_BY)).toBeTruthy();
					}
				}
				else {
					expect(prevAnchor).toBeTruthy();
				}
			});
		});


	it("should be able to identify a block node",function(){
		function makeIt(tag, blocky){
			var q = blocky? (':not({display=none}) > '+tag+':any({display*=block}|{display=box})') : (tag+'{display=inline}'),
				e = Ext.select(q).first().dom;

			return [e,blocky];
		}

		var a = [
			makeIt('div',true),
			makeIt('span',false)
		];

		a.forEach(function(o){
			expect(AnnotationUtils.isBlockNode(o[0])).toBe(o[1]);
		});
	});


	it("should find a node for an xpath", function(){

		var tags = {};
		function doTest(el){
			var path = AnnotationUtils.getPathTo(el);
			expect(path).toBeTruthy();
			expect(AnnotationUtils.getNodeFromXPath(path)).toBe(el);

			if(el.nodeName in tags)
				tags[el.nodeName] ++;
			else
				tags[el.nodeName] = 1;
		}

		var c=0,el, all = document.evaluate('id("NTIContent")//*', document, null, XPathResult.ANY_TYPE, null);
		while((el = all.iterateNext())) doTest(el);
	});


	it("should identify nodes: text, math and image", function(){

		var mathNode = Ext.select('*[class*=math]').first().dom,
			textNode = document.createTextNode('test'),
			imageNode = Ext.select('img').first().dom;

		expect(AnnotationUtils.isMathNode(mathNode)).toBeTruthy();
		expect(AnnotationUtils.isMathNode(textNode)).toBeFalsy();
		expect(AnnotationUtils.isMathNode(imageNode)).toBeFalsy();

		expect(AnnotationUtils.isTextNode(textNode)).toBeTruthy();
		expect(AnnotationUtils.isTextNode(mathNode)).toBeFalsy();
		expect(AnnotationUtils.isTextNode(imageNode)).toBeFalsy();

		expect(AnnotationUtils.isImageNode(imageNode)).toBeTruthy();
		expect(AnnotationUtils.isImageNode(mathNode)).toBeFalsy();
		expect(AnnotationUtils.isImageNode(textNode)).toBeFalsy();

	});

	it("should dig through nodes and return the first image node encountered", function(){
		var imageNode = Ext.select('img').first().dom,
			divNode = document.createElement('div'),
			spanNode = document.createElement('span'),
			pNode = document.createElement('p'),
			textNode = document.createTextNode('this is some text'),
			image2Node = Ext.select('img').last().dom,
			divNodeWithoutImage = document.createElement('div');

		//build up a tree, with several image nodes
		divNode.appendChild(imageNode);
		pNode.appendChild(textNode);
		spanNode.appendChild(pNode);
		spanNode.appendChild(image2Node);
		spanNode.appendChild(divNode);

		expect(AnnotationUtils.digForImageNode(imageNode)).toBe(imageNode);
		expect(AnnotationUtils.digForImageNode(divNode)).toBe(imageNode);
		expect(AnnotationUtils.digForImageNode(spanNode)).toBe(image2Node);
		expect(AnnotationUtils.digForImageNode(divNodeWithoutImage)).toBeNull();
	});

	it("should climb to a math node if the given node is a child of a math node", function(){

		var mathNode = Ext.select('*[class*=mathjax]').elements[44], //a more complicated math node with lots of kids
			textNode = document.createTextNode('test'),
			imageNode = Ext.select('img').first().dom,
			insideMathNode = mathNode.children[1].children[0].children[0].children[0].children[0];

		expect(AnnotationUtils.climbToMathNode(mathNode)).toBe(mathNode);
		expect(AnnotationUtils.climbToMathNode(insideMathNode)).toBe(mathNode);
		expect(AnnotationUtils.climbToMathNode(textNode)).toBeNull();
		expect(AnnotationUtils.climbToMathNode(imageNode)).toBeNull();
	});


	//this needs to remain the last spec in this suite
	it("should cleanup",function(){
		document.body.removeChild(div);
		div = null;
	});
});
