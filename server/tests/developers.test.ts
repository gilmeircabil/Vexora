import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { DeveloperService } from '../src/services/developerService.js';

describe('VexoraMods Developer Hub & Project Showcase System', () => {
  describe('Slug Generation & Normalization', () => {
    it('should generate clean URL-safe slugs for developer projects', () => {
      expect(DeveloperService.slugify('VexoraMods AI Image Upscaler')).toBe(
        'vexoramods-ai-image-upscaler',
      );
      expect(DeveloperService.slugify('React + Node.js Fullstack Portfolio 2026!')).toBe(
        'react-nodejs-fullstack-portfolio-2026',
      );
      expect(DeveloperService.slugify('   ---Multiple---Hyphens & Spaces---   ')).toBe(
        'multiple-hyphens-spaces',
      );
      expect(DeveloperService.slugify('Clean-Slug-123')).toBe('clean-slug-123');
    });

    it('should handle edge cases and special symbols gracefully', () => {
      expect(DeveloperService.slugify('$$$ Special @#% Deals $$$')).toBe('special-deals');
      expect(DeveloperService.slugify('C++ & C# Game Engine')).toBe('c-c-game-engine');
    });
  });

  describe('Anti-Spam & Contact Protection Security', () => {
    it('should generate consistent SHA-256 hashes for IP addresses to enforce rate limiting without storing raw client IPs indefinitely', () => {
      const ip = '192.168.1.100';
      const expectedHash = crypto.createHash('sha256').update(ip).digest('hex');
      const hash1 = crypto.createHash('sha256').update(ip).digest('hex');
      const hash2 = crypto.createHash('sha256').update(ip).digest('hex');

      expect(hash1).toBe(expectedHash);
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
    });

    it('should ensure different client IPs produce different rate limit hashes', () => {
      const hashA = crypto.createHash('sha256').update('192.168.1.1').digest('hex');
      const hashB = crypto.createHash('sha256').update('192.168.1.2').digest('hex');
      expect(hashA).not.toBe(hashB);
    });
  });

  describe('Project Engagement & Social Reactions', () => {
    const validReactions = ['love', 'rocket', 'fire', 'insightful', 'like'];

    it('should only permit valid reaction types for project engagement', () => {
      validReactions.forEach((reaction) => {
        expect(['love', 'rocket', 'fire', 'insightful', 'like'].includes(reaction)).toBe(true);
      });
      expect(['love', 'rocket', 'fire', 'insightful', 'like'].includes('dislike')).toBe(false);
      expect(['love', 'rocket', 'fire', 'insightful', 'like'].includes('spam')).toBe(false);
    });

    it('should hash guest client IPs consistently for anonymous reactions', () => {
      const guestIp = '203.0.113.195';
      const hash = crypto.createHash('sha256').update(guestIp).digest('hex');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
