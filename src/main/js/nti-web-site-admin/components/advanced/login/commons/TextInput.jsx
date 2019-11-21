import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Input} from '@nti/web-commons';

import Store from '../Store';

import Styles from './TextInput.css';

const cx = classnames.bind(Styles);

TextInput.propTypes = {
	value: PropTypes.string,
	name: PropTypes.string,
	type: PropTypes.string,
	setBrandProp: PropTypes.func
};
function TextInput ({value, name, type, setBrandProp}) {
	const onChange = (change) => {
		setBrandProp(name, change);
	};

	return (
		<div className={cx('text-input', type)}>
			<Input.TextArea
				value={value}
				onChange={onChange}
				autoGrow
			/>
		</div>
	);
}

export default Store
	.monitor({
		[Store.SetBrandProp]: 'setBrandProp'
	})(TextInput);