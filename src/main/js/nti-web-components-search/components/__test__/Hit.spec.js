import React from 'react';
import { shallow } from 'enzyme';

import Hit from '../Hit';
import Fragments from '../Fragments';
import Path from '../Path';

describe('<Hit />', () => {

	function buildProps (props) {
		const newProps = {props};

		spyOn(newProps, 'onChange');

		return newProps;
	}

	it('should render at least one <Fragments /> components', () => {
		const wrapper = shallow(<Hit />);
		expect(wrapper.contains(<Fragments />)).to.equal(true);
	});

	it('should render one <Path /> component', () => {
		const wrapper = shallow(<Hit />);
		expect(wrapper.find(Path)).to.have.length(1);
	});

	it('should render a `.search-result-react`', () => {
		const wrapper = shallow(<Hit />);
		expect(wrapper.find('.search-result-react')).to.have.length(1);
	});

	it('should render a `.hit-title`', () => {
		const wrapper = shallow(<Hit />);
		expect(wrapper.find('.hit-title')).to.have.length(1);
	});

	it('simulates clicks on title', () => {
		const inputProps = buildProps({});

		const wrapper = shallow(<Hit />);
		wrapper.find('.hit-title').simulate('click');
		expect(inputProps.navigateToSearchHit).toHaveBeenCalled();
	});
});
