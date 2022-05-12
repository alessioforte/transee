import { Options } from '../../containers/LangsBar/interfaces';
import { langsFrom, langsTo } from '../../services/langs';

const mappingLangs = ({ langsFrom, langsTo }: { langsFrom: object, langsTo: object }) => {
  const options: Options = {
    from: Object.entries(langsFrom).map(([key, value]) => ({
      label: value,
      value: key,
    })),
    to: Object.entries(langsTo).map(([key, value]) => ({
      label: value,
      value: key,
    })),
  };
  return options
}

export default mappingLangs({ langsFrom, langsTo })
