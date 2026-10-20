import {
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  scrollbarGeometry,
  scrollbarPosition,
  SCROLLBAR_PADDING,
} from './geometry';
import styles from './ScrollArea.module.css';

type Metrics = {
  width: number;
  height: number;
  scrollWidth: number;
  scrollHeight: number;
  left: number;
  top: number;
};

type Props = {
  children: ReactNode;
  label: string;
  className?: string;
  scrollbars?: 'y' | 'xy';
  /** Bind the same overlay to an existing textarea, preserving caret scrolling. */
  viewportRef?: RefObject<HTMLTextAreaElement | null>;
};

type Geometry = NonNullable<ReturnType<typeof scrollbarGeometry>>;

function Scrollbar({
  axis,
  geometry,
  viewport,
  viewportId,
  label,
  hasOther,
}: {
  axis: 'x' | 'y';
  geometry: Geometry;
  viewport: RefObject<HTMLElement | null>;
  viewportId: string;
  label: string;
  hasOther: boolean;
}) {
  const drag = useRef<{ pointer: number; start: number; value: number } | null>(
    null
  );
  const track = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const vertical = axis === 'y';

  // The overlay is a sibling of the viewport, so wheel events over the track
  // must be forwarded explicitly. A non-passive listener can prevent chaining.
  useEffect(() => {
    const element = track.current;
    if (!element) return undefined;
    const onWheel = (event: WheelEvent) => {
      const target = viewport.current;
      if (!target) return;
      event.preventDefault();
      const page = vertical ? target.clientHeight : target.clientWidth;
      const unit =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page : 1;
      target[vertical ? 'scrollTop' : 'scrollLeft'] +=
        (vertical ? event.deltaY : event.deltaX || event.deltaY) * unit;
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [vertical, viewport]);

  const scrollTo = (value: number) => {
    const element = viewport.current;
    if (!element) return;
    element[vertical ? 'scrollTop' : 'scrollLeft'] = Math.max(
      0,
      Math.min(geometry.max, value)
    );
  };

  return (
    <div
      ref={track}
      className={styles.scrollbar}
      data-orientation={vertical ? 'vertical' : 'horizontal'}
      data-other={hasOther || undefined}
      data-dragging={dragging || undefined}
      role="scrollbar"
      aria-label={`${label}: ${vertical ? 'vertical' : 'horizontal'} scroll`}
      aria-controls={viewportId}
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      aria-valuemin={0}
      aria-valuemax={Math.round(geometry.max)}
      aria-valuenow={Math.round(geometry.value)}
      tabIndex={0}
      onKeyDown={(event) => {
        const element = viewport.current;
        if (!element) return;
        const page = vertical ? element.clientHeight : element.clientWidth;
        const steps: Record<string, number> = {
          [vertical ? 'ArrowUp' : 'ArrowLeft']: geometry.value - 40,
          [vertical ? 'ArrowDown' : 'ArrowRight']: geometry.value + 40,
          PageUp: geometry.value - page,
          PageDown: geometry.value + page,
          Home: 0,
          End: geometry.max,
        };
        if (!(event.key in steps)) return;
        event.preventDefault();
        event.stopPropagation();
        scrollTo(steps[event.key]);
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        const point = vertical ? event.clientY : event.clientX;
        const bounds = event.currentTarget.getBoundingClientRect();
        let value = geometry.value;
        if (!(event.target as HTMLElement).closest('[data-scroll-thumb]')) {
          value = scrollbarPosition(
            point -
              (vertical ? bounds.top : bounds.left) -
              SCROLLBAR_PADDING -
              geometry.size / 2,
            geometry.travel,
            geometry.max
          );
          scrollTo(value);
        }
        drag.current = { pointer: event.pointerId, start: point, value };
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (!start || start.pointer !== event.pointerId || geometry.travel <= 0)
          return;
        const delta = (vertical ? event.clientY : event.clientX) - start.start;
        scrollTo(start.value + (delta / geometry.travel) * geometry.max);
      }}
      onPointerUp={(event) => {
        if (drag.current?.pointer !== event.pointerId) return;
        drag.current = null;
        setDragging(false);
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragging(false);
      }}
      onLostPointerCapture={() => {
        drag.current = null;
        setDragging(false);
      }}
    >
      <div
        className={styles.thumb}
        data-scroll-thumb=""
        style={
          vertical
            ? {
                height: geometry.size,
                transform: `translateY(${geometry.offset}px)`,
              }
            : {
                width: geometry.size,
                transform: `translateX(${geometry.offset}px)`,
              }
        }
      />
    </div>
  );
}

/** Native scrolling with app-drawn overlay controls, including for textareas. */
export default function ScrollArea({
  children,
  label,
  className = '',
  scrollbars = 'y',
  viewportRef,
}: Props) {
  const id = useId();
  const ownViewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const viewport: RefObject<HTMLElement | null> = viewportRef ?? ownViewport;
  const [metrics, setMetrics] = useState<Metrics>({
    width: 0,
    height: 0,
    scrollWidth: 0,
    scrollHeight: 0,
    left: 0,
    top: 0,
  });
  const [scrolling, setScrolling] = useState(false);

  const measure = useCallback(() => {
    const element = viewport.current;
    if (!element) return;
    const next: Metrics = {
      width: element.clientWidth,
      height: element.clientHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      left: element.scrollLeft,
      top: element.scrollTop,
    };
    setMetrics((previous) =>
      Object.keys(next).every(
        (key) => next[key as keyof Metrics] === previous[key as keyof Metrics]
      )
        ? previous
        : next
    );
  }, [viewport]);

  // Controlled textarea values and filtered content can change between renders.
  useLayoutEffect(measure);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return undefined;
    let frame = 0;
    let hide: number | undefined;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const onScroll = () => {
      schedule();
      setScrolling(true);
      window.clearTimeout(hide);
      hide = window.setTimeout(() => setScrolling(false), 600);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    if (content.current) observer.observe(content.current);
    element.addEventListener('scroll', onScroll, { passive: true });
    element.addEventListener('input', schedule);
    element.addEventListener('keyup', schedule);
    window.addEventListener('resize', schedule);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(hide);
      element.removeEventListener('scroll', onScroll);
      element.removeEventListener('input', schedule);
      element.removeEventListener('keyup', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [measure, viewport]);

  const hasX = scrollbars === 'xy' && metrics.scrollWidth > metrics.width + 1;
  const hasY = metrics.scrollHeight > metrics.height + 1;
  const y = scrollbarGeometry(
    metrics.height,
    metrics.scrollHeight,
    metrics.top,
    hasX
  );
  const x = hasX
    ? scrollbarGeometry(metrics.width, metrics.scrollWidth, metrics.left, hasY)
    : null;
  const viewportId = viewportRef?.current?.id || id;

  return (
    <div
      className={`${styles.root} ${className}`}
      data-scroll-area=""
      data-scrolling={scrolling || undefined}
    >
      {viewportRef ? (
        children
      ) : (
        <div
          ref={ownViewport}
          id={id}
          className={styles.viewport}
          data-scrollbars={scrollbars}
          role="region"
          aria-label={label}
          tabIndex={0}
        >
          <div ref={content}>{children}</div>
        </div>
      )}
      {y && (
        <Scrollbar
          axis="y"
          geometry={y}
          viewport={viewport}
          viewportId={viewportId}
          label={label}
          hasOther={hasX}
        />
      )}
      {x && (
        <Scrollbar
          axis="x"
          geometry={x}
          viewport={viewport}
          viewportId={viewportId}
          label={label}
          hasOther={hasY}
        />
      )}
    </div>
  );
}
