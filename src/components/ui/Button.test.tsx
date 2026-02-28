import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import '@testing-library/jest-dom';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>اضغط هنا</Button>);
    expect(screen.getByText('اضغط هنا')).toBeInTheDocument();
  });

  it('shows loader when loading prop is true', () => {
    const { container } = render(<Button loading>اضغط هنا</Button>);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>معطل</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
