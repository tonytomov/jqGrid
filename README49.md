# free fork of jqGrid
======

jqGrid is a popular jQuery Plugin for displaying and editing data in tabular form. It has some other more sophisticated features, like subgrids, TreeGrids, grouping and so on.

jqGrid was developed mostly by [Tony Tomov](https://github.com/tonytomov) in the past and it was available under MIT/GPL-licences till the version 4.7.0 published Dec 8, 2014 (see [here](https://github.com/tonytomov/jqGrid/tree/v4.7.0)). Short time after that the license agreement was changed (see <a href="https://github.com/tonytomov/jqGrid/commit/1b2cb55c93ee8b279f15a3faf5a2f82a98da3b4c">here</a>) and new 4.7.1 version was <a href="https://github.com/tonytomov/jqGrid/tree/v4.7.1">published</a>.

The code from the GitHib repository is the fork of jqGrid 4.7.0 - the latest version available under MIT/GPL-licences. It will be provided under MIT/GPL-licences.

Below you can find short description of new features implemented in free jqGrid 4.9 (compared with version 4.8). The version is developed by [Oleg Kiriljuk](https://github.com/OlegKi), alias [Oleg](http://stackoverflow.com/users/315935/oleg) on the stackoverflow and [OlegK](http://www.trirand.com/blog/?page_id=393) on trirand forum.

Read [Wiki](https://github.com/free-jqgrid/jqGrid/wiki) for more detailed information about the features of free-jqGrid.

Free jqGrid can be used *for free*. You can still donate by sending money via Paypal to oleg.kiriljuk@ok-soft-gmbh.com with the comment "free jqGrid".

One can install the package with respect of [bower](http://bower.io/search/?q=free-jqgrid) by using "bower install free-jqgrid", with respect of [npm](https://www.npmjs.com/package/free-jqgrid) by using "npm install free-jqgrid" or from [NuGet](https://www.nuget.org/packages/free-jqGrid) by using "Install-Package free-jqGrid".

The repository is included on [cdnjs](https://cdnjs.com/libraries/free-jqgrid). So one can include CSS by using
```html
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.9.0/css/ui.jqgrid.css">
```
If you skip `http:` and `https:` prefix in the URL then the prefix of the current page will be used. In the same way you can access JavaScript files by
```html
<script src="//cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.9.0/js/jquery.jqgrid.min.js"></script>
```
or
```html
<script src="//cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.9.0/js/jquery.jqgrid.src.js"></script>
```
All language files are available in `js/i18n` sub-folder and plugins under `plugins` sub-folder. For example
```html
<script src="//cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.9.0/js/i18n/grid.locale-de.js"></script>
```

In the same way free jqGrid can be loaded from jsDelivr CDN too (see [here](http://www.jsdelivr.com/#!free-jqgrid)). 
```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/free-jqgrid/4.9.0/css/ui.jqgrid.css">
<script src="//cdn.jsdelivr.net/free-jqgrid/4.9.0/js/i18n/grid.locale-de.js"></script>
<script src="//cdn.jsdelivr.net/free-jqgrid/4.9.0/js/jquery.jqgrid.min.js"></script>
```

It somebody want to test the *latest* version of free jqGrid one can load it directly from GitHib using [RawGit](http://rawgit.com/) service:
```html
<link rel="stylesheet" href="//rawgit.com/free-jqgrid/jqGrid/master/css/ui.jqgrid.css">
<script src="//rawgit.com/free-jqgrid/jqGrid/master/js/i18n/grid.locale-de.js"></script>
<script src="//rawgit.com/free-jqgrid/jqGrid/master/js/jquery.jqgrid.src.js"></script>
```

Remark: the above URLs will be available *after* publishing the release of the version of 4.9

### The following **main new features** are implemented in the version 4.9

* 99% of jQuery UI classes used in free jqGrid will be get now from `$.jgrid.guiStyles.jQueryUI` in the same way like free jqGrid 4.8 uses the icons from `$.jgrid.icons.jQueryUI` by default. There are exist `guiStyles` option with default value `"jQueryUI"` exactly like there are exist `iconSet` option with default value `"jQueryUI"`. Both `guiStyles` and `iconSet` options defines from which part of `$.jgrid.guiStyles` or `$.jgrid.icons` the icons or classes of common GUI elements of the grid will be used. One can extend `$.jgrid.guiStyles` with another set of elements and to use the name of the set as the value of `guiStyles` parameter. One can replace the default jQuery UI classes to the classes of another CSS framework.
* Internal methods `addXmlData` and `addJSONData` are full rewritten now. There are exist now only one `readInput`. The part of the code is moved in `$.jgrid.parseDataToHtml` which will be used in `addRowData` method too.
* The performance of jqGrid is improved. The performance of reading long XML data is improved. The performance advantage take place only if no `xmlmap` defined or if it's simple like `xmlmap: "nodeName"` or `xmlmap: "[attributeName]"`.
* Performance of jqGrid, TreeGrid, frozen columns, selection of rows, autoResizing (`autoResizeAllColumns`) and some other parts is improved.
* new `additionalProperties` parameter allows to read more properties from input data.
* Formatters supports now `getCellBuilder` property which allows to generates closure used for reading of input data. The reading of data in the loop (filling the grid) could required some relatively expensive initialization steps which can be relatively expansive. The property `getCellBuilder` allows to make the initializations once and to return the short method which can be used in the loop for reading the rows of data. Such approach improves the performance of formatters. All standard formatters have now `getCellBuilder` property.
* TreeGrid is changed in many places. There are exist no more hidden columns `level`, `parent`, `isLeaf`, `expanded`, `loaded`, `icon`. The information will be only saved in `data` parameter of jqGrid. Free jqGrid uses the new `additionalProperties` parameter for all the TreeGrid properties. It improve the performance and reduce the size used web browser.
* Frozen columns can be used now with any editing mode. The width of different rows can be different.
* Pivot module is full rewritten. Some bugs are fixed. jqPivot supports now more new options and the input data could be unsorted. See more information in [the wiki article](https://github.com/free-jqgrid/jqGrid/wiki/jqPivot-in-version-4.9).
* multiselect (`"cb"`), subgrid (`"subgrid"`) and rownumbers (`"rn"`) columns can be placed now **on any position** in the grid. New option `multiselectPosition` with default value `"left"` can be used with `"right"` value to place `"cb"` columns on the right size of jqGrid. One can use new method `remapColumnsByName` to place the column on another position (in the middle of the grid) and it will be still work.
* TreeGrid now supports `multiselect: true` option.
* By specifying any other value of `multiselectPosition` parameter as `"left"` and `"right"`, for example `multiselectPosition: "none"`, the column with checkboxs (`"cb"` column) will not created at all. One can still select multiple lines. The usage of `multiselectPosition: "none"` improve the performance of selection, compared with scenario where one creates `"cb"` column, but hide it.
* Resizing of columns is changed. One can resize the last column of the grid. The color of the resize is changed too. The previous version used `.ui-jqgrid .ui-jqgrid-resize-mark { background-color: #777; }` independent from the jQuery UI theme used. Starting with version 4.9 it will be used the class `$.jgrid.guiStyles.[guiStyleName].resizer`, which is `"ui-widget-header"` for the default guiStyleName `jQueryUI`. Thus the resizer uses the color of the border of the `"ui-widget-header"` class. New `minResizingWidth` parameter (default value 10) specify the minimal width of the column after resizing. The previous versions of jqGrid used fixed value 33px before.
* The new method `$.jgrid.builderSortIcons` is used now for building the sorting icons. One can replace the method to allows to set different icons for different columns. One can for example use different sorting icons for different type of sorting data (texts, numbers, dates and so on).
* The new method `$.jgrid.builderFmButon` is used now for building of modal dialogs. One can use replace the method for advanced customizations of the dialogs without rewriting modules of the form editing.
* The new properties `iColByName` and `iPropByName` can be used now to get the index of column from `colModel` or property from new `additionalProperties` option by name.
* The new method `remapColumnsByName` are introduced. If works in the same way like `remapColumns`, but it uses column names instead of column indexes.
* The methods `getGridRowById` and `getInd` used to access the rows by rowid are improved. 
* The method `bindKeys` is rewritten. The method can be used now with data grouping. See [the answer](http://stackoverflow.com/a/30470114/315935).
* The old jqModal module is changed to allows keyboard input inside of modal dialogs. See the issue https://github.com/free-jqgrid/jqGrid/issues/59 about problems of integration of new select2 plugin in jqGrid searching and editing dialogs.
* The new option of `navGrid` is set by default to `true`. It hides unused parts of the pager and gives more place for navigator icons. It can have some compatibility problem in advanced scenarios (see [the answer](http://stackoverflow.com/a/30687097/315935) as an example). One can use `navOptions: { hideEmptyPagerParts: false }` of jqGrid or set `hideEmptyPagerParts: false` option of `navGrid` in such cases.
* The plugin `grid.odata.js`, developed by Mark Babayev (https://github.com/mirik123, markolog@gmail.com), is updated. It provides `odataGenColModel` and `odataInit` methods allows easy usage of free jqGrid with OData services.
* The new methods `createContexMenuFromNavigatorButtons` and `showHideColumnMenu` are added as plugins `jquery.createcontexmenufromnavigatorbuttons.js` and `jquery.jqgrid.showhidecolumnmenu.js`. There will be moved later in the main code of free jqGrid.
* The formatting of the source code of free jqGrid is changed to improve reading and debugging of the code.

[The document](https://github.com/free-jqgrid/jqGrid/blob/master/README48.md) contains the readme of free jqGrid 4.8.

Many thanks to all, who sent bug reports and suggestions to improve free jqGrid!
