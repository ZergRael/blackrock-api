function arrToMap(arr: Array<Object>, key: string): Object {
  return arr.reduce((map, obj) => ((map[obj[key]] = obj), map), {});
}

export default { arrToMap };
