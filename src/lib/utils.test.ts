import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  describe('merges multiple class names', () => {
    it('combines simple class strings', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('combines multiple class strings', () => {
      expect(cn('a', 'b', 'c', 'd')).toBe('a b c d')
    })
  })

  describe('handles conditional classes', () => {
    it('filters out false values', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    it('filters out null values', () => {
      expect(cn('foo', null, 'bar')).toBe('foo bar')
    })

    it('filters out undefined values', () => {
      expect(cn('foo', undefined, 'bar')).toBe('foo bar')
    })

    it('filters out empty strings', () => {
      expect(cn('foo', '', 'bar')).toBe('foo bar')
    })

    it('includes truthy conditional values', () => {
      expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
    })
  })

  describe('Tailwind class conflict resolution', () => {
    it('resolves padding conflicts (later wins)', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
    })

    it('resolves margin conflicts', () => {
      expect(cn('m-2', 'm-4', 'm-8')).toBe('m-8')
    })

    it('resolves text color conflicts', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('resolves background color conflicts', () => {
      expect(cn('bg-white', 'bg-black')).toBe('bg-black')
    })

    it('preserves non-conflicting classes', () => {
      expect(cn('p-4', 'm-2', 'p-2')).toBe('m-2 p-2')
    })

    it('resolves flex direction conflicts', () => {
      expect(cn('flex-row', 'flex-col')).toBe('flex-col')
    })
  })

  describe('works with clsx arrays', () => {
    it('handles array of class names', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
    })

    it('handles nested arrays', () => {
      expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz')
    })

    it('handles arrays with conditionals', () => {
      expect(cn(['foo', false && 'skip', 'bar'])).toBe('foo bar')
    })
  })

  describe('works with clsx objects', () => {
    it('includes keys with truthy values', () => {
      expect(cn({ foo: true, bar: true })).toBe('foo bar')
    })

    it('excludes keys with falsy values', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
    })

    it('handles mixed object values', () => {
      expect(cn({ foo: 1, bar: 0, baz: 'yes', qux: null })).toBe('foo baz')
    })

    it('combines objects with strings', () => {
      expect(cn('base', { conditional: true }, 'extra')).toBe('base conditional extra')
    })
  })

  describe('empty/undefined input handling', () => {
    it('returns empty string for no arguments', () => {
      expect(cn()).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(cn(undefined)).toBe('')
    })

    it('returns empty string for null', () => {
      expect(cn(null)).toBe('')
    })

    it('returns empty string for false', () => {
      expect(cn(false)).toBe('')
    })

    it('returns empty string for empty string', () => {
      expect(cn('')).toBe('')
    })

    it('returns empty string for empty array', () => {
      expect(cn([])).toBe('')
    })

    it('returns empty string for empty object', () => {
      expect(cn({})).toBe('')
    })

    it('handles multiple empty values', () => {
      expect(cn(undefined, null, false, '', [], {})).toBe('')
    })
  })
})
