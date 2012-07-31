describe('Whiteboard Matrix Utility Class Tests', function(){

    it('should test an identity matrix', function(){
        var matrix = new NTMatrix();
        var m = matrix.toTransform();

        expect(m.a).toBe(1);
        expect(m.b).toBe(0);
        expect(m.c).toBe(0);
        expect(m.d).toBe(1);
        expect(m.tx).toBe(0);
        expect(m.ty).toBe(0);
    });

    it('should init with a matrix', function(){
        var matrix = new NTMatrix({a:1,b:0,c:0, d:1, tx:120, ty:80});
        var m = matrix.toTransform();
        var matrix2, m2;

        expect(m.a).toBe(1);
        expect(m.b).toBe(0);
        expect(m.c).toBe(0);
        expect(m.d).toBe(1);
        expect(m.tx).toBe(120);
        expect(m.ty).toBe(80);

        matrix2 = Ext.clone(matrix);
        m2 = matrix2.toTransform();

        expect(m2.tx).toBe(m.tx);
        expect(m2.ty).toBe(m.ty);
    });

    it('should rotate by 90 degrees',function(){
        var matrix = new NTMatrix();

        expect(matrix.toTransform().a).toBe(1);
        expect(matrix.toTransform().b).toBe(0);
        expect(matrix.toTransform().c).toBe(0);
        expect(matrix.toTransform().d).toBe(1);

        matrix.rotate(WBUtils.toRadians(90));

        expect(matrix.toTransform().a).toBe(0);
        expect(matrix.toTransform().b).toBe(1);
        expect(matrix.toTransform().c).toBe(-1);
        expect(matrix.toTransform().d).toBe(0);
    });

    it('should scale by 2', function(){
        var t = {a:0.1342,b:0.2324,c:0.2344, d:0.34221, tx:0.45563, ty:0.235667};
        var matrix = new NTMatrix(t);
        var m;

        matrix.scale(2);

        m = matrix.toTransform();
        expect(m.a).toBe(t.a*2);
        expect(m.d).toBe(t.d*2);
        expect(m.c).toBe(t.c*2);
        expect(m.b).toBe(t.b*2);
    });

    it('should translate by (23,57)', function(){
        var t = {a:1,b:0,c:0, d:1, tx:0, ty:0};
        var matrix = new NTMatrix(t);
        var m;

        matrix.translate(23, 57);

        m = matrix.toTransform();
        expect(m.tx).toBe(23);
        expect(m.ty).toBe(57);
        expect(m.a).toBe(t.a);
        expect(m.b).toBe(t.b);
    });

    it('should translate by (10,20), scale by 2.5, then rotate by -60 degrees', function(){
        var t = {a:1,b:0,c:0, d:1, tx:0, ty:0};
        var matrix = new NTMatrix(t);
        var f = 2.5, rad=WBUtils.toRadians(-60), m;

        matrix.translate(10,20);
        matrix.scale(f);
        matrix.rotate(rad);

        m = matrix.toTransform();
        expect(m.a).toBeCloseTo(t.a*f*Math.cos(rad));
        expect(m.b).toBeCloseTo(f*Math.sin(rad));
        expect(m.c).toBeCloseTo(f*-Math.sin(rad));
        expect(m.d).toBeCloseTo(t.d*f*Math.cos(rad));
    });

    it('should rotate by 120, then scale by 0.45', function(){
        var t = {a:1,b:0,c:0, d:1, tx:0, ty:0};
        var matrix = new NTMatrix(t);
        var f=0.45, rad=WBUtils.toRadians(120), m;

        matrix.rotate(rad);
        matrix.scale(f);
        m = matrix.toTransform();

        expect(m.a).toBeCloseTo(t.a*f*Math.cos(rad));
        expect(m.b).toBeCloseTo(f*Math.sin(rad));
        expect(m.c).toBeCloseTo(f*-Math.sin(rad));
        expect(m.d).toBeCloseTo(t.d*f*Math.cos(rad));
    });

});