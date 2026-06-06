import { test, expect } from '@playwright/test';

/**
 * Users CRUD API E2E Tests
 * Tests the complete CRUD API endpoints with Playwright
 *
 * These tests verify API contract and real HTTP responses
 */

const API_BASE = 'http://localhost:3000/api/users';

test.describe('Users CRUD API Endpoints', () => {
  let createdUserId: number;

  test.describe('CREATE - POST /api/users', () => {
    test('should create a new user with valid data', async ({ request }) => {
      const payload = {
        name: 'John Doe',
        email: `john.doe.${Date.now()}@example.com`,
        password: 'password123',
      };

      const response = await request.post(API_BASE, {
        data: payload,
      });

      if (response.status() !== 200) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('POST /api/users error:', {
          status: response.status(),
          error: errorData,
        });
      }

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name', payload.name);
      expect(data).toHaveProperty('email', payload.email);
      expect(data).toHaveProperty('roles');
      expect(data).toHaveProperty('permissions');
      createdUserId = data.id;
    });

    test('should return error for invalid email', async ({ request }) => {
      const payload = {
        name: 'Invalid User',
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request.post(API_BASE, {
        data: payload,
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('should return error for short password', async ({ request }) => {
      const payload = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      };

      const response = await request.post(API_BASE, {
        data: payload,
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('should return error for missing required fields', async ({ request }) => {
      const payload = {
        name: 'Test User',
        // missing email
        password: 'password123',
      };

      const response = await request.post(API_BASE, {
        data: payload,
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('READ - GET /api/users', () => {
    test('should list all users with pagination', async ({ request }) => {
      const response = await request.get(API_BASE);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('meta');
      expect(Array.isArray(data.items)).toBeTruthy();
      expect(data.meta).toHaveProperty('page');
      expect(data.meta).toHaveProperty('itemsPerPage');
    });

    test('should support pagination parameters', async ({ request }) => {
      const response = await request.get(`${API_BASE}?page=1&limit=5`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.meta.page).toBe(1);
      expect(data.meta.itemsPerPage).toBe(5);
    });

    test('should support search parameter', async ({ request }) => {
      const response = await request.get(`${API_BASE}?search=john`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.items)).toBeTruthy();
    });

    test('should support sorting', async ({ request }) => {
      const response = await request.get(`${API_BASE}?sort_by=name&sort_order=asc`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.items)).toBeTruthy();
    });
  });

  test.describe('READ - GET /api/users/:id', () => {
    test('should fetch a user by ID', async ({ request }) => {
      if (!createdUserId) {
        test.skip();
      }

      const response = await request.get(`${API_BASE}/${createdUserId}`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('id', createdUserId);
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('roles');
      expect(data).toHaveProperty('permissions');
    });

    test('should return 404 for non-existent user', async ({ request }) => {
      const response = await request.get(`${API_BASE}/99999`);

      expect(response.status()).toBe(404);
    });

    test('should not include password in response', async ({ request }) => {
      if (!createdUserId) {
        test.skip();
      }

      const response = await request.get(`${API_BASE}/${createdUserId}`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.password).toBeUndefined();
    });
  });

  test.describe('UPDATE - PUT /api/users/:id', () => {
    test('should update user name', async ({ request }) => {
      if (!createdUserId) {
        test.skip();
      }

      const updatePayload = { name: 'Jane Doe' };

      const response = await request.put(`${API_BASE}/${createdUserId}`, {
        data: updatePayload,
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.name).toBe('Jane Doe');
    });

    test('should support partial updates', async ({ request }) => {
      if (!createdUserId) {
        test.skip();
      }

      const updatePayload = { name: 'Updated Name Only' };

      const response = await request.put(`${API_BASE}/${createdUserId}`, {
        data: updatePayload,
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.name).toBe('Updated Name Only');
    });

    test('should validate email format on update', async ({ request }) => {
      if (!createdUserId) {
        test.skip();
      }

      const updatePayload = { email: 'invalid-email' };

      const response = await request.put(`${API_BASE}/${createdUserId}`, {
        data: updatePayload,
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('should return 404 for non-existent user', async ({ request }) => {
      const updatePayload = { name: 'Test' };

      const response = await request.put(`${API_BASE}/99999`, {
        data: updatePayload,
      });

      expect(response.status()).toBe(404);
    });
  });

  test.describe('DELETE - DELETE /api/users/:id', () => {
    test('should delete a user', async ({ request }) => {
      if (!createdUserId) {
        test.skip();
      }

      const response = await request.delete(`${API_BASE}/${createdUserId}`);

      expect(response.status()).toBe(204);
      // Wait a moment for cache to clear
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    test('should return 404 when deleting non-existent user', async ({ request }) => {
      const response = await request.delete(`${API_BASE}/99999`);

      expect(response.status()).toBe(404);
    });

    test('should prevent accessing deleted user', async ({ request }) => {
      if (!createdUserId) {
        test.skip();
      }

      // Wait to ensure delete is fully processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Try to get the deleted user
      const response = await request.get(`${API_BASE}/${createdUserId}`);

      expect(response.status()).toBe(404);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle missing required fields', async ({ request }) => {
      const payload = {
        // missing all required fields
      };

      const response = await request.post(API_BASE, {
        data: payload,
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('should handle invalid request type', async ({ request }) => {
      const response = await request.post(`${API_BASE}`, {
        data: 'invalid string instead of object',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('should return proper error on validation failure', async ({ request }) => {
      const payload = {
        name: '',
        email: 'test@example.com',
        password: 'pass',
      };

      const response = await request.post(API_BASE, {
        data: payload,
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('Response Structure', () => {
    test('should return correct response headers', async ({ request }) => {
      const response = await request.get(API_BASE);

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
    });

    test('list response should have meta information', async ({ request }) => {
      const response = await request.get(API_BASE);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.meta).toHaveProperty('page');
      expect(data.meta).toHaveProperty('itemsPerPage');
      expect(typeof data.meta.page).toBe('number');
      expect(typeof data.meta.itemsPerPage).toBe('number');
    });

    test('single user response should include roles and permissions', async ({ request }) => {
      // Create a test user
      const createPayload = {
        name: 'Role Test User',
        email: `roletest-${Date.now()}@example.com`,
        password: 'password123',
      };

      const createResponse = await request.post(API_BASE, {
        data: createPayload,
      });

      if (createResponse.status() === 200) {
        const createdData = await createResponse.json();
        const userId = createdData.id;

        // Fetch the user
        const getResponse = await request.get(`${API_BASE}/${userId}`);

        expect(getResponse.status()).toBe(200);
        const data = await getResponse.json();
        expect(data).toHaveProperty('roles');
        expect(data).toHaveProperty('permissions');
        expect(Array.isArray(data.roles)).toBeTruthy();
        expect(Array.isArray(data.permissions)).toBeTruthy();
      }
    });
  });

  test.describe('Data Validation', () => {
    test('should validate name length', async ({ request }) => {
      const validPayload = {
        name: 'A'.repeat(150),
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      };

      const response = await request.post(API_BASE, {
        data: validPayload,
      });

      expect(response.status()).toBe(200);
    });

    test('should reject name exceeding max length', async ({ request }) => {
      const invalidPayload = {
        name: 'A'.repeat(151),
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      };

      const response = await request.post(API_BASE, {
        data: invalidPayload,
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('should validate email uniqueness', async ({ request }) => {
      const email = `unique-test-${Date.now()}@example.com`;

      // Create first user
      const payload1 = {
        name: 'User 1',
        email: email,
        password: 'password123',
      };

      const response1 = await request.post(API_BASE, {
        data: payload1,
      });

      expect(response1.status()).toBe(200);

      // Try to create second user with same email
      const payload2 = {
        name: 'User 2',
        email: email,
        password: 'password123',
      };

      const response2 = await request.post(API_BASE, {
        data: payload2,
      });

      expect(response2.status()).toBeGreaterThanOrEqual(400);
    });
  });
});
