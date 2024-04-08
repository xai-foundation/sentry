import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { XaiButton } from './XaiButton';
import '@testing-library/jest-dom';

describe('XaiButton', () => {
	it('renders correctly', () => {
		const { getByText } = render(
			<XaiButton onClick={() => { }}>Click Me</XaiButton>
		);
		expect(getByText('Click Me')).toBeInTheDocument();
	});

	it('handles click events', () => {
		const handleClick = vi.fn();
		const { getByText } = render(
			<XaiButton onClick={handleClick}>Click Me</XaiButton>
		);

		fireEvent.click(getByText('Click Me'));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('is disabled when disabled prop is true', () => {
		const { getByText } = render(
			<XaiButton onClick={() => { }} disabled={true}>
				Disabled Button
			</XaiButton>
		);
		expect(getByText('Disabled Button')).toBeDisabled();
	});
});
