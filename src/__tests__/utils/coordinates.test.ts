import { describe, it, expect } from 'vitest';
import { GeometryUtils } from '../../utils/geometry';
import type { Screen } from '../../types/window';

describe('GeometryUtils', () => {
  describe('calculateWindowPath', () => {
    it('should return empty string for non-existent window', () => {
      const screens: Screen[] = [
        ['window1', { screenX: 0, screenY: 0, screenWidth: 1600, screenHeight: 600, windowWidth: 800, windowHeight: 600 }],
        ['window2', { screenX: 800, screenY: 0, screenWidth: 1600, screenHeight: 600, windowWidth: 800, windowHeight: 600 }]
      ];
      
      const result = GeometryUtils.calculateWindowPath(screens, 'non-existent');
      expect(result).toBe('');
    });

    it('should return single window path for one screen', () => {
      const screens: Screen[] = [
        ['window1', { screenX: 0, screenY: 0, screenWidth: 800, screenHeight: 600, windowWidth: 800, windowHeight: 600 }]
      ];
      
      const result = GeometryUtils.calculateWindowPath(screens, 'window1');
      expect(result).toContain('M');
      expect(result).toContain('A'); // Circle path contains arcs
    });

    it('should return full polygon path for multiple screens', () => {
      const screens: Screen[] = [
        ['window1', { screenX: 0, screenY: 0, screenWidth: 1600, screenHeight: 1200, windowWidth: 800, windowHeight: 600 }],
        ['window2', { screenX: 800, screenY: 0, screenWidth: 1600, screenHeight: 1200, windowWidth: 800, windowHeight: 600 }],
        ['window3', { screenX: 400, screenY: 600, screenWidth: 1600, screenHeight: 1200, windowWidth: 800, windowHeight: 600 }]
      ];
      
      const result = GeometryUtils.calculateWindowPath(screens, 'window1');
      
      // Should contain move command, line commands, and close path
      expect(result).toContain('M');
      expect(result).toContain('L');
      expect(result).toContain('Z');
      
      // Should not be empty
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create identical paths for all windows in same screen set', () => {
      const screens: Screen[] = [
        ['window1', { screenX: 0, screenY: 0, screenWidth: 1600, screenHeight: 600, windowWidth: 800, windowHeight: 600 }],
        ['window2', { screenX: 800, screenY: 0, screenWidth: 1600, screenHeight: 600, windowWidth: 800, windowHeight: 600 }]
      ];
      
      const path1 = GeometryUtils.calculateWindowPath(screens, 'window1');
      const path2 = GeometryUtils.calculateWindowPath(screens, 'window2');
      
      // Paths should be identical because all windows draw the same global polygon
      expect(path1).toBe(path2);
      
      // Both should be valid paths
      expect(path1).toContain('M');
      expect(path2).toContain('M');
      expect(path1).toContain('Z');
      expect(path2).toContain('Z');
    });
  });

  describe('calculatePolygonPath', () => {
    it('should return empty string for empty screens array', () => {
      const result = GeometryUtils.calculatePolygonPath([]);
      expect(result).toBe('');
    });

    it('should return single window path for one screen', () => {
      const screens: Screen[] = [
        ['window1', { screenX: 0, screenY: 0, screenWidth: 800, screenHeight: 600, windowWidth: 800, windowHeight: 600 }]
      ];
      
      const result = GeometryUtils.calculatePolygonPath(screens);
      expect(result).toContain('M');
      expect(result).toContain('A'); // Circle path contains arcs
    });

    it('should return polygon path for multiple screens', () => {
      const screens: Screen[] = [
        ['window1', { screenX: 0, screenY: 0, screenWidth: 1600, screenHeight: 600, windowWidth: 800, windowHeight: 600 }],
        ['window2', { screenX: 800, screenY: 0, screenWidth: 1600, screenHeight: 600, windowWidth: 800, windowHeight: 600 }]
      ];
      
      const result = GeometryUtils.calculatePolygonPath(screens);
      expect(result).toContain('M');
      expect(result).toContain('L');
      expect(result).toContain('Z');
    });
  });
});