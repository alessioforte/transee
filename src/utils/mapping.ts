/**
 * Mapping ---------------------------------------------------------------------
 */

// TODO improve mapping
function mapping(arr: any[]): any {
  const data = {
    pronunciation: arr[0][0],
    correction: arr[0][1] && arr[0][1],
    translation: arr[1][0],
    input: arr[1][4],
    definitions: arr[3] && arr[3][1] && arr[3][1][0], // verb, noun, adjective
    examples: arr[3] && arr[3][2] && arr[3][2][0].map((item) => item[1]),
    seeAlso: arr[3] && arr[3][3] && arr[3][3][0],
    synonyms: arr[3] && arr[3][4] && arr[3][4][0], // verb, noun, adjective
    translations: arr[3] && arr[3][5] && arr[3][5][0], // verb, noun, adjective
    //             arr && arr[3][6] ?
    //             arr && arr[3][7] ?
    //             arr && arr[3][8] ?
    //             arr && arr[3][9] ?
  };
  return data;
}

export default mapping