import React from 'react';
import classnames from 'classnames/bind';

import { Hooks, Loading, Errors } from '@nti/web-commons';

import Store from '../Store';

import Styles from './Styles.css';

const { useResolver } = Hooks;
const { isPending, isErrored, isResolved } = useResolver;

const cx = classnames.bind(Styles);

export default function CertificatePreviewIframe() {
	const { getPreviewBlob } = Store.useValue();

	const resolver = useResolver(() => getPreviewBlob(), [getPreviewBlob]);

	const loading = isPending(resolver);
	const error = isErrored(resolver) ? resolver : null;
	const blob = isResolved(resolver) ? resolver : null;

	const [objectURL, setObjectURL] = React.useState(null);

	React.useEffect(() => {
		if (!blob) {
			return;
		}

		const url = URL.createObjectURL(blob);

		setObjectURL(url);

		return () => URL.revokeObjectURL(url);
	}, [blob]);

	return (
		<div className={cx('certificate-preview-iframe')}>
			<Loading.Placeholder
				loading={loading}
				fallback={<Loading.Spinner.Large />}
			>
				{error && (
					<div className={cx('preview-iframe-error')}>
						<Errors.Message error={error} />
					</div>
				)}
				{objectURL && <iframe src={objectURL} />}
			</Loading.Placeholder>
		</div>
	);
}
