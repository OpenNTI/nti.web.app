import React from 'react';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Theme, Text, Loading, Errors} from '@nti/web-commons';

import Card from '../../../common/Card';

import Store from './Store';
import Styles from './Styles.css';
import InlinePreview from './preview/Inline';
import Pill from './sections/Pill';
import Label from './sections/Label';

const cx = classnames.bind(Styles);
const t = scoped('web-site-admin.components.advanced.transcripts.certificate-styling.View', {
	title: 'Certificate Styling',
	description: 'You can customize your certificate to reflect your brand.'
});

const propMap = {
	[Store.Error]: 'error',
	[Store.Loading]: 'loading',
	[Store.Modified]: 'modified',
	[Store.Theme]: 'theme',
	[Store.Save]: 'save',
	[Store.Cancel]: 'cancel',
	[Store.Reset]: 'reset',
	[Store.CanReset]: 'canReset'
};

function CertificateStyling () {
	const {
		error,
		loading,
		modified,
		theme,
		save,
		cancel,
		reset,
		canReset
	} = Store.useMonitor(propMap);

	const [preview, setPreview] = React.useState(false);
	const form = React.createRef();

	const hidePreview = () => setPreview(false);
	const showPreview = (e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		setPreview(true);
	};

	return (
		<Theme.Apply theme={theme}>
			<Card>
				<form className={cx('certificate-styling')} ref={form} onSubmit={showPreview}>
					<div className={cx('header')}>
						<Text.Base as="h2" className={cx('title')}>{t('title')}</Text.Base>
						<Text.Base as="p" className={cx('description')}>{t('description')}</Text.Base>
					</div>
					<InlinePreview loading={loading} />
					<div className={cx('controls')}>
						<Pill />
						<Label />
					</div>
				</form>
			</Card>
		</Theme.Apply>
	);
}

export default Store.WrapCmp(CertificateStyling);