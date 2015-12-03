# free fork of jqGrid
======

jqGrid is a popular jQuery Plugin for displaying and editing data in tabular form. It has some other more sophisticated features, like subgrids, TreeGrids, grouping and so on.

jqGrid was developed mostly by [Tony Tomov](https://github.com/tonytomov) in the past and it was available under MIT/GPL-licences till the version 4.7.0 published Dec 8, 2014 (see [here](https://github.com/tonytomov/jqGrid/tree/v4.7.0)). Short time after that the license agreement was changed (see <a href="https://github.com/tonytomov/jqGrid/commit/1b2cb55c93ee8b279f15a3faf5a2f82a98da3b4c">here</a>) and new 4.7.1 version was <a href="https://github.com/tonytomov/jqGrid/tree/v4.7.1">published</a>.

The code from the GitHib repository is the fork of jqGrid 4.7.0 - the latest version available under MIT/GPL-licences. It will be provided under MIT/GPL-licences.

Below you can find short description of new features and bug fixes implemented in free jqGrid 4.11.0 (compared with version 4.10.0). The version is developed by [Oleg Kiriljuk](https://github.com/OlegKi), alias [Oleg](http://stackoverflow.com/users/315935/oleg) on the stackoverflow and [OlegK](http://www.trirand.com/blog/?page_id=393) on trirand forum.

Read [Wiki](https://github.com/free-jqgrid/jqGrid/wiki) for more detailed information about the features of free-jqGrid.

Free jqGrid can be used *for free*. We still ask to contribute the development by donating via PayPal, if one have the possibility for it. One can donate by clicking on the following button [![PayPayl donate button](https://www.paypalobjects.com/webstatic/en_US/btn/btn_donate_pp_142x27.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JGTCBLQM2BYHG "Donate once-off to free jqGrid project using Paypal") or by sending money via Paypal to oleg.kiriljuk@ok-soft-gmbh.com with the comment "free jqGrid".

One can install the package with respect of [bower](http://bower.io/search/?q=free-jqgrid) by using "bower install free-jqgrid", with respect of [npm](https://www.npmjs.com/package/free-jqgrid) by using "npm install free-jqgrid" or from [NuGet](https://www.nuget.org/packages/free-jqGrid) by using "Install-Package free-jqGrid".

Free jqGrid is published on [cdnjs](https://cdnjs.com/libraries/free-jqgrid) and [jsDelivr CDN](http://www.jsdelivr.com/#!free-jqgrid). So one can use it directly from Internet by including for example
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.11.0/css/ui.jqgrid.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.11.0/js/i18n/grid.locale-de.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.11.0/js/jquery.jqgrid.min.js"></script>
```

It somebody want to test the *latest* version of free jqGrid, one can load it directly from GitHib using [RawGit](http://rawgit.com/) service:
```html
<link rel="stylesheet" href="https://rawgit.com/free-jqgrid/jqGrid/master/css/ui.jqgrid.css">
<script src="https://rawgit.com/free-jqgrid/jqGrid/master/js/i18n/grid.locale-de.js"></script>
<script src="https://rawgit.com/free-jqgrid/jqGrid/master/js/jquery.jqgrid.src.js"></script>
```
All other language files and plugins are avalable from CDN too. See [the wiki article](https://github.com/free-jqgrid/jqGrid/wiki/Access-free-jqGrid-from-different-CDNs) for more details about the usage of free jqGrid from CDNs and RawGit.

The package is published on [WebJars](http://www.webjars.org/) and it's deployed on [Maven Central]((http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22free-jqgrid%22)) too.

Remark: the above URLs will be available **after publishing** the release of the version of 4.11.0

### Main new features and improvements implemented in the version 4.11.0.

* Remove old plugins from free jqGrid (`grid.addons.js`, `grid.postext.js`, `grid.setcolumns.js`, `jquery.tablednd.js`, `jquery.searchfilter.js`, `searchfilter.css`).
* Add `@license` to the comment of plugins and locale files to hold the information on minimizing.
* Including version number of free jqGrid as the comment in `ui.jqgrid.css` file.
* Use `grunt` instead of `gradle` for building free jqGrid. Minimize css using .map file. Update all .min and .map.
* Add `"u1000"` date format in addition to existing `"u"` format. See [the answer](http://stackoverflow.com/a/33652984/315935) for more details.
* Add support of `editable: "hidden"` property in inline editing. It can be used to send the content of non-editable column to the server during row editing.
* Changes of CSS settings of TreeGrid icons. Many changes in the structure of grouping header.
* New `hasMultiselectCheckBox` callback allows to remove multiselect checkbox from some rows.
* Allow to use HTML5 specific values of `type` attribute of `<input>` element created during editing (`number`, `range` and so on). New option `skipPostTypes: ["image", "file"]` allows to minimize side effects of the changes.
* Changing encoding of data during inline and form editing. No HTML encoding will be used by default if `autoencode: true` option is used. It's important for sending correct (non-encoded) JSON data and still use `autoencode: true` to *display* the information in the grid. New `autoEncodeOnEdit: true` option can be used to simulate the old behavior. The option is important for better compatibility with previous versions of jqGrid.
* `url` of inline editing, cell editing and form editing (inclusive deleting) can be defined now as function. `mtype` can be function too for inline and form editing methods.

### The below is the full list of changes in the version 4.11.0 compared with 4.10.0

* Add support of array values for `summaryTpl` and `summaryType`
* Bug fix (in case of `toTop:true`, and `overlay:close`)
* Improve validation of input parameters of `editCell`
* Improve a little the performance by usage of `.first()` instead of `.filter(":first")`
* Bug fix in processing of editOptions option of `formatter: "actions"`
* Bug fix in `destroyFilterToolbar`.
* Bug fix in `setGridWidth` in case of usage one call for multiple grids
* Remove old plugins from free jqGrid (`grid.addons.js`, `grid.postext.js`, `grid.setcolumns.js`, `jquery.tablednd.js`, `jquery.searchfilter.js`, `searchfilter.css`).
* Bug fix: checkboxes should be not checked on false return of beforeSelectRow
* Fix reloading of the grid with grouping which have `loadonce:true` option
* Add `"u1000"` date format in addition to existing `"u"` format. See [the answer](http://stackoverflow.com/a/33652984/315935) for more details.
* Add `@license` to the comment of plugins and locale files to hold the information on minimizing.
* Use `grunt` instead of `gradle` for building free jqGrid. Minimize css using .map file. Update all .min and .map.
* Add support of `editable: "hidden"` property in inline editing. It can be used to send the content of non-editable column to the server during row editing.
* Small selector optimization. The usage of `.filter(":hidden")` in `grid.grouping.js` module
* Fix the number of empty `<td>` in `<htable>`. It improves the compatibility to HTML standards
* Small optimization of `ui.jqgrid.css`
* Changes of CSS settings of TreeGrid icons.
* Many changes in the structure of grouping header.
* Including version number of free jqGrid as the comment in `ui.jqgrid.css` file.
* New `hasMultiselectCheckBox` callback allows to remove multiselect checkbox from some rows
* Bug fix in call of `buildSummaryTd`, use `jqGridShowHideCol`
* Changing encoding of data during inline and form editing. No HTML encoding will be used by default if `autoencode: true` option is used. It's important for sending correct (non-encoded) JSON data and still use `autoencode: true` to *display* the information in the grid. New `autoEncodeOnEdit: true` option can be used to simulate the old behavior. The option is important for better compatibility with previous versions of jqGrid.
* Small fix of the width of the grid. Mostly relevant for Chrome
* Small fixes in `title` which will be set inside of `setRowData` method.
* Move some multiselect-checkbox settings from JS to CSS. Less inline styles.
* Bugfix in `hideModal` in case of call for already descroyed modal dialog
* `url` of inline editing, cell editing and form editing (inclusive deleting) can be defined now as function. `mtype` can be function too for inline and form editing methods.

Other readmes contains the list of the features and bug fixed implemented before:

* [README4.10.0.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.10.0.md) contains the readme of free jqGrid 4.10.0.
* [README492.md](https://github.com/free-jqgrid/jqGrid/blob/master/README492.md) contains the readme of free jqGrid 4.9.2.
* [README491.md](https://github.com/free-jqgrid/jqGrid/blob/master/README491.md) contains the readme of free jqGrid 4.9.1.
* [README49.md](https://github.com/free-jqgrid/jqGrid/blob/master/README49.md) contains the readme of free jqGrid 4.9.
* [README48.md](https://github.com/free-jqgrid/jqGrid/blob/master/README48.md) contains the readme of free jqGrid 4.8.

**Many thanks to all, who sent bug reports and suggestions to improve free jqGrid!**
