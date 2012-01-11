describe("Whiteboard Functionality",function(){

	it("should work!", function(){
		//expect(false).toBeTruthy();
	});

	it('json should be scaled down, then back up and match', function(){

		function eq(a,b){
			var _ap = Object.keys(a),
				_bp = Object.keys(b),
				k, _a, _b;

			//if there are different keys...its not equal
			if(_ap.length != _bp.length || Ext.Array.difference(_ap,_bp).length > 0){
				throw "Keys don't match each other";
			}

			for( k in a ){
				if(!a.hasOwnProperty(k))continue;

				_a = a[k];
				_b = b[k];

				if(typeof(_a) !== typeof(_b)){
					throw "different types at the key: "+k;
				}

				switch(typeof(_a)){
					case 'object': eq(_a,_b); break;
					case 'string': if( _a != _b) throw 'strings not =='; break;
					case 'number':
						if( Math.abs(_a - _b) > 0.000001 ) throw 'numbers don\'t come within epsilon';
						break;
					default:
						console.log('compare? '+typeof(_a));
				}
			}

			return true;
		}

		//this tests the fields that scale...doesn't have to be a fully qualified canvas/shape
		var json = {"transform":{"a":147,"b":-3,"c":3,"d":147,"tx":80,"ty":101},"strokeWidth":"0.001206273%", "strokeWidthTarget": 1},
			scaleFactor = 829,//if you change this, change strokeWidth to 1/scaleFactor
			down = ShapeFactory.scaleJson(1/scaleFactor, Ext.clone(json)),
			up = ShapeFactory.scaleJson(scaleFactor, Ext.clone(down));

		expect(eq(json,up)).toBeTruthy();



	});

});
