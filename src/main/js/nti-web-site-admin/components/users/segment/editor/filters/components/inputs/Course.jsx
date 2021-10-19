import { useCallback, useEffect, useRef, useState } from 'react';

import { scoped } from '@nti/lib-locale';
import { getService } from '@nti/web-client';
import { Input, Button, Placeholder, ErrorMessage } from '@nti/web-core';
import { Prompt, Hooks } from '@nti/web-commons';
import { Selector as SelectCourse } from '@nti/web-course';

import { InputRegistry } from './common';

const { useResolver } = Hooks;
const { isPending, isResolved, isErrored } = useResolver;

const PromptContainer = styled.div`
	max-width: 800px;
	width: 98vw;
`;

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.components.inputs.Course',
	{
		placeholder: 'Select a course...',
		unableToLoadCourse: 'Unable to load course',
		prompt: {
			title: 'Select a Course',
		},
	}
);

function CourseInfo({ value }) {
	const resolver = useResolver(async () => {
		if (typeof value !== 'string') {
			return value;
		}

		const service = await getService();
		const object = await service.getObject(value);

		return object;
	}, [value]);

	const loading = isPending(resolver);
	const error = isErrored(resolver) ? resolver : null;
	const course = isResolved(resolver) ? resolver : null;

	if (loading) {
		return <Placeholder.Text text="Course" />;
	}
	if (error) {
		return <ErrorMessage error={t('unableToLoadCourse')} />;
	}

	const catalog = course.CatalogEntry ?? course;

	return <span>{catalog.title}</span>;
}

export function CourseInput({ value, onChange, autoFocus }) {
	const buttonRef = useRef();
	const [open, setOpen] = useState();

	const doOpen = useCallback(() => setOpen(true), [setOpen]);
	const doClose = useCallback(() => setOpen(false), [setOpen]);
	const selectCourse = useCallback(
		course => {
			doClose();
			onChange(course);
		},
		[onChange, doClose]
	);

	useEffect(() => {
		buttonRef.current?.focus?.();
	}, []);

	return (
		<>
			<Button
				ref={buttonRef}
				variant="plain"
				{...Input.getInputStyleProps()}
				onClick={doOpen}
			>
				{value ? (
					<CourseInfo value={value} />
				) : (
					<Input.Placeholder>{t('placeholder')}</Input.Placeholder>
				)}
			</Button>
			{open && (
				<Prompt.Dialog onBeforeDismiss={doClose}>
					<Prompt.BaseWindow
						title={t('prompt.title')}
						doClose={doClose}
					>
						<PromptContainer>
							<SelectCourse
								collection={'AdministeredCourses'}
								onSelect={selectCourse}
							/>
						</PromptContainer>
					</Prompt.BaseWindow>
				</Prompt.Dialog>
			)}
		</>
	);
}

InputRegistry.register('course', CourseInput);
