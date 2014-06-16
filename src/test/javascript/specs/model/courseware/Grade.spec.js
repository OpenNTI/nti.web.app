describe('Grade model test', function() {
	function buildGrade(val) {
		var grade = NextThought.model.courseware.Grade.create({
			value: val
		});

		return grade;
	}

	function randomNumber() {
		return (Math.random() * 100).toFixed(2);
	}

	function randomLetter() {
		var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
			r = Math.floor(Math.random() * possible);

		return possible.charAt(r);
	}

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
