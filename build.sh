sencha create jsb -a http://localhost/WebApp/index.html -p app.jsb3
sencha build -p app.jsb3 -d .
rm all-classes.js
svn commit app-all.js -m "hangout..."
curl http://alpha.nextthought.com/_update.cgi
