# free fork of jqGrid
======

jqGrid is a popular jQuery Plugin for displaying and editing data in tabular form. It has some other more sophisticated features, like subgrids, TreeGrids, grouping and so on.

jqGrid was developed mostly by [Tony Tomov](https://github.com/tonytomov) in the past and it was available under MIT/GPL-licences till the version 4.7.0 published Dec 8, 2014 (see [here](https://github.com/tonytomov/jqGrid/tree/v4.7.0)). Short time after that the license agreement was changed (see <a href="https://github.com/tonytomov/jqGrid/commit/1b2cb55c93ee8b279f15a3faf5a2f82a98da3b4c">here</a>) and new 4.7.1 version was <a href="https://github.com/tonytomov/jqGrid/tree/v4.7.1">published</a>.

The code from the GitHib repository is the fork of jqGrid 4.7.0 - the latest version available under MIT/GPL-licences. It will be provided under MIT/GPL-licences.

Below you can find short description of the bug fixes implemented in free jqGrid 4.9.2 (compared with version 4.9.1). The version is developed by [Oleg Kiriljuk](https://github.com/OlegKi), alias [Oleg](http://stackoverflow.com/users/315935/oleg) on the stackoverflow and [OlegK](http://www.trirand.com/blog/?page_id=393) on trirand forum.

Read [Wiki](https://github.com/free-jqgrid/jqGrid/wiki) for more detailed information about the features of free-jqGrid.

Free jqGrid can be used *for free*. You can still donate by clicking on the following button [![PayPayl donate button](https://www.paypalobjects.com/webstatic/en_US/btn/btn_donate_pp_142x27.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JGTCBLQM2BYHG "Donate once-off to free jqGrid project using Paypal") or by sending money via Paypal to oleg.kiriljuk@ok-soft-gmbh.com with the comment "free jqGrid".

One can install the package with respect of [bower](http://bower.io/search/?q=free-jqgrid) by using "bower install free-jqgrid", with respect of [npm](https://www.npmjs.com/package/free-jqgrid) by using "npm install free-jqgrid" or from [NuGet](https://www.nuget.org/packages/free-jqGrid) by using "Install-Package free-jqGrid".

The repository is included on [cdnjs](https://cdnjs.com/libraries/free-jqgrid). So one can include CSS by using
```html
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.9.2/css/ui.jqgrid.css">
```
If you skip `http:` and `https:` prefix in the URL then the prefix of the current page will be used. In the same way you can access JavaScript files by
```html
<script src="//cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.9.2/js/jquery.jqgrid.min.js"></script>
```
or
```html
<script src="//cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.9.2/js/jquery.jqgrid.src.js"></script>
```
All language files are available in `js/i18n` sub-folder and plugins under `plugins` sub-folder. For example
```html
<script src="//cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.9.2/js/i18n/grid.locale-de.js"></script>
```

In the same way free jqGrid can be loaded from jsDelivr CDN too (see [here](http://www.jsdelivr.com/#!free-jqgrid)). 
```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/free-jqgrid/4.9.2/css/ui.jqgrid.css">
<script src="//cdn.jsdelivr.net/free-jqgrid/4.9.2/js/i18n/grid.locale-de.js"></script>
<script src="//cdn.jsdelivr.net/free-jqgrid/4.9.2/js/jquery.jqgrid.min.js"></script>
```

It somebody want to test the *latest* version of free jqGrid one can load it directly from GitHib using [RawGit](http://rawgit.com/) service:
```html
<link rel="stylesheet" href="//rawgit.com/free-jqgrid/jqGrid/master/css/ui.jqgrid.css">
<script src="//rawgit.com/free-jqgrid/jqGrid/master/js/i18n/grid.locale-de.js"></script>
<script src="//rawgit.com/free-jqgrid/jqGrid/master/js/jquery.jqgrid.src.js"></script>
```

Remark: the above URLs will be available *after* publishing the release of the version of 4.9.2

### The following bug fixes and small new features are implemented in the version 4.9.2.

* Bug fix in processing of `searchoptions.dataUrl`.
* Fix unbinding of `jqGridBeforeSelectRow.setTreeNode`.
* Many small fixes in the code to be able to use jqGrid on pages having `Content-type: application/xhtml+xml`, so that the HTML page are interpreted strictly as XML.
* Bug fix the width of `formatter:"actions"` column if fontAwesomeIcons are not used.
* Small improvement in top and height of column resizer.
* Small improvements of compatibility with jQuery 3.0.0 alpha1. jQuery 3.0.0 alpha1 have important bugs and so only the base functionality is supported.
* Improvements in compatibility with XHTML standards.
* Bug fix in the call of `resizeStart` callback and `jqGridResizeStart` event.
* Fix of small bug in `encodeAttr` used in `cellattr`.
* Bug fix in using option text matching of `edittype: "select"` if value matching exist.
* The plugin grid.odata.js, developed by Mark Babayev (https://github.com/mirik123, markolog@gmail.com) is updated. It provides jqGrid methods allows easy usage of free jqGrid with OData services. [The wiki article](https://github.com/free-jqgrid/jqGrid/wiki/OData-plugin-for-jqGrid) described more detailed the current version of the plugin.

[README491.md](https://github.com/free-jqgrid/jqGrid/blob/master/README491.md) contains the readme of free jqGrid 4.9.1.
[README49.md](https://github.com/free-jqgrid/jqGrid/blob/master/README49.md) contains the readme of free jqGrid 4.9.
[README48.md](https://github.com/free-jqgrid/jqGrid/blob/master/README48.md) contains the readme of free jqGrid 4.8.

Many thanks to all, who sent bug reports and suggestions to improve free jqGrid!
