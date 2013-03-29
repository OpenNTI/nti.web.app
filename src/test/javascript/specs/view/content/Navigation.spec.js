describe("Navigation.js tests",function(){
	var Navigation, testBody, noop = function(){};

	beforeEach(function(){
		testBody = document.createElement('div');
		document.body.appendChild(testBody);
		Navigation = Ext.create("NextThought.view.content.Navigation",{
			renderTo : testBody,
			initComponent :  noop,
			afterRender : noop
		});
	});

	afterEach(function(){
		document.body.removeChild(testBody);
	});

	describe("styleList Tests",function(){
		var result;
		it("Numeric", function(){
			var i;

			for(i = 1; i < 10; i++){
				result = Navigation.styleList(i,'1');
				expect(result).toBe(i);
			}
		});

		it("Lower alphabetic",function(){
			result = Navigation.styleList(27,'a');
			expect(result).toBe('aa');
		});

		it("Upper alphabetic",function(){
			result = Navigation.styleList(27,'A');
			expect(result).toBe('AA');
		});

		it("Lower RomanNumeral",function(){
			result = Navigation.styleList(11,'i');
			expect(result).toBe('xi');
		});

		it("Upper RomanNumeral",function(){
			result = Navigation.styleList(11,'I');
			expect(result).toBe('XI');
		})
	});
	describe("toRomanNumeral Tests", function(){

		it('Numbers 1-10',function(){
			var i, result, resultObj = {
				1: 'I',
				2: 'II',
				3: 'III',
				4: 'IV',
				5: 'V',
				6: 'VI',
				7: 'VII',
				8: 'VIII',
				9: 'IX',
				10: 'X'
			};

			for(i = 1; i < 11; i++){
				result = Navigation.toRomanNumeral(i);
				expect(result).toBe(resultObj[i]);
			}
		});

		describe("Greater than 10",function(){
			it("20",function(){
				var result = Navigation.toRomanNumeral(20);
				expect(result).toBe("XX");
			});

			it("51",function(){
				var result = Navigation.toRomanNumeral(51);
				expect(result).toBe("LI");
			});

			it("123",function(){
				var result = Navigation.toRomanNumeral(123);
				expect(result).toBe("CXXIII");
			});
		});
	});

	describe("toBase26SansNumbers Tests",function(){
		var alphabet, result;

		beforeEach(function(){
			alphabet = ' abcdefghijklmnopqrstuvwxyz';
		});

		it("Numbers 1-26",function(){
			var i;

			for(i = 1; i <=26; i++){
				result = Navigation.toBase26SansNumbers(i);
				expect(result).toBe(alphabet.charAt(i));
			}
		});

		describe("A few between 26-702",function(){
			it("27",function(){
				result = Navigation.toBase26SansNumbers(27);
				expect(result).toBe('aa');
			});

			it("300",function(){
				result = Navigation.toBase26SansNumbers(300);
				expect(result).toBe('kn');
			});

			it("702",function(){
				result = Navigation.toBase26SansNumbers(702);
				expect(result).toBe('zz');
			})
		});

		it("703",function(){
			result = Navigation.toBase26SansNumbers(703);
			expect(result).toBe('aaa');
		});

	});
});
