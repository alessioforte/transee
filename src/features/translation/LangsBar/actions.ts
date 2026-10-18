import {
  Options,
  Option,
  Conversion,
  Target,
  Langs,
  Selected,
} from './interfaces';
import { AUTO, langsFrom, langsTo, ttsLangs } from '../langs';

const getOpposite = (conversion: Target): Target => {
  return conversion === Conversion.to ? Conversion.from : Conversion.to;
};

export const selectLangs = (
  prev: Langs,
  target: Target,
  opt: Option
): Langs => {
  const { threesome, selected } = prev;
  const { value } = opt;
  const newSelected: Selected = { ...selected };
  const newThreesome: Options = {
    from: [...threesome.from],
    to: [...threesome.to],
  };
  const opposite = getOpposite(target);

  const isInThreesome = threesome[target].some(
    (item: Option) => item.value === opt.value
  );
  if (!isInThreesome) {
    const activeIndex: number = threesome[target].findIndex(
      (item: Option) => item.value === newSelected[target]
    );
    newThreesome[target][activeIndex] = opt;
  }

  newSelected[target] = value;

  if (newSelected[opposite] === value) {
    newSelected[opposite] = selected[target];
    newSelected[target] = selected[opposite];
    // `auto` cannot be a target: fall back to another quick-pick target.
    if (newSelected.to === AUTO) {
      const fallback = threesome.to.find(
        (item: Option) => item.value !== newSelected.from
      );
      if (fallback) newSelected.to = fallback.value;
    }
  } else {
    newSelected[target] = value;
  }

  const isInOppositeThreesome = threesome[opposite].some(
    (item: Option) => item.value === newSelected[opposite]
  );

  if (!isInOppositeThreesome) {
    const option: Option | undefined = threesome[target].find(
      (item: Option) => item.value === selected[target]
    );
    if (option) {
      newThreesome[opposite][2] = option;
    }
  }

  return { threesome: newThreesome, selected: newSelected };
};

/** `prev` with the `auto` source replaced by the language Google detected. */
const withDetected = (prev: Langs, detected: Option): Langs => {
  const { threesome, selected } = prev;
  const isInBar = threesome.from.some(
    (item: Option) => item.value === detected.value
  );
  return {
    threesome: {
      from: isInBar
        ? threesome.from
        : threesome.from.map((item: Option) =>
            item.value === AUTO ? detected : item
          ),
      to: threesome.to,
    },
    selected: { ...selected, from: detected.value },
  };
};

/**
 * Swaps source and target. With `auto` selected the detected language becomes
 * the target, as on translate.google.com; until something has been detected
 * there is nothing to swap and `prev` is returned unchanged.
 */
export const invertLangs = (prev: Langs, detected?: Option): Langs => {
  if (prev.selected.from === AUTO) {
    if (!detected || detected.value === prev.selected.to) return prev;
    return invertLangs(withDetected(prev, detected));
  }

  const { threesome, selected } = prev;

  const isInToThreesome = threesome.to.some(
    (item: Option) => item.value === selected.from
  );
  const isInFromThreesome = threesome.from.some(
    (item: Option) => item.value === selected.to
  );

  // Fresh arrays: the slots are reassigned below and `prev` is store state.
  const newThreesome: Options = {
    from: [...threesome.from],
    to: [...threesome.to],
  };

  if (!isInFromThreesome || !isInToThreesome) {
    const activeFromIndex: number = threesome.from.findIndex(
      (item: Option) => item.value === selected.from
    );
    const activeToIndex: number = threesome.to.findIndex(
      (item: Option) => item.value === selected.to
    );
    const to = newThreesome.from[activeFromIndex];
    const from = newThreesome.to[activeToIndex];

    if (!isInFromThreesome) {
      newThreesome.from[activeFromIndex] = from;
    }
    if (!isInToThreesome) {
      newThreesome.to[activeToIndex] = to;
    }
  }

  const newSelected = { from: selected.to, to: selected.from };
  return { threesome: newThreesome, selected: newSelected };
};

/** The detected source language as a bar option, while `auto` is selected. */
export const detectedOption = (
  selected: Selected,
  source: string | null | undefined
): Option | undefined =>
  selected.from === AUTO && source && source !== AUTO && langsFrom[source]
    ? { value: source, label: langsFrom[source] }
    : undefined;

/** The language the source text is in, or `null` while it is undetected. */
export const resolveSource = (
  selected: Selected,
  source: string | null | undefined
): string | null =>
  selected.from === AUTO ? (source && source !== AUTO ? source : null) : selected.from;

/** Whether Google's text-to-speech has a voice for `lang`. */
export const canSpeak = (lang: string | null | undefined): lang is string =>
  !!lang && ttsLangs.has(lang);

/** Codes the app once persisted that Google never used. */
const RENAMED: Record<string, string> = {
  ma: 'pa', // Punjabi used to be listed under `ma`, which Google does not know
};

/**
 * Brings persisted language settings up to the current catalogue: corrects
 * codes the app used to store wrongly and refreshes labels Google has renamed.
 * Codes missing from the catalogue are kept untouched; data that does not look
 * like `Langs` at all is returned as it came.
 */
export const normalizeLangs = (langs: Langs): Langs => {
  if (
    !langs?.selected ||
    !Array.isArray(langs.threesome?.from) ||
    !Array.isArray(langs.threesome?.to)
  ) {
    return langs;
  }
  const code = (value: string) => RENAMED[value] ?? value;
  const refresh = (labels: Record<string, string>) => (opt: Option): Option => {
    const value = code(opt.value);
    return { value, label: labels[value] ?? opt.label };
  };
  return {
    threesome: {
      from: langs.threesome.from.map(refresh(langsFrom)),
      to: langs.threesome.to.map(refresh(langsTo)),
    },
    selected: {
      from: code(langs.selected.from),
      to: code(langs.selected.to),
    },
  };
};
