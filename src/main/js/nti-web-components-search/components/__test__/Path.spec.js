/* eslint-env jest */
import React from 'react';
import { render } from '@testing-library/react';

import Path from '../Path';

const fakePathObject = [
	{
		label: 'Human Physiology',
		ntiid: 'tag:nextthought.com,2011-10:system-OID-0x4a73:5573657273:kj79vfPDVYE',
	},
	{
		label: '1.1 How to Study for This Course',
		ntiid: 'tag:nextthought.com,2011-10:NTI-NTICourseOutlineNode-Fall2016_BIOL_2124.1.0',
	},
	{
		label: 'Concept Mapping Software',
		ntiid: 'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software',
	},
];

describe('<Path />', () => {
	test('should render a `.hit-path`', () => {
		const { container } = render(<Path pathObject={fakePathObject} />);
		expect(container.querySelectorAll('.hit-path').length).toBe(1);
	});

	test('should render at least one span tag', async () => {
		const { findAllByText } = render(<Path pathObject={fakePathObject} />);
		expect(await findAllByText('Human Physiology')).toMatchInlineSnapshot(`
		Array [
		  <span>
		    Human Physiology
		  </span>,
		]
		`);
	});
});
