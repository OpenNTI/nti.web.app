const importAll = x => x.keys().forEach(x);


importAll(require.context('./', true, /^.\/(?!index).+js$/));
