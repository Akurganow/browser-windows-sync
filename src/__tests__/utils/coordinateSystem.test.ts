import { describe, it, expect } from 'vitest';
import { CoordinateSystem } from '../../utils/coordinates';
import type { Point, ViewBox } from '../../types/geometry';
import type { WindowDetails } from '../../types/window';

describe('CoordinateSystem', () => {
  const mockWindowDetails: WindowDetails = {
    screenX: 100,
    screenY: 200,
    windowWidth: 800,
    windowHeight: 600,
    screenWidth: 1920,
    screenHeight: 1080
  };

  describe('globalToLocal', () => {
    it('should convert global coordinates to local coordinates', () => {
      const globalPoint: Point = { x: 500, y: 400 };
      const result = CoordinateSystem.globalToLocal(globalPoint, mockWindowDetails);
      
      expect(result).toEqual({ x: 400, y: 200 });
    });

    it('should handle zero coordinates', () => {
      const globalPoint: Point = { x: 0, y: 0 };
      const result = CoordinateSystem.globalToLocal(globalPoint, mockWindowDetails);
      
      expect(result).toEqual({ x: -100, y: -200 });
    });
  });

  describe('localToGlobal', () => {
    it('should convert local coordinates to global coordinates', () => {
      const localPoint: Point = { x: 400, y: 200 };
      const result = CoordinateSystem.localToGlobal(localPoint, mockWindowDetails);
      
      expect(result).toEqual({ x: 500, y: 400 });
    });

    it('should handle zero coordinates', () => {
      const localPoint: Point = { x: 0, y: 0 };
      const result = CoordinateSystem.localToGlobal(localPoint, mockWindowDetails);
      
      expect(result).toEqual({ x: 100, y: 200 });
    });
  });

  describe('getWindowCenter', () => {
    it('should calculate window center in global coordinates', () => {
      const result = CoordinateSystem.getWindowCenter(mockWindowDetails);
      
      expect(result).toEqual({ x: 500, y: 500 });
    });

    it('should handle window at origin', () => {
      const windowAtOrigin: WindowDetails = {
        ...mockWindowDetails,
        screenX: 0,
        screenY: 0
      };
      const result = CoordinateSystem.getWindowCenter(windowAtOrigin);
      
      expect(result).toEqual({ x: 400, y: 300 });
    });
  });

  describe('calculateViewBox', () => {
    it('should create correct ViewBox from window details', () => {
      const result = CoordinateSystem.calculateViewBox(mockWindowDetails);
      
      expect(result).toEqual({
        x: 0,
        y: 0,
        width: 1920,
        height: 1080
      });
    });
  });

  describe('formatViewBox', () => {
    it('should format ViewBox as string', () => {
      const viewBox: ViewBox = { x: 10, y: 20, width: 800, height: 600 };
      const result = CoordinateSystem.formatViewBox(viewBox);
      
      expect(result).toBe('10 20 800 600');
    });

    it('should handle zero values', () => {
      const viewBox: ViewBox = { x: 0, y: 0, width: 0, height: 0 };
      const result = CoordinateSystem.formatViewBox(viewBox);
      
      expect(result).toBe('0 0 0 0');
    });
  });

  describe('isPointInRectangle', () => {
    it('should return true for point inside rectangle', () => {
      const point: Point = { x: 150, y: 250 };
      const result = CoordinateSystem.isPointInRectangle(point, 100, 200, 200, 150);
      
      expect(result).toBe(true);
    });

    it('should return false for point outside rectangle', () => {
      const point: Point = { x: 50, y: 100 };
      const result = CoordinateSystem.isPointInRectangle(point, 100, 200, 200, 150);
      
      expect(result).toBe(false);
    });

    it('should return true for point on rectangle edge', () => {
      const point: Point = { x: 100, y: 200 };
      const result = CoordinateSystem.isPointInRectangle(point, 100, 200, 200, 150);
      
      expect(result).toBe(true);
    });
  });

  describe('getDistance', () => {
    it('should calculate distance between two points', () => {
      const point1: Point = { x: 0, y: 0 };
      const point2: Point = { x: 3, y: 4 };
      const result = CoordinateSystem.getDistance(point1, point2);
      
      expect(result).toBe(5);
    });

    it('should return zero for same points', () => {
      const point: Point = { x: 100, y: 200 };
      const result = CoordinateSystem.getDistance(point, point);
      
      expect(result).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const point1: Point = { x: -3, y: -4 };
      const point2: Point = { x: 0, y: 0 };
      const result = CoordinateSystem.getDistance(point1, point2);
      
      expect(result).toBe(5);
    });
  });

  describe('createCSSVariables', () => {
    it('should create correct CSS variables object', () => {
      const result = CoordinateSystem.createCSSVariables(mockWindowDetails);
      
      expect(result).toEqual({
        '--screen-width': '1920px',
        '--screen-height': '1080px',
        '--screen-x': '-100px',
        '--screen-y': '-200px',
        '--window-width': '800px',
        '--window-height': '600px'
      });
    });

    it('should handle zero values', () => {
      const zeroWindow: WindowDetails = {
        screenX: 0,
        screenY: 0,
        windowWidth: 0,
        windowHeight: 0,
        screenWidth: 0,
        screenHeight: 0
      };
      const result = CoordinateSystem.createCSSVariables(zeroWindow);
      
      expect(result).toEqual({
        '--screen-width': '0px',
        '--screen-height': '0px',
        '--screen-x': '0px',
        '--screen-y': '0px',
        '--window-width': '0px',
        '--window-height': '0px'
      });
    });
  });
});