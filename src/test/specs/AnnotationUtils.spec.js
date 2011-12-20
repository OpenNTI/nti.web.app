describe("Annotation Utils", function() {

	var div;

	beforeEach(function(){
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

	});

	afterEach(function(){
		document.body.removeChild(div);
		div = null;
	});

	describe("Annotation Utils Tests", function() {

		it("AnnotationUtils is defined", function() {
			expect(NextThought.util.AnnotationUtils).toBeDefined();
			expect(AnnotationUtils).toBeDefined();
		});


	});
});
