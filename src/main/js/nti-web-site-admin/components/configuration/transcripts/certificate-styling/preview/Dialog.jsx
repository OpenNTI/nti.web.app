import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Prompt, Button, Hooks/*, Loading*/} from '@nti/web-commons';

import Store from '../Store';

import Styles from './Styles.css';
import Iframe from './Iframe';


const {useResolver} = Hooks;
const {/*isPending, isErrored, */isResolved} = useResolver;

const cx = classnames.bind(Styles);
const t = scoped('web-site-admin.components.advanced.transcripts.certificate-styling.preview.Dialog', {
	save: 'Apply Change'
});

CertificatePreviewModal.propTypes = {
	onSave: PropTypes.func,
	onCancel: PropTypes.func
};
export default function CertificatePreviewModal ({onSave, onCancel}) {
	const {getPreviewBlob} = Store.useMonitor(['getPreviewBlob']);

	const resolver = useResolver(() => getPreviewBlob(), [getPreviewBlob]);

	// const loading = isPending(resolver);
	// const error = isErrored(resolver) ? resolver : null;
	const blob = isResolved(resolver) ? resolver : null;

	const [/*objectURL*/, setObjectURL] = React.useState(null);

	React.useEffect(() => {
		if (!blob) { return; }

		const url = URL.createObjectURL(blob);

		setObjectURL(url);

		return () => URL.revokeObjectURL(url);
	}, [blob]);

	return (
		<Prompt.Dialog>
			<div className={cx('certificate-preview-modal')}>
				<div className={cx('header')}>
					<i className={cx('close', 'icon-light-x')} onClick={onCancel} />
				</div>
				<Iframe />
				{onSave && (
					<div className={cx('controls')}>
						<Button onClick={onSave}>{t('save')}</Button>
					</div>
				)}
			</div>
		</Prompt.Dialog>
	);
}
