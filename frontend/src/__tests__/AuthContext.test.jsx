import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';

// A test component that uses the auth context
const TestComponent = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
    </div>
  );
};

describe('AuthContext', () => {
  it('should provide initial auth context', () => {
    render(
      <Router>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </Router>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });
});
