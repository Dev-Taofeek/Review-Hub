/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from '@/components/ui/StarRating';

describe('StarRating component', () => {
  describe('display mode (non-interactive)', () => {
    it('renders 5 buttons (one per star)', () => {
      render(<StarRating rating={3} />);
      // Stars are rendered as buttons internally
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });

    it('does not call onChange when clicked in display mode', () => {
      const onChange = jest.fn();
      render(<StarRating rating={3} />);
      fireEvent.click(screen.getAllByRole('button')[0]);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('interactive mode', () => {
    it('calls onChange when a star is clicked', () => {
      const onChange = jest.fn();
      render(<StarRating rating={0} interactive onChange={onChange} />);
      fireEvent.click(screen.getAllByRole('button')[2]); // 3rd star
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('calls onChange with correct value for each star', () => {
      const onChange = jest.fn();
      render(<StarRating rating={0} interactive onChange={onChange} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn, i) => {
        fireEvent.click(btn);
        expect(onChange).toHaveBeenCalledWith(i + 1);
      });
    });
  });

  describe('showValue prop', () => {
    it('shows rating value when showValue is true', () => {
      render(<StarRating rating={4.2} showValue />);
      expect(screen.getByText('4.2')).toBeInTheDocument();
    });

    it('does not show value by default', () => {
      render(<StarRating rating={4.2} />);
      expect(screen.queryByText('4.2')).not.toBeInTheDocument();
    });
  });

  describe('size prop', () => {
    it('renders all valid sizes without error', () => {
      const sizes = ['xs', 'sm', 'md', 'lg'] as const;
      sizes.forEach((size) => {
        const { unmount } = render(<StarRating rating={3} size={size} />);
        expect(screen.getAllByRole('button')).toHaveLength(5);
        unmount();
      });
    });
  });
});
