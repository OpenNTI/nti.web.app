//Import all files (webpack extention)
(x => x.keys().forEach(x))(require.context('./', true, /^.\/(?!index).+js$/));
