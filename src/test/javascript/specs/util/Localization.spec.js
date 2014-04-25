describe('Localization utility tests', function() {
	var localUtil, oldStrings, strings;

	beforeEach(function() {
		oldString = window.NTIStrings;

		strings = {
			simpleString: 'Simple Test String.',
			formatterString: 'Formatter string {name} {foo} {bar}.',
			PluralForms: {
				'simple': {
					forms: ['{#} simples', 'simpless {#}', 'simplesss'],
					ranges: {
						0: -1,
						1: 0,
						2: 1,
						3: 2,
						4: -1,
						5: 0,
						6: 1,
						7: 2,
						undefined: 2
					}
				},
				'rule': {
					forms: ['rules', 'ruless', 'rulesss'],
					rule: function(n) {
						return n % 4 - 1;
					}
				}
			}
		};

		window.NTIStrings = strings;

		localUtils = Object.create(NextThought.util.Localization);
	});

	afterEach(function() {
		window.NTIStrings = oldString;
	});

	describe('getExternalString tests', function() {
		it('gettting an existing string', function() {
			var string = localUtils.getExternalizedString('simpleString');

			expect(string).toBe('Simple Test String.');
		});

		it('getting an non existent string with default', function() {
			var string = localUtils.getExternalizedString('nonexistant', 'default');

			expect(string).toBe('default');
		});

		it('getting an non existent string with out a default and noKey = true', function() {
			var string = localUtils.getExternalizedString('nonexistant', null, true);

			expect(string).toBe('');
		});

		it('getting an non existent string with out a default and noKey = false', function() {
			var string = localUtils.getExternalizedString('nonexistant', null, false);

			expect(string).toBe('nonexistant');
		});
	});

	describe('formatExternalString tests', function() {
		it('with all replacements', function() {
			var string = localUtils.formatExternalString('formatterString', {
				name: 'name',
				foo: 'foo',
				bar: 'bar'
			});

			expect(string).toBe('Formatter string name foo bar.');
		});

		it('with some replacements', function() {
			var string = localUtils.formatExternalString('formatterString', {
				name: 'name',
				bar: 'bar'
			});

			expect(string).toBe('Formatter string name {foo} bar.');
		});

		it('with no replacements', function() {
			var string = localUtils.formatExternalString('formatterString');

			expect(string).toBe('Formatter string {name} {foo} {bar}.');
		});

		it('with none existant replacements', function() {
			var string = localUtils.formatExternalString('formatterString', { nonExistant: 'nonexistant'});

			expect(string).toBe('Formatter string {name} {foo} {bar}.');
		});

		it('with non-formatter string', function() {
			var string = localUtils.formatExternalString('simpleString', { nonExistant: 'nonexistant'});

			expect(string).toBe('Simple Test String.');
		});

		it('with non-existant string', function() {
			var string = localUtils.formatExternalString('nonexistant', { nonExistant: 'nonexistant'});

			expect(string).toBe('nonexistant');
		});
	});

	describe('puralizeString tests', function() {
		var addSs;

		beforeEach(function() {
			addSs = function(word, n) {
				var i = 0;

				for (i = 0; i < n; i++) {
					word += 's';
				}

				return word;
			};
		});

		describe('range tests', function() {
			it('n in range', function() {
				var i, pl = localUtils.pluralizeString, k = 'simple',
					one = 'simples', two = 'simpless', three = 'simplesss';

				expect(pl(0, k)).toBe('0 simple');
				expect(pl(4, k)).toBe('4 simple');

				expect(pl(1, k)).toBe('1 simples');
				expect(pl(5, k)).toBe('5 simples');

				expect(pl(2, k)).toBe('simpless 2');
				expect(pl(6, k)).toBe('simpless 6');

				expect(pl(3, k)).toBe('simplesss');
				expect(pl(7, k)).toBe('simplesss');
			});

			it('n out of range', function() {
				var i, pl = localUtils.pluralizeString;

				for (i = 8; i <= 12; i++) {
					expect(pl(i, 'simple')).toBe('simplesss');
				}
			});
		});

		it('rule test', function() {
			var i, pl = localUtils.pluralizeString;

			for (i = 0; i <= 8; i++) {
				expect(pl(i, 'rule')).toBe(addSs('rule', i % 4));
			}
		});
	});
});
