import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('./services/api', () => ({ default: api }));

const getRoutes = [
  ['/crop-detection', 'Crop Disease Detection'],
  ['/flower-detection', 'Flower Disease Detection'],
  ['/camera', 'Real-time Camera'],
  ['/nutrient-deficiency', 'Nutrient Deficiency Detection'],
  ['/chatbot', 'Plant Care Chatbot'],
  ['/recovery', 'Plant Recovery Tracking'],
  ['/plant-care', 'Personalized Plant Care Plans'],
  ['/disease-library', 'Plant Disease Library'],
  ['/history', 'Detection History'],
  ['/analytics', 'Pathology Analytics'],
  ['/forum', 'Farmer Forum'],
  ['/consultations', 'Expert Consultation'],
  ['/settings', 'Settings'],
];
const testUser = {
  id: 'test-user',
  name: 'Test Farmer',
  email: 'farmer@example.com',
  role: 'farmer',
};

describe('AgroBloom application navigation and preferences', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('agrobloom_theme', 'light');
    window.history.replaceState({}, '', '/');
    document.documentElement.classList.remove('dark');
    api.get.mockImplementation(async (endpoint) => {
      if (endpoint === '/auth/me') {
        return { data: { success: true, user: testUser } };
      }
      if (endpoint === '/ai/status') {
        return { data: { success: true, aiService: { status: 'MODEL_READY', ready: true } } };
      }
      if (endpoint === '/notifications/unread-count') {
        return { data: { success: true, unreadCount: 1 } };
      }
      if (typeof endpoint === 'string' && endpoint.startsWith('/notifications')) {
        return { data: { success: true, notifications: [], unreadCount: 1, total: 0 } };
      }
      if (typeof endpoint === 'string' && endpoint.startsWith('/diseases/search')) {
        return { data: { success: true, results: [], total: 0, totalPages: 1 } };
      }
      if (endpoint === '/models/comparison') {
        return {
          data: {
            success: true,
            crops: {
              dataset: 'PlantVillage Real Dataset',
              test_samples: 324,
              classes: 11,
              models: {
                mobilenetv2: {
                  architecture: 'MobileNetV2',
                  role: 'Edge & Offline PWA Champion',
                  accuracy: 90.12,
                  macro_f1: 90.07,
                  macro_specificity: 99.01,
                  latency_ms: 79.34,
                  total_parameters: 2427851,
                  model_size_mb: 20.25,
                  confusion_matrix: [[10, 0], [0, 10]],
                  class_names: ['Tomato Healthy', 'Tomato Early Blight'],
                },
                efficientnetb0: {
                  architecture: 'EfficientNetB0',
                  role: 'Cloud Production Baseline',
                  accuracy: 93.83,
                  macro_f1: 93.76,
                  macro_specificity: 99.38,
                  latency_ms: 87.99,
                  total_parameters: 4216839,
                  model_size_mb: 28.46,
                },
                resnet50: {
                  architecture: 'ResNet50',
                  role: 'Deep Residual Research Baseline',
                  accuracy: 93.83,
                  macro_f1: 93.81,
                  macro_specificity: 99.38,
                  latency_ms: 120.95,
                  total_parameters: 23861259,
                  model_size_mb: 161.77,
                },
              },
            },
            flowers: {
              dataset: 'Rose Leaf Disease Detection Dataset',
              test_samples: 40,
              classes: 4,
              models: {
                mobilenetv2: {
                  architecture: 'MobileNetV2',
                  role: 'Edge & Offline PWA Champion',
                  accuracy: 75.0,
                  macro_f1: 66.67,
                  macro_specificity: 91.67,
                  latency_ms: 88.53,
                  total_parameters: 2427851,
                  model_size_mb: 20.24,
                  confusion_matrix: [[5, 0], [0, 5]],
                  class_names: ['Healthy', 'Black Spot'],
                },
              },
            },
          },
        };
      }
      return {
        data: {
          success: true,
          diseases: [],
          detections: [],
          results: [],
          notifications: [],
          unreadCount: 0,
          posts: [],
          consultations: [],
          reminders: [],
          plans: [],
          records: [],
          conversations: [],
        },
      };
    });
    api.post.mockResolvedValue({ data: { success: true } });
    api.put.mockResolvedValue({ data: { success: true } });
    api.patch.mockResolvedValue({ data: { success: true } });
    api.delete.mockResolvedValue({ data: { success: true } });
  });

  it('renders the home page and links to all primary pages', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: /AgroBloom AI/i })).toBeInTheDocument();
    for (const [href] of getRoutes) {
      expect(document.querySelector(`a[href="${href}"]`)).toBeInTheDocument();
    }
    expect(document.querySelector('a[href="/login"]')).toBeInTheDocument();
    expect(document.querySelector('a[href="/register"]')).toBeInTheDocument();
  });

  it.each(getRoutes)('opens the %s route from navigation', async (href, pageName) => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: /AgroBloom AI/i });
    const link = document.querySelector(`aside a[href="${href}"]`);
    expect(link).toBeInTheDocument();
    await user.click(link);
    await waitFor(() => expect(window.location.pathname).toBe(href));
    expect(await screen.findByRole('heading', { level: 1, name: new RegExp(pageName, 'i') })).toBeInTheDocument();
  });

  it('redirects unauthenticated profile visits to login', async () => {
    render(<App />);
    await act(async () => {
      window.history.pushState({}, '', '/profile');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await waitFor(() => expect(window.location.pathname).toBe('/login'));
    expect(await screen.findByRole('heading', { level: 2, name: /welcome back/i })).toBeInTheDocument();
  });

  it('keeps registration fields natively validated', async () => {
    render(<App />);
    await act(async () => {
      window.history.pushState({}, '', '/register');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await screen.findByRole('heading', { level: 2, name: /create an account/i });
    const name = document.querySelector('input[name="name"]');
    expect(name).toBeRequired();
    expect(document.querySelector('input[name="email"]')).toBeRequired();
    expect(document.querySelector('input[name="password"]')).toHaveAttribute('minLength', '6');
  });

  it('submits the login form and stores the authenticated session', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValueOnce({ data: { success: true, token: 'test-token', user: testUser } });
    render(<App />);
    await user.click(document.querySelector('a[href="/login"]'));
    await user.type(await screen.findByPlaceholderText('farmer@example.com'), testUser.email);
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log In' }));
    await waitFor(() => expect(window.location.pathname).toBe('/'));
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: testUser.email,
      password: 'password123',
    });
    expect(localStorage.getItem('agrobloom_token')).toBe('test-token');
  });

  it('renders authentication errors returned by Express', async () => {
    const user = userEvent.setup();
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid email or password' } },
    });
    render(<App />);
    await user.click(document.querySelector('a[href="/login"]'));
    await user.type(await screen.findByPlaceholderText('farmer@example.com'), testUser.email);
    await user.type(screen.getByPlaceholderText('••••••••'), 'incorrect');
    await user.click(screen.getByRole('button', { name: 'Log In' }));
    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });

  it('submits the registration form and stores the new session', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValueOnce({ data: { success: true, token: 'register-token', user: testUser } });
    render(<App />);
    await user.click(document.querySelector('a[href="/register"]'));
    await user.type(await screen.findByPlaceholderText('e.g. Ramesh Kumar'), 'Test Farmer');
    await user.type(screen.getByPlaceholderText('ramesh@example.com'), testUser.email);
    await user.type(screen.getByPlaceholderText('Minimum 6 characters'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(window.location.pathname).toBe('/'));
    expect(api.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
      name: 'Test Farmer',
      email: testUser.email,
      password: 'password123',
    }));
    expect(localStorage.getItem('agrobloom_token')).toBe('register-token');
  });

  it('toggles dark mode from settings and persists the preference', async () => {
    const user = userEvent.setup();
    render(<App />);
    await act(async () => {
      window.history.pushState({}, '', '/settings');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    const settings = within(document.querySelector('main'));
    await user.click(await settings.findByRole('button', { name: 'Switch to Dark Mode' }));
    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    expect(localStorage.getItem('agrobloom_theme')).toBe('dark');
  });

  it('Phase 5: navigates to /offline and renders the offline AI scanner', async () => {
    render(<App />);
    await act(async () => {
      window.history.pushState({}, '', '/offline');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(await screen.findByRole('heading', { level: 1, name: /offline ai scanner/i })).toBeInTheDocument();
    expect(screen.getByText(/Crop Leaf Model/i)).toBeInTheDocument();
    expect(screen.getByText(/Rose Flower Model/i)).toBeInTheDocument();
  });

  it('Phase 5: navigates to /voice and renders multilingual voice assistant', async () => {
    render(<App />);
    await act(async () => {
      window.history.pushState({}, '', '/voice');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(await screen.findByRole('heading', { level: 1, name: /voice assistant/i })).toBeInTheDocument();
    expect(screen.getByText(/Hands-free plant disease speech assistance/i)).toBeInTheDocument();
  });

  it('Phase 5: switches interface language between English, Kannada, and Hindi', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: /AgroBloom AI/i });
    
    // Open language dropdown
    const langBtn = screen.getByLabelText(/Language:/i);
    await user.click(langBtn);

    // Switch to Kannada
    const knBtn = screen.getByText('ಕನ್ನಡ (Kannada)');
    await user.click(knBtn);
    expect(localStorage.getItem('agrobloom_lang')).toBe('kn');

    // Switch to Hindi
    await user.click(langBtn);
    const hiBtn = screen.getByText('हिन्दी (Hindi)');
    await user.click(hiBtn);
    expect(localStorage.getItem('agrobloom_lang')).toBe('hi');
  });

  it('Phase 5: renders the in-app notification center bell with unread badge', async () => {
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: /AgroBloom AI/i });
    const bellBtn = screen.getByLabelText('Open notifications center');
    expect(bellBtn).toBeInTheDocument();
  });

  it('Phase 5: navigates to /disease-library with smart search and category filters', async () => {
    render(<App />);
    await act(async () => {
      window.history.pushState({}, '', '/disease-library');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(await screen.findByRole('heading', { level: 1, name: /disease library/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by plant name, pathogen, or symptoms/i)).toBeInTheDocument();
    expect(screen.getByText('All Plants')).toBeInTheDocument();
    expect(screen.getByText('Crops')).toBeInTheDocument();
    expect(screen.getByText('Flowers')).toBeInTheDocument();
  });

  it('Phase 5: navigates to /history with search input and date-range filters', async () => {
    render(<App />);
    await act(async () => {
      window.history.pushState({}, '', '/history');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(await screen.findByRole('heading', { level: 1, name: /history/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search plant or disease/i)).toBeInTheDocument();
    expect(screen.getByText(/From Date/i)).toBeInTheDocument();
    expect(screen.getByText(/To Date/i)).toBeInTheDocument();
  });

  it('Phase 6: navigates to /forum and renders farmer community forum with categories and new discussion trigger', async () => {
    render(<App />);
    await act(async () => {
      window.history.pushState({}, '', '/forum');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(await screen.findByRole('heading', { level: 1, name: /farmer forum/i })).toBeInTheDocument();
    expect(screen.getByText(/New Discussion Post/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search discussions by crop, disease, or symptom/i)).toBeInTheDocument();
    expect(screen.getByText(/Grower Peer Network/i)).toBeInTheDocument();
  });

  it('Phase 6: navigates to /consultations and renders expert consultation tabs and verified directory', async () => {
    const user = userEvent.setup();
    render(<App />);
    await act(async () => {
      window.history.pushState({}, '', '/consultations');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(await screen.findByRole('heading', { level: 1, name: /expert consultation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Consultation Tickets/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verified Agronomist Directory/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply for Agronomist Verification/i })).toBeInTheDocument();

    // Click on Directory tab
    await user.click(screen.getByRole('button', { name: /Verified Agronomist Directory/i }));
    expect(screen.getByText(/Certified Plant Pathologists & Agronomists/i)).toBeInTheDocument();

    // Click on Apply tab
    await user.click(screen.getByRole('button', { name: /Apply for Agronomist Verification/i }));
    expect(screen.getByText(/Apply for Certified Expert Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/Field of Specialization/i)).toBeInTheDocument();
  });

  it('Phase 7: navigates to /model-comparison and renders multi-architecture benchmark dashboard', async () => {
    render(<App />);
    await act(async () => {
      window.history.pushState({}, '', '/model-comparison');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(await screen.findByRole('heading', { level: 1, name: /Model Comparison & Evaluation/i })).toBeInTheDocument();
    expect(await screen.findByText(/PlantVillage Crop Models/i)).toBeInTheDocument();
    expect(screen.getByText(/Rose Floriculture Models/i)).toBeInTheDocument();
    expect(screen.getByText(/Empirical Performance Comparison Table/i)).toBeInTheDocument();
    expect(screen.getByText(/Confusion Matrix Heatmap/i)).toBeInTheDocument();
    expect(screen.getByText(/Edge & Offline PWA/i)).toBeInTheDocument();
  });

  it('Phase 7 & 8: navigates to /offline and renders offline PWA diagnosis studio and local sync tab', async () => {
    render(<App />);
    await act(async () => {
      window.history.pushState({}, '', '/offline');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(await screen.findByRole('heading', { level: 1, name: /Offline AI Scanner/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Live Offline Scanner/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Local Offline History/i })).toBeInTheDocument();
  });
});


