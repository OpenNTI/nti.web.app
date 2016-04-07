// import '../main/js/legacy/__test__/app.spec';

const importAll = x => x.keys().forEach(x);

//Legacy ExJS Code: (skipping the index.js -- sp that we do not boot up the app in phantom)
importAll(require.context('../main/js/legacy/', true, /^.\/(?!(index)).+spec\.js(x)?$/));

//The rest:
importAll(require.context('../main/js/', true, /^.\/(?!(index|legacy)).+js(x)?$/));
