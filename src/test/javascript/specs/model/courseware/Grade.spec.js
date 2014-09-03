describe('Grade model test', function() {

	var oneWordValues = ['one', ' one', 'one ', ' one ', 'one x'],
		twoWordValues = ['one two', ' one two', 'one two ', ' one two ', 'one two x'];

	function buildGrade(val) {
		var grade = NextThought.model.courseware.Grade.create({
			value: val,
			save: function() {}
		});

		return grade;
	}

	function randomNumber() {
		return (Math.random() * 100).toFixed(2);
	}

	function randomLetter() {
		var possible = 'ABCDFabcdf',
			r = Math.floor(Math.random() * possible.lenth);

		return possible.charAt(r);
	}

	describe('getValue tests', function() {
		it('One word value tests no letter grade', function() {
			var i, values, grade;

			for (i = 0; i < oneWordValues.length; i++) {
				grade = buildGrade(oneWordValues[i]);
				values = grade.getValues();

				expect(values.value).toBe(oneWordValues[i].trim());
				expect(values.letter).toBeFalsy();
			}
		});

		it('One word value tests with letter grade', function() {
			var i, values, grade, letter;

			for (i = 0; i < oneWordValues.length; i++) {
				letter = randomLetter();
				grade = buildGrade(oneWordValues[i] + ' ' + letter);
				values = grade.getValues();

				expect(values.value).toBe(oneWordValues[i].trim());
				expect(values.letter).toBe(letter);
			}
		});

		it('Two word value tests no letter grade', function() {
			var i, values, grade;

			for (i = 0; i < twoWordValues.length; i++) {
				grade = buildGrade(twoWordValues[i]);
				values = grade.getValues();

				expect(values.value).toBe(twoWordValues[i].trim());
				expect(values.letter).toBeFalsy();
			}
		});

		it('Two word value tests with letter grade', function() {
			var i, values, grade, letter;

			for (i = 0; i < twoWordValues.length; i++) {
				letter = randomLetter();
				grade = buildGrade(twoWordValues[i] + ' ' + letter);
				values = grade.getValues();

				expect(values.value).toBe(twoWordValues[i].trim());
				expect(values.letter).toBe(letter);
			}
		});
	});

	describe('valueEquals tests', function() {
		it('different number values', function() {
			var grade = buildGrade('one A');

			expect(grade.valueEquals('two')).toBeFalsy();
		});

		it('same number value, different letter', function() {
			var grade = buildGrade('one B');

			expect(grade.valueEquals('one')).toBeFalsy();
		});

		it('same number, same letter', function() {
			var grade = buildGrade('one A');

			expect(grade.valueEquals('one', 'A')).toBeTruthy();
		});

		it('same number, no letters', function() {
			var grade = buildGrade('one');

			expect(grade.valueEquals('one')).toBeTruthy();
		});

		it('same number, letter is - compared to null', function() {
			var grade = buildGrade('one -');

			expect(grade.valueEquals('one')).toBeTruthy();
		});

		it('same number, letter is null compared to -', function() {
			var grade = buildGrade('one');

			expect(grade.valueEquals('one', '-')).toBeTruthy();
		});
	});

	describe('is empty tests', function() {
		it('"# L" is not empty', function() {
			var val = randomNumber() + ' ' + randomLetter(),
				grade = buildGrade(val);

			expect(grade.isEmpty()).toBeFalsy();
		});

		it('"# -" is not empty', function() {
			var val = randomNumber() + ' -',
				grade = buildGrade(val);

			expect(grade.isEmpty()).toBeFalsy();
		});

		it('" L" is not empty', function() {
			var val = ' ' + randomLetter(),
				grade = buildGrade(val);

			expect(grade.isEmpty()).toBeFalsy();
		});

		it('" -" is empty', function() {
			var val = ' -',
				grade = buildGrade(val);

			expect(grade.isEmpty()).toBeTruthy();
		});

		it('"L" is not empty', function() {
			var val = randomLetter(),
				grade = buildGrade(val);

			expect(grade.isEmpty()).toBeFalsy();
		});

		it('"#" is not empty', function() {
			var val = randomNumber(),
				grade = buildGrade(val);

			expect(grade.isEmpty()).toBeFalsy();
		});

		it('"" is empty', function() {
			var val = randomNumber(),
				grade = buildGrade(val);

			expect(grade.isEmpty()).toBeFalsy();
		});
	});
});
