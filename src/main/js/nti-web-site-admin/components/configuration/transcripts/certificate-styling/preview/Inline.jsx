import React from 'react';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';

import Styles from './Styles.css';
import Sidebar from './Sidebar';
import Content from './Content';

const cx = classnames.bind(Styles);

export default function InlineCertificatePreview () {
	return (
		<Theme.Scope scope="certificates">
			<div className={cx('inline-certificate-preview')}>
				<Sidebar />
				<Content />
			</div>
		</Theme.Scope>
	);
}