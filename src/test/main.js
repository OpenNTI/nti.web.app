const importAll = x => x.keys().forEach(x);


importAll(require.context('../main/js/', true, /^.\/(?!index).+js(x)?$/));
