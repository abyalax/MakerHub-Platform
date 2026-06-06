import { describe, it, expect } from 'vitest';
import { idParamSchema, createUserSchema, updateUserSchema, userQuerySchema } from '~/layers/users/server/validators/users.schema';

/**
 * Users Validation Schema Tests (Nuxt Environment)
 * Tests the Zod schemas used for input validation
 */

describe('Users Schema Validation Tests', () => {
  describe('idParamSchema', () => {
    it('should validate positive integer ID', () => {
      const result = idParamSchema.safeParse({ id: 1 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(1);
      }
    });

    it('should coerce string ID to number', () => {
      const result = idParamSchema.safeParse({ id: '123' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.id).toBe('number');
        expect(result.data.id).toBe(123);
      }
    });

    it('should reject zero or negative ID', () => {
      const zeroResult = idParamSchema.safeParse({ id: 0 });
      const negativeResult = idParamSchema.safeParse({ id: -1 });

      expect(zeroResult.success).toBe(false);
      expect(negativeResult.success).toBe(false);
    });

    it('should reject non-integer ID', () => {
      const result = idParamSchema.safeParse({ id: 'abc' });

      expect(result.success).toBe(false);
    });

    it('should reject float ID', () => {
      const result = idParamSchema.safeParse({ id: 1.5 });

      expect(result.success).toBe(false);
    });
  });

  describe('createUserSchema', () => {
    const validPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should validate complete valid user data', () => {
      const result = createUserSchema.safeParse(validPayload);

      expect(result.success).toBe(true);
    });

    it('should validate with optional roles', () => {
      const result = createUserSchema.safeParse({
        ...validPayload,
        roles: [1, 2],
      });

      expect(result.success).toBe(true);
    });

    it('should validate with optional permissions', () => {
      const result = createUserSchema.safeParse({
        ...validPayload,
        permissions: [1, 2, 3],
      });

      expect(result.success).toBe(true);
    });

    describe('name field', () => {
      it('should accept valid name', () => {
        const result = createUserSchema.safeParse({
          ...validPayload,
          name: 'John Doe',
        });

        expect(result.success).toBe(true);
      });

      it('should reject empty name', () => {
        const result = createUserSchema.safeParse({
          ...validPayload,
          name: '',
        });

        expect(result.success).toBe(false);
      });

      it('should reject name exceeding max length', () => {
        const result = createUserSchema.safeParse({
          ...validPayload,
          name: 'a'.repeat(151),
        });

        expect(result.success).toBe(false);
      });

      it('should accept name at max length boundary', () => {
        const result = createUserSchema.safeParse({
          ...validPayload,
          name: 'a'.repeat(150),
        });

        expect(result.success).toBe(true);
      });

      it('should reject missing name', () => {
        const { name, ...payload } = validPayload;
        const result = createUserSchema.safeParse(payload);

        expect(result.success).toBe(false);
      });
    });

    describe('email field', () => {
      it('should accept valid email', () => {
        const result = createUserSchema.safeParse({
          ...validPayload,
          email: 'john.doe@example.com',
        });

        expect(result.success).toBe(true);
      });

      it('should accept email with plus addressing', () => {
        const result = createUserSchema.safeParse({
          ...validPayload,
          email: 'john+test@example.com',
        });

        expect(result.success).toBe(true);
      });

      it('should reject invalid email without @', () => {
        const result = createUserSchema.safeParse({
          ...validPayload,
          email: 'invalid-email',
        });

        expect(result.success).toBe(false);
      });

      it('should reject missing email', () => {
        const { email, ...payload } = validPayload;
        const result = createUserSchema.safeParse(payload);

        expect(result.success).toBe(false);
      });
    });

    describe('password field', () => {
      it('should accept valid password', () => {
        const result = createUserSchema.safeParse({
          ...validPayload,
          password: 'securePassword123',
        });

        expect(result.success).toBe(true);
      });

      it('should accept password at minimum length', () => {
        const result = createUserSchema.safeParse({
          ...validPayload,
          password: '123456',
        });

        expect(result.success).toBe(true);
      });

      it('should reject password below minimum length', () => {
        const result = createUserSchema.safeParse({
          ...validPayload,
          password: '12345',
        });

        expect(result.success).toBe(false);
      });

      it('should reject missing password', () => {
        const { password, ...payload } = validPayload;
        const result = createUserSchema.safeParse(payload);

        expect(result.success).toBe(false);
      });
    });
  });

  describe('updateUserSchema', () => {
    it('should allow partial updates with only name', () => {
      const result = updateUserSchema.safeParse({
        name: 'Jane Doe',
      });

      expect(result.success).toBe(true);
    });

    it('should allow partial updates with only email', () => {
      const result = updateUserSchema.safeParse({
        email: 'jane@example.com',
      });

      expect(result.success).toBe(true);
    });

    it('should allow empty update payload', () => {
      const result = updateUserSchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it('should reject invalid email on update', () => {
      const result = updateUserSchema.safeParse({
        email: 'invalid-email',
      });

      expect(result.success).toBe(false);
    });

    it('should reject short password on update', () => {
      const result = updateUserSchema.safeParse({
        password: '123',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('userQuerySchema', () => {
    it('should accept valid query parameters', () => {
      const result = userQuerySchema.safeParse({
        page: 1,
        limit: 20,
        search: 'john',
        sort_by: 'name',
        sort_order: 'asc',
      });

      expect(result.success).toBe(true);
    });

    it('should use default values for missing params', () => {
      const result = userQuerySchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it('should coerce page string to number', () => {
      const result = userQuerySchema.safeParse({
        page: '2',
        limit: '20',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.page).toBe('number');
        expect(result.data.page).toBe(2);
      }
    });

    it('should reject zero page', () => {
      const result = userQuerySchema.safeParse({ page: 0 });

      expect(result.success).toBe(false);
    });

    it('should reject negative limit', () => {
      const result = userQuerySchema.safeParse({ limit: -10 });

      expect(result.success).toBe(false);
    });

    it('should accept optional search parameter', () => {
      const result = userQuerySchema.safeParse({
        search: 'test search term',
      });

      expect(result.success).toBe(true);
    });

    it('should accept sort_order asc and desc', () => {
      const ascResult = userQuerySchema.safeParse({ sort_order: 'asc' });
      const descResult = userQuerySchema.safeParse({ sort_order: 'desc' });

      expect(ascResult.success).toBe(true);
      expect(descResult.success).toBe(true);
    });

    it('should reject invalid sort_order', () => {
      const result = userQuerySchema.safeParse({
        sort_order: 'invalid',
      });

      expect(result.success).toBe(false);
    });
  });
});
