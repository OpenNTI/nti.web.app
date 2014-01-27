describe('Annotation Utils', function() {

	it('AnnotationUtils is defined', function() {
		expect(NextThought.util.Annotations).toBeDefined();
		expect(AnnotationUtils).toBeDefined();
	});


	describe('Tests with test file', function() {
		var txt,
		div = null,
		testWhiteboard =
		{
			'MimeType': 'application/vnd.nextthought.canvas',
			'Class': 'Canvas',
			'shapeList': [
				{
					'Class': 'CanvasPolygonShape',
					'sides': 4,
					'fillColor': '#000000',
					'strokeColor': '#000000',
					'transform': {
						'Class': 'CanvasAffineTransform',
						'a': 0.151,
						'b': 0,
						'c': 0,
						'd': 0.151,
						'tx': 0.1,
						'ty': 0.1
					}
				},
				{
					'Class': 'CanvasCircleShape',
					'fillColor': '#000000',
					'strokeColor': '#000000',
					'transform': {
						'Class': 'CanvasAffineTransform',
						'a': 0.151,
						'b': 0,
						'c': 0,
						'd': 0.151,
						'tx': 0.3,
						'ty': 0.1
					}
				},
				{
					'Class': 'CanvasPolygonShape',
					'sides': 1,
					'fillColor': '#000000',
					'strokeColor': '#000000',
					'transform': {
						'Class': 'CanvasAffineTransform',
						'a': 0.15,
						'b': 0.15,
						'c': -0.0007071068,
						'd': 0.0007071068,
						'tx': 0.5,
						'ty': 0.1
					}
				}
			]
		};

		function setup() {
			if (div || !txt) {
				return;
			}

			var rf, start, end;

			rf = txt.toLowerCase();

			start = rf.indexOf('>', rf.indexOf('<body')) + 1;
			end = rf.indexOf('</body');

			expect(start).toBeGreaterThan(0);
			expect(start).toBeLessThan(end);

			expect(end).toBeGreaterThan(0);
			expect(end).toBeGreaterThan(start);
			expect(end).toBeLessThan(txt.length);

			div = document.createElement('div');
			expect(div).toBeTruthy();

			div.setAttribute('id', 'NTIContent');
			div.setAttribute('style', 'display: none');
			document.body.appendChild(div);

			div.innerHTML = txt.substring(start, end);
		}

		beforeEach(function() { setup(); });

		it('should load the test page', function() {
			var req = new XMLHttpRequest(),
				flag = false;

			runs(function() {
				req.open('GET', getURL('/annotation-test.html'), true);
				req.onreadystatechange = function() {if (req.readyState === 4) { flag = true; }};
				req.send('');
			});

			waitsFor(function() { return flag; }, 'Could not load page?', 1000);

			runs(function() {
				expect(req.status).toBe(200);
				txt = req.responseText;
			});
		});


		it('should only be text, no tags', function() {

			var note = Ext.create('NextThought.model.Note', {body: ['test ', '<b>bold</b>', '<whoKnows/> text']}),
			text = note.getBodyText().replace(/\W+/g, ' ');

			expect(text).toBe('test bold text');
		});




		it('should be a note with whiteboard', function() {

			var note = Ext.create('NextThought.model.Note', {body: ['test', Ext.clone(testWhiteboard)]}),
			//be carefull editing this pattern, spaces will become the pattern: .*?
			reg = 'test ' +//plain text part —
			'<div.+?class=".*?body-divider.*?".+?> ' +
				'<img.+?src="data:image/png;.+?".*?> ' +
				'</div>';

			note.compileBodyContent(function(text) {
				expect(new RegExp(reg.replace(/\S+/g, '.*?'), 'i').test(text)).toBeTruthy();
			});

		});


		it('should be able to identify a block node', function() {
			function makeIt(tag, blocky) {
				var q = blocky ? (':not({display=none}) > ' + tag + ':any({display*=block}|{display=box})') : (tag + '{display=inline}'),
				e = Ext.select(q).first().dom;

				return [e, blocky];
			}

			var a = [
				makeIt('div', true),
				makeIt('span', false)
			];

			a.forEach(function(o) {
				expect(AnnotationUtils.isBlockNode(o[0])).toBe(o[1]);
			});
		});


		//this needs to remain the last spec in this suite
		it('should cleanup', function() {
			document.body.removeChild(div);
			div = null;
		});
	});

	describe('Placeholder generation', function() {
		it('Doesnt mutate the child note CreatedTime', function() {
			var n = new NextThought.model.Note({CreatedTime: 1363547504.824524}),
				ct = n.get('CreatedTime').getTime(), holder, newCt;

			//Not used??
			holder = AnnotationUtils.replyToPlaceHolder(n);

			newCt = n.get('CreatedTime').getTime();

			expect(ct).toEqual(newCt);
		});
	});
});
