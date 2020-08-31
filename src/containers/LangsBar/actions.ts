import {
  Options,
  Option,
  Conversion,
  Target,
  Values,
  Selected,
} from './interfaces';

const getOpposite = (conversion: Target): Target => {
  return conversion === Conversion.to ? Conversion.from : Conversion.to;
};

export const selectLangs = (
  prev: Values,
  target: Target,
  opt: Option
): Values => {
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

export const invertLangs = (prev: Values): Values => {
  const { threesome, selected } = prev;
  const isInToThreesome = threesome.to.some(
    (item: Option) => item.value === selected.from
  );
  const isInFromThreesome = threesome.from.some(
    (item: Option) => item.value === selected.to
  );
  const newThreesome: Options = { ...threesome };
  if (!isInFromThreesome || !isInToThreesome) {
    const activeFromIndex: number = threesome.from.findIndex(
      (item: Option) => item.value === selected.from
    );
    const activeToIndex: number = threesome.to.findIndex(
      (item: Option) => item.value === selected.to
    );
    if (!isInFromThreesome) {
      newThreesome.from[activeFromIndex] = newThreesome.to[activeToIndex];
    } else {
      newThreesome.to[activeToIndex] = newThreesome.from[activeFromIndex];
    }
  }

  const newSelected = { from: selected.to, to: selected.from };
  return { threesome: newThreesome, selected: newSelected };
};
