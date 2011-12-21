describe("Annotation Utils", function() {

	var div,
		testWhiteboard =
		{
			"Class":"Canvas",
			"shapeList":[
				{
					"Class":"CanvasPolygonShape",
					"sides":4,
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
		if(div)return;

		var req = new XMLHttpRequest(),
			txt, rf, start, end;

		req.open('GET',_AppConfig.server.host+'/annotation-test.html',false);
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


	it("should be a note with whiteboard",function(){

		var note = Ext.create('NextThought.model.Note',{body:['test',Ext.clone(testWhiteboard)]}),
			text = AnnotationUtils.compileBodyContent(note),
				//be carefull editing this pattern, spaces will become the pattern: .*?
			reg = 'test ' +//plain text part —
					'<div.+?class=".*?body-divider.*?".+?> ' +
						'<svg.+?> ' +
							'<defs> ' +
								//'( <clipPath.+?> <rect.+?> </rect> </clipPath>)+ ' +
							'</defs> ' +
							'<rect.+?> </rect> ' +
								'( <path.+?> </path>)+ ?' +
						'</svg> ' +
					'</div>';

		expect(new RegExp(reg.replace(/\S+/g,'.*?'),'i').test(text)).toBeTruthy();

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
				getThumbnail: thumbnailGen
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
			OID: 'test-note-oid-2',
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
			OID: 'test-note-oid-2.3',
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

		var anchors = Ext.Array.unique(Ext.toArray(document.querySelectorAll('#NTIContent A[name]'))),
			all = Ext.Array.unique(Ext.toArray(document.querySelectorAll('#NTIContent *')));

		Ext.each(anchors,function(a,i,c){
			expect(c[i+1]).toBe(AnnotationUtils.getNextAnchor(a));
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


	it("should be able to identify a block node",function(){
		function makeIt(tag, blocky){
			var q = blocky? ':any({display*=block}|{display=box})' : '{display=inline}',
				e = Ext.select(tag+q).first().dom;

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
		function doTest(el){
			var path = AnnotationUtils.getPathTo(el);
			expect(path).toBeTruthy();
			expect(AnnotationUtils.getNodeFromXPath(path)).toBe(el);
		}

		var c=0,el, all = document.evaluate('id("NTIContent")//*', document, null, XPathResult.ANY_TYPE, null);
		while((el = all.iterateNext())) doTest(el);
	});


	//this needs to remain the last spec in this suite
	it("should cleanup",function(){
		document.body.removeChild(div);
		div = null;
	});
});
