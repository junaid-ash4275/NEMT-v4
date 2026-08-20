import { render, screen } from '@testing-library/react';
import App from './App';

test('renders galaxy collision studio component', () => {
  render(<App />);
  const headingElement = screen.getByText(/Galaxy Collision Studio/i);
  expect(headingElement).toBeInTheDocument();
});

