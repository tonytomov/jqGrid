# free fork of jqGrid
======

jqGrid is a popular jQuery Plugin for displaying and editing data in tabular form. It has some other more sophisticated features, like subgrids, TreeGrids, grouping and so on.

jqGrid was developed mostly by [Tony Tomov](https://github.com/tonytomov) in the past and it was available under MIT/GPL-licences till the version 4.7.0 published Dec 8, 2014 (see [here](https://github.com/tonytomov/jqGrid/tree/v4.7.0)). Short time after that the license agreement was changed (see <a href="https://github.com/tonytomov/jqGrid/commit/1b2cb55c93ee8b279f15a3faf5a2f82a98da3b4c">here</a>) and new 4.7.1 version was <a href="https://github.com/tonytomov/jqGrid/tree/v4.7.1">published</a>.

The code from the GitHib repository is the fork of jqGrid 4.7.0 - the latest version available under MIT/GPL-licences. It will be provided under MIT/GPL-licences.

Below you can find short description of the bug fixes implemented in free jqGrid 4.9.1 (compared with version 4.9). The version is developed by [Oleg Kiriljuk](https://github.com/OlegKi), alias [Oleg](http://stackoverflow.com/users/315935/oleg) on the stackoverflow and [OlegK](http://www.trirand.com/blog/?page_id=393) on trirand forum.

Read [Wiki](https://github.com/free-jqgrid/jqGrid/wiki) for more detailed information about the features of free-jqGrid.

Free jqGrid can be used *for free*. You can still donate by sending money via Paypal to oleg.kiriljuk@ok-soft-gmbh.com with the comment "free jqGrid".

One can install the package with respect of [bower](http://bower.io/search/?q=free-jqgrid) by using "bower install free-jqgrid", with respect of [npm](https://www.npmjs.com/package/free-jqgrid) by using "npm install free-jqgrid" or from [NuGet](https://www.nuget.org/packages/free-jqGrid) by using "Install-Package free-jqGrid".

The repository is included on [cdnjs](https://cdnjs.com/libraries/free-jqgrid). So one can include CSS by using
```html
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.9.1/css/ui.jqgrid.css">
```
If you skip `http:` and `https:` prefix in the URL then the prefix of the current page will be used. In the same way you can access JavaScript files by
```html
<script src="//cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.9.1/js/jquery.jqgrid.min.js"></script>
```
or
```html
<script src="//cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.9.1/js/jquery.jqgrid.src.js"></script>
```
All language files are available in `js/i18n` sub-folder and plugins under `plugins` sub-folder. For example
```html
<script src="//cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.9.1/js/i18n/grid.locale-de.js"></script>
```

In the same way free jqGrid can be loaded from jsDelivr CDN too (see [here](http://www.jsdelivr.com/#!free-jqgrid)). 
```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/free-jqgrid/4.9.1/css/ui.jqgrid.css">
<script src="//cdn.jsdelivr.net/free-jqgrid/4.9.1/js/i18n/grid.locale-de.js"></script>
<script src="//cdn.jsdelivr.net/free-jqgrid/4.9.1/js/jquery.jqgrid.min.js"></script>
```

It somebody want to test the *latest* version of free jqGrid one can load it directly from GitHib using [RawGit](http://rawgit.com/) service:
```html
<link rel="stylesheet" href="//rawgit.com/free-jqgrid/jqGrid/master/css/ui.jqgrid.css">
<script src="//rawgit.com/free-jqgrid/jqGrid/master/js/i18n/grid.locale-de.js"></script>
<script src="//rawgit.com/free-jqgrid/jqGrid/master/js/jquery.jqgrid.src.js"></script>
```

Remark: the above URLs will be available *after* publishing the release of the version of 4.9.1

### The following bug fixes and small new features are implemented in the version 4.9.1.

* Bug fix in the usage of `editoptions.custom_value`.
* `buildSelect` callback includes now `cm` and `iCol` parameters.
* Bug fix in case of usage `searchoptions.dataUrl` in multiple columns and slow Ajax processing.
* Fix z-index of operation menu of `filterToobar` in case of usage in dialogs.
* Improving parsing of string returned by `cellattr`. One can for example set now any tooltips and the texts (including the words "style" or "title") will be not changed.
* Fix problem with missing common icon class for minus in TreeGrid in case of usage custom plus icon.
* Fix TreeGrid fixes for `treeGridModel: "nested"`.
* New option `sortIconsBeforeText: true` is implemented which allows to place sorting icons before texts in column headers.
* Update `grid.locale-fr.js`. Translation of `showhide` is included.
* Fix of small bug in `encodeAttr` used in `cellattr`.
* Bug fix in resizing of columns and for frozen column in case of usage together with the option `direction:"rtl"`.
* New property `headerTitle` which allows to specify title (tooltip) for the column header. It works with or without of the usage old `headertitles: true` option.
* Bug fix in case if one use string as the value of width parameter.
* Add new parameter of `getRowData` which allows to specify object with up two boolean properties: `skipHidden` and `includeId`.
* Fix the problem with recreating grouping headers in `hideCol`. The problem exist in combination with jqPivot which could creates multilevel column headers.
* Fix the error in calling of `getCellBuilder` for unknown string formatter (like non-existing `formatter: "string"` for example).
* Fix TreeGrid to load children of nodes dynamically (`treedatatype` not equal to `"local"`).
* The plugin grid.odata.js, developed by Mark Babayev (https://github.com/mirik123, markolog@gmail.com) is updated. It provides jqGrid methods allows easy usage of free jqGrid with OData services. [The wiki article](https://github.com/free-jqgrid/jqGrid/wiki/OData-plugin-for-jqGrid) described more detailed the current version of the plugin.

[README49.md](https://github.com/free-jqgrid/jqGrid/blob/master/README49.md) contains the readme of free jqGrid 4.9.
[README48.md](https://github.com/free-jqgrid/jqGrid/blob/master/README48.md) contains the readme of free jqGrid 4.8.

Many thanks to all, who sent bug reports and suggestions to improve free jqGrid!
