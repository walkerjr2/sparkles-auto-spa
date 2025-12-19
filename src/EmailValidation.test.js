import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock Firebase and EmailJS to avoid actual API calls during testing
jest.mock('./firebase', () => ({
  auth: {},
  db: {},
}));

jest.mock('@emailjs/browser', () => ({
  send: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  onSnapshot: jest.fn((q, callback) => {
    callback({ docs: [] });
    return jest.fn();
  }),
  doc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('@react-google-maps/api', () => ({
  useJsApiLoader: () => ({ isLoaded: true }),
  GoogleMap: () => <div>Mock Google Map</div>,
  Marker: () => <div>Mock Marker</div>,
}));

jest.mock('react-google-autocomplete', () => ({
  __esModule: true,
  default: ({ onPlaceSelected, ...props }) => (
    <input
      {...props}
      data-testid="autocomplete"
      onChange={(e) => {
        if (e.target.value === 'test location') {
          onPlaceSelected({
            formatted_address: 'Test Location',
            geometry: { location: { lat: () => 18.5, lng: () => -77.9 } },
          });
        }
      }}
    />
  ),
}));

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('Email Validation Feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Email Input Validation', () => {
    test('should show green checkmark for valid email', async () => {
      renderApp();
      
      // Navigate to booking page
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      // Navigate through steps to reach email input (Step 5)
      // Step 1: Select service
      await waitFor(() => {
        const serviceButton = screen.getByText(/exterior wash/i);
        fireEvent.click(serviceButton);
      });
      
      // Continue through steps...
      // Note: This is a simplified version. Full implementation would navigate all steps.
      
      // Find email input
      const emailInput = screen.getByPlaceholderText(/email address/i);
      
      // Type valid email
      await userEvent.type(emailInput, 'test@gmail.com');
      
      // Trigger blur event
      fireEvent.blur(emailInput);
      
      // Wait for validation
      await waitFor(() => {
        // Check for green border (valid state)
        expect(emailInput).toHaveClass('border-green-500');
      });
    });

    test('should show error for invalid email format', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      // Navigate to Step 5 (simplified)
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      // Type invalid email
      await userEvent.type(emailInput, 'notanemail');
      fireEvent.blur(emailInput);
      
      // Check for error message
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
      
      // Check for red border
      expect(emailInput).toHaveClass('border-red-500');
    });

    test('should detect Gmail typo and suggest correction', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      // Type email with typo
      await userEvent.type(emailInput, 'test@gmial.com');
      fireEvent.blur(emailInput);
      
      // Check for suggestion
      await waitFor(() => {
        expect(screen.getByText(/did you mean:/i)).toBeInTheDocument();
        expect(screen.getByText(/test@gmail.com/i)).toBeInTheDocument();
      });
    });

    test('should detect Hotmail typo and suggest correction', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      await userEvent.type(emailInput, 'john@hotmial.com');
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.getByText(/john@hotmail.com/i)).toBeInTheDocument();
      });
    });

    test('should detect Yahoo typo and suggest correction', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      await userEvent.type(emailInput, 'jane@yahooo.com');
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.getByText(/jane@yahoo.com/i)).toBeInTheDocument();
      });
    });

    test('should accept email suggestion when clicked', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      // Type typo
      await userEvent.type(emailInput, 'test@gmial.com');
      fireEvent.blur(emailInput);
      
      // Wait for suggestion
      await waitFor(() => {
        expect(screen.getByText(/test@gmail.com/i)).toBeInTheDocument();
      });
      
      // Click suggestion button
      const suggestionButton = screen.getByText(/test@gmail.com/i).closest('button');
      fireEvent.click(suggestionButton);
      
      // Email should be corrected
      await waitFor(() => {
        expect(emailInput.value).toBe('test@gmail.com');
      });
      
      // Error should be cleared
      expect(screen.queryByText(/did you mean:/i)).not.toBeInTheDocument();
    });

    test('should reset validation state when user starts typing again', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      // Type invalid email
      await userEvent.type(emailInput, 'invalid');
      fireEvent.blur(emailInput);
      
      // Error appears
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
      
      // Start typing again
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 't');
      
      // Error should be cleared
      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
    });

    test('should validate email on form submission', async () => {
      // Mock window.alert
      global.alert = jest.fn();
      
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      // Fill in all fields except email (or with invalid email)
      // ... navigate through booking steps ...
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      await userEvent.type(emailInput, 'invalid');
      
      // Try to submit form
      const submitButton = screen.getByText(/complete booking/i);
      fireEvent.click(submitButton);
      
      // Should show alert
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('valid email')
        );
      });
    });

    test('should handle multiple email providers', async () => {
      const testCases = [
        { input: 'test@outlok.com', expected: 'test@outlook.com' },
        { input: 'test@icoud.com', expected: 'test@icloud.com' },
        { input: 'test@aol.con', expected: 'test@aol.com' },
      ];

      for (const testCase of testCases) {
        const { rerender } = renderApp();
        
        const bookNowButton = screen.getByText(/book now/i);
        fireEvent.click(bookNowButton);
        
        const emailInput = await screen.findByPlaceholderText(/email address/i);
        
        await userEvent.type(emailInput, testCase.input);
        fireEvent.blur(emailInput);
        
        await waitFor(() => {
          expect(screen.getByText(new RegExp(testCase.expected, 'i'))).toBeInTheDocument();
        });
        
        // Clean up for next iteration
        rerender(<></>);
      }
    });

    test('should handle empty email gracefully', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      // Focus and blur without typing
      fireEvent.focus(emailInput);
      fireEvent.blur(emailInput);
      
      // Should not show error for empty field
      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
    });

    test('should show visual feedback icons correctly', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      // Initially no icon
      expect(emailInput.parentElement.querySelector('svg')).not.toBeInTheDocument();
      
      // Type valid email
      await userEvent.type(emailInput, 'test@gmail.com');
      fireEvent.blur(emailInput);
      
      // Green checkmark should appear
      await waitFor(() => {
        const icon = emailInput.parentElement.querySelector('svg.text-green-500');
        expect(icon).toBeInTheDocument();
      });
      
      // Clear and type invalid
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'invalid');
      fireEvent.blur(emailInput);
      
      // Red X should appear
      await waitFor(() => {
        const icon = emailInput.parentElement.querySelector('svg.text-red-500');
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('Mobile-Specific Features', () => {
    test('should have proper input attributes for mobile', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      // Check mobile-friendly attributes
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoCapitalize', 'none');
      expect(emailInput).toHaveAttribute('autoCorrect', 'off');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('inputMode', 'email');
    });

    test('should have touch-friendly button sizes', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      await userEvent.type(emailInput, 'test@gmial.com');
      fireEvent.blur(emailInput);
      
      // Wait for suggestion button
      await waitFor(() => {
        const suggestionButton = screen.getByText(/test@gmail.com/i).closest('button');
        expect(suggestionButton).toBeInTheDocument();
        
        // Button should have adequate padding for touch
        const styles = window.getComputedStyle(suggestionButton);
        expect(styles.padding).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long email addresses', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      const longEmail = 'verylongemailaddressfortesting123456789@gmail.com';
      await userEvent.type(emailInput, longEmail);
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(emailInput).toHaveClass('border-green-500');
      });
    });

    test('should handle special characters in email', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      const specialEmail = 'test.name+tag@example.com';
      await userEvent.type(emailInput, specialEmail);
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(emailInput).toHaveClass('border-green-500');
      });
    });

    test('should handle email with numbers', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      await userEvent.type(emailInput, 'user123@test456.com');
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(emailInput).toHaveClass('border-green-500');
      });
    });

    test('should reject email with spaces', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      await userEvent.type(emailInput, 'test @gmail.com');
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(emailInput).toHaveClass('border-red-500');
      });
    });

    test('should reject email without @ symbol', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      await userEvent.type(emailInput, 'testgmail.com');
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(emailInput).toHaveClass('border-red-500');
      });
    });

    test('should reject email without domain', async () => {
      renderApp();
      
      const bookNowButton = screen.getByText(/book now/i);
      fireEvent.click(bookNowButton);
      
      const emailInput = await screen.findByPlaceholderText(/email address/i);
      
      await userEvent.type(emailInput, 'test@');
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(emailInput).toHaveClass('border-red-500');
      });
    });
  });
});
