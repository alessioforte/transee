import { act, createElement, createRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScrollArea from '@/shared/ui/ScrollArea';
import {
  scrollbarGeometry,
  scrollbarPosition,
} from '@/shared/ui/ScrollArea/geometry';
import Searchbar from '@/features/translation/Searchbar';

describe('scrollbar geometry', () => {
  it('omits controls for empty, fitting, and subpixel overflow', () => {
    expect(scrollbarGeometry(0, 100, 0)).toBeNull();
    expect(scrollbarGeometry(100, 100, 0)).toBeNull();
    expect(scrollbarGeometry(100, 100.5, 0)).toBeNull();
  });

  it('scales the thumb and clamps overscroll at both ends', () => {
    expect(scrollbarGeometry(100, 200, 50)).toMatchObject({
      size: 48,
      offset: 24,
      max: 100,
    });
    expect(scrollbarGeometry(100, 200, -30)?.offset).toBe(0);
    expect(scrollbarGeometry(100, 200, 150)?.offset).toBe(48);
  });

  it('keeps long documents draggable and reserves the other scrollbar corner', () => {
    expect(scrollbarGeometry(100, 100000, 0)?.size).toBe(24);
    expect(scrollbarGeometry(100, 200, 0, true)?.size).toBe(42);
    expect(scrollbarGeometry(10, 1000, 0)?.size).toBe(6);
  });

  it('converts track positions without dividing by zero', () => {
    expect(scrollbarPosition(25, 50, 100)).toBe(50);
    expect(scrollbarPosition(-10, 50, 100)).toBe(0);
    expect(scrollbarPosition(80, 50, 100)).toBe(100);
    expect(scrollbarPosition(20, 0, 100)).toBe(0);
  });
});

describe('shared ScrollArea', () => {
  let container: HTMLDivElement;
  let root: Root;
  const disconnect = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(0), 16)
    );
    vi.stubGlobal('cancelAnimationFrame', window.clearTimeout.bind(window));
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {
          /* Dimensions are supplied explicitly in jsdom. */
        }
        disconnect = disconnect;
      }
    );
    disconnect.mockClear();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  async function mount(scrollbars: 'y' | 'xy' = 'y') {
    await act(async () =>
      root.render(
        createElement(ScrollArea, {
          label: 'Test content',
          scrollbars,
          children: createElement('p', null, 'Content'),
        })
      )
    );
    return container.querySelector('[role="region"]') as HTMLDivElement;
  }

  async function measure(
    element: HTMLElement,
    width = 100,
    height = 100,
    scrollWidth = 100,
    scrollHeight = 400
  ) {
    Object.defineProperties(element, {
      clientWidth: { configurable: true, value: width },
      clientHeight: { configurable: true, value: height },
      scrollWidth: { configurable: true, value: scrollWidth },
      scrollHeight: { configurable: true, value: scrollHeight },
    });
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
      vi.advanceTimersByTime(16);
    });
  }

  async function scroll(element: HTMLElement, top: number) {
    await act(async () => {
      element.scrollTop = top;
      element.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(16);
    });
  }

  it('keeps a named keyboard-focusable viewport and hides unnecessary controls', async () => {
    const viewport = await mount();
    expect(viewport.getAttribute('aria-label')).toBe('Test content');
    expect(viewport.tabIndex).toBe(0);
    expect(container.querySelector('[role="scrollbar"]')).toBeNull();
    await measure(viewport, 100, 100, 100, 100);
    expect(container.querySelector('[role="scrollbar"]')).toBeNull();
  });

  it('tracks native scrolling, updates ARIA values, and hides after scrolling stops', async () => {
    const viewport = await mount();
    await measure(viewport);
    const bar = container.querySelector('[role="scrollbar"]')!;
    expect(bar.getAttribute('aria-controls')).toBe(viewport.id);
    expect(bar.getAttribute('aria-valuemax')).toBe('300');
    await scroll(viewport, 150);
    expect(bar.getAttribute('aria-valuenow')).toBe('150');
    expect(container.querySelector('[data-scrolling]')).not.toBeNull();
    await act(async () => vi.advanceTimersByTime(600));
    expect(container.querySelector('[data-scrolling]')).toBeNull();
  });

  it('supports keyboard controls and wheel events over the overlay track', async () => {
    const viewport = await mount();
    await measure(viewport);
    const bar = container.querySelector('[role="scrollbar"]')!;
    await act(async () => {
      bar.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true })
      );
    });
    expect(viewport.scrollTop).toBe(300);
    await scroll(viewport, 0);
    await act(async () => {
      bar.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true })
      );
    });
    expect(viewport.scrollTop).toBe(100);
    const wheel = new WheelEvent('wheel', { deltaY: 25, cancelable: true });
    bar.dispatchEvent(wheel);
    expect(viewport.scrollTop).toBe(125);
    expect(wheel.defaultPrevented).toBe(true);
  });

  it('renders both axes only when enabled and removes them when content shrinks', async () => {
    const viewport = await mount('xy');
    await measure(viewport, 100, 100, 500, 400);
    expect(container.querySelectorAll('[role="scrollbar"]').length).toBe(2);
    expect(container.querySelectorAll('[data-other]').length).toBe(2);
    await act(async () => {
      container.querySelector('[aria-orientation="horizontal"]')!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true })
      );
    });
    expect(viewport.scrollLeft).toBe(400);
    expect(viewport.scrollTop).toBe(0);
    await measure(viewport, 100, 100, 100, 100);
    expect(container.querySelector('[role="scrollbar"]')).toBeNull();
  });

  it('supports thumb dragging with pointer capture and track clicks', async () => {
    const viewport = await mount();
    await measure(viewport);
    const bar = container.querySelector('[role="scrollbar"]') as HTMLDivElement;
    bar.setPointerCapture = vi.fn();
    bar.releasePointerCapture = vi.fn();
    const pointer = (element: Element, type: string, y: number) => {
      const event = new MouseEvent(type, { bubbles: true, button: 0, clientY: y });
      Object.defineProperty(event, 'pointerId', { value: 1 });
      element.dispatchEvent(event);
    };
    await act(async () => {
      pointer(bar.querySelector('[data-scroll-thumb]')!, 'pointerdown', 12);
      pointer(bar, 'pointermove', 48);
      pointer(bar, 'pointerup', 48);
    });
    expect(viewport.scrollTop).toBe(150);
    expect(bar.setPointerCapture).toHaveBeenCalledWith(1);
    expect(bar.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(bar.hasAttribute('data-dragging')).toBe(false);
    await scroll(viewport, 0);
    await act(async () => {
      pointer(bar, 'pointerdown', 80);
      pointer(bar, 'pointercancel', 80);
    });
    expect(viewport.scrollTop).toBe(275);
    expect(bar.hasAttribute('data-dragging')).toBe(false);
  });

  it('binds to the actual textarea without replacing its native caret/scroll behavior', async () => {
    const input = createRef<HTMLTextAreaElement>();
    await act(async () =>
      root.render(
        createElement(ScrollArea, {
          label: 'Source text',
          viewportRef: input,
          children: createElement('textarea', {
            ref: input,
            id: 'source-text',
          }),
        })
      )
    );
    expect(container.querySelector('[role="region"]')).toBeNull();
    await measure(input.current!);
    expect(
      container
        .querySelector('[role="scrollbar"]')
        ?.getAttribute('aria-controls')
    ).toBe('source-text');
    await scroll(input.current!, 80);
    expect(
      container
        .querySelector('[role="scrollbar"]')
        ?.getAttribute('aria-valuenow')
    ).toBe('80');
  });

  it('does not resize or reset the search textarea when the user scrolls it', async () => {
    const onResize = vi.fn();
    await act(async () =>
      root.render(
        createElement(Searchbar, { initialValue: 'Long source text', onResize })
      )
    );
    const textarea = container.querySelector(
      '#searchbar'
    ) as HTMLTextAreaElement;
    await measure(textarea);
    const before = onResize.mock.calls.length;
    await scroll(textarea, 120);
    expect(textarea.scrollTop).toBe(120);
    expect(onResize).toHaveBeenCalledTimes(before);
  });

  it('disconnects observers and cancels pending scroll work on unmount', async () => {
    const viewport = await mount();
    await measure(viewport);
    await scroll(viewport, 100);
    await act(async () => root.render(null));
    expect(disconnect).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});
