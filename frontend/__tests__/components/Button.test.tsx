/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button component', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when the disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled and shows spinner when loading', () => {
    render(<Button loading>Submit</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    // Spinner span is present
    expect(btn.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('does not call onClick when disabled', () => {
    const onClick = jest.fn();
    render(<Button disabled onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders an icon slot on the left', () => {
    render(<Button icon={<span data-testid="icon">★</span>}>Rate</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders an icon on the right', () => {
    render(<Button iconRight={<span data-testid="right-icon">→</span>}>Next</Button>);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('does not render right icon when loading', () => {
    render(<Button loading iconRight={<span data-testid="right-icon">→</span>}>Next</Button>);
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="my-custom-class">Styled</Button>);
    expect(screen.getByRole('button')).toHaveClass('my-custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it.each([
    ['primary', 'bg-brand-600'],
    ['outline', 'border'],
    ['ghost',   'text-slate-600'],
    ['danger',  'bg-red-600'],
  ])('applies %s variant classes', (variant, expectedClass) => {
    render(<Button variant={variant as any}>{variant}</Button>);
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });
});
