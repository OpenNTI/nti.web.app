describe('Whiteboard Matrix Utility Class Tests', function(){

    it('should test an identity matrix', function(){
        var matrix = new NTMatrix(), m;
        m = matrix.toTransform();

        expect(m.a).toBe(1);
        expect(m.b).toBe(0);
        expect(m.c).toBe(0);
        expect(m.d).toBe(1);
        expect(m.tx).toBe(0);
        expect(m.ty).toBe(0);
    });

    it('should init with a matrix', function(){
        var matrix = new NTMatrix({a:1,b:0,c:0, d:1, tx:120, ty:80}),
		        m, scale, rotation, translation;

	    m = matrix.toTransform();

        expect(m.a).toBe(1);
        expect(m.b).toBe(0);
        expect(m.c).toBe(0);
        expect(m.d).toBe(1);
        expect(m.tx).toBe(120);
        expect(m.ty).toBe(80);


	    translation = matrix.getTranslation();
	    rotation = matrix.getRotation();
	    scale = matrix.getScale();

	    expect(translation[0]).toBe(120);
	    expect(translation[1]).toBe(80);
	    expect(rotation).toBe(0);
	    expect(scale[0]).toBe(1);
	    expect(scale[1]).toBe(1);
    });

    it('should rotate',function(){
        var matrix = new NTMatrix(),
		    steps, rad,
		    step = Math.PI/4;

        expect(matrix.toTransform().a).toBe(1);
        expect(matrix.toTransform().b).toBeCloseTo(0, 4);
        expect(matrix.toTransform().c).toBeCloseTo(0, 4);
        expect(matrix.toTransform().d).toBe(1);

	    for(steps=0;steps<8; steps++){
		    rad = matrix.getRotation();
		    if(rad<0){ rad += (2*Math.PI); }//account for the values after PI become negative

	        expect(rad).toBeCloseTo(steps*step,4);

            matrix.rotate(step);

		    rad = matrix.getRotation();
		    if(rad<0){ rad += (2*Math.PI); }

            expect(rad).toBeCloseTo((steps+1)*step,4);
	    }
    });

    it('should scale by 2', function(){
        var t = {a:0.1342,b:0.2324,c:0.2344, d:0.34221, tx:0.45563, ty:0.235667},
            matrix = new NTMatrix(t), m;

        matrix.scale(2);

        m = matrix.toTransform();
        expect(m.a).toBe(t.a*2);
        expect(m.d).toBe(t.d*2);
        expect(m.c).toBe(t.c*2);
        expect(m.b).toBe(t.b*2);
    });

    it('should translate by (23,57)', function(){
        var t = {a:1,b:0,c:0, d:1, tx:0, ty:0},
            matrix = new NTMatrix(t),
		    m;

        matrix.translate(23, 57);

        m = matrix.toTransform();
        expect(m.tx).toBe(23);
        expect(m.ty).toBe(57);
        expect(m.a).toBe(t.a);
        expect(m.b).toBe(t.b);
    });

    it('should translate by (10,20), scale by 2.5, then rotate completely around', function(){
        var t = {a:1,b:0,c:0, d:1, tx:0, ty:0},
            matrix = new NTMatrix(t),
            f = 2.5,
	        steps, rad,
	        step = Math.PI/ 4,
		    scale, trans;

        matrix.translate(10,20);
        matrix.scale(f);

	    for(steps=0;steps<8; steps++){
            matrix.rotate(step);
		    scale = matrix.getScale();
		    trans = matrix.getTranslation();

		    expect(scale[0]).toBe(f);
		    expect(scale[1]).toBe(f);
		    expect(trans[0]).toBe(10);
		    expect(trans[1]).toBe(20);

            rad = matrix.getRotation();
            if(rad<0){ rad += (2*Math.PI); }

            expect(rad).toBeCloseTo((steps+1)*step,4);
        }

    });

    it('should rotate by 120, then scale by 0.45', function(){
        var t = {a:1,b:0,c:0, d:1, tx:0, ty:0},
            matrix = new NTMatrix(t),
            f=0.45,
		    rad=WBUtils.toRadians(120),
		    m;

        matrix.rotate(rad);
        matrix.scale(f);
        m = matrix.toTransform();

        expect(m.a).toBeCloseTo(t.a*f*Math.cos(rad),4);
        expect(m.b).toBeCloseTo(f*Math.sin(rad),4);
        expect(m.c).toBeCloseTo(f*-Math.sin(rad),4);
        expect(m.d).toBeCloseTo(t.d*f*Math.cos(rad),4);
    });

});
