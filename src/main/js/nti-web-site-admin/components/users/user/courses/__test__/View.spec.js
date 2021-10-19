import { render, waitFor } from '@testing-library/react';

import View from '../View';

const getMockUser = numberOfCourses => {
	const Items = Array.from({ length: numberOfCourses }).map((_, index) => ({
		getPresentationProperties: () => {
			return {
				label: 'Course' + (index + 1),
				title: 'course' + (index + 1),
			};
		},
		hasLink: () => true,
	}));

	return {
		hasLink: () => true,
		fetchLink: async () => ({
			Items,
			[Symbol.iterator]: () => Items[Symbol.iterator](),
		}),
	};
};

/* eslint-env jest */
describe('Site admin user course list test (5 courses)', () => {
	test('Basic render test', async () => {
		const user = getMockUser(5);
		const cmp = render(<View user={user} />);

		await waitFor(() => {
			expect(
				cmp.container.querySelectorAll(
					'.nti-course-enrollment-list-item'
				).length
			).toBe(5);
		});

		expect(cmp.asFragment()).toMatchSnapshot();
	});
});

describe('Site admin user course list test (no courses)', () => {
	test('Basic render test', async () => {
		const user = getMockUser(0);

		const cmp = render(<View user={user} />);

		await waitFor(() => {
			expect(
				cmp.container.querySelectorAll('.empty-state-component').length
			).toBe(1);
		});

		expect(cmp.asFragment()).toMatchSnapshot();
	});
});
