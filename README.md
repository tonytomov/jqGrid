# free fork of jqGrid
======

jqGrid is a popular jQuery Plugin for displaying and editing data in tabular form. It has some other more sophisticated features, like subgrids, TreeGrids, grouping and so on.

jqGrid was developed mostly by [Tony Tomov](https://github.com/tonytomov) in the past and it was available under MIT/GPL-licences till the version 4.7.0 published Dec 8, 2014 (see [here](https://github.com/tonytomov/jqGrid/tree/v4.7.0)). Short time after that the license agreement was changed (see <a href="https://github.com/tonytomov/jqGrid/commit/1b2cb55c93ee8b279f15a3faf5a2f82a98da3b4c">here</a>) and new 4.7.1 version was <a href="https://github.com/tonytomov/jqGrid/tree/v4.7.1">published</a>.

The code from the GitHib repository is the fork of jqGrid 4.7.0 - the latest version available under MIT/GPL-licences. It will be provided under MIT/GPL-licences.

Below you can find short description of new features already implemented in the fork. The version is developed by [Oleg Kiriljuk](https://github.com/OlegKi), alias [Oleg](http://stackoverflow.com/users/315935/oleg) on the stackoverflow and [OlegK](http://www.trirand.com/blog/?page_id=393) on trirand forum.

Read [Wiki](https://github.com/free-jqgrid/jqGrid/wiki) for more detailed information about the features of free-jqGrid.

Free jqGrid can be used *for free*. You can still donate by sending money via Paypal to oleg.kiriljuk@ok-soft-gmbh.com with the comment "free jqGrid".

### Compatibility with jqGrid 4.7.0

* the default values of some option of jqGrid are changed (see detailed description below). **If you need to use other values as new defaults then you should include the option explicitly as parameters.**
* some changes in "localization files" from `i18n` folder are made. One should used the files included in the fork and not combine old "local files" of jqGrid 4.7.0 with new `jquery.jqGrid.min.js` or `jquery.jqGrid.src.js`.
* the internal method `$.fmatter.util.NumberFormat` is renamed to `$.fmatter.NumberFormat`. You have to make the same renaming if you used *internal* method `$.fmatter.util.NumberFormat` **directly** in your code.
* the internal methods `$.jgrid.createModal` and `$.jgrid.info_dialog` are changed. The methods expect DOM of the grid as `this`. So if you used the methods *directly* in your code you should replace `$.jgrid.info_dialog(...)` to something like `$.jgrid.info_dialog.call($("#grid")[0], ...)`.
* because of changing the structure of the "localization files" from `i18n` folder the access to the strings are changed. If you used any strings from the locale files in your code *directly*, like `$.jgrid.errors.errcap` for example then you should use the code to use `$("#grid").jqGrid("errors.errcap")`. The new method allow to access localized strings, which corresponds to *the current* locale of the grid. If you want to access some specific locale, for example `"de"` then `$.jgrid.errors.errcap` can be accessed now as `$.jgrid.locales.de.errors.errcap`. The same string from the default US-English locale is accessible under `$.jgrid.locales."en-US".errors.errcap`. If you have a lot of code which uses different old localization constants you can use `$.extend(true, $.jgrid, $.jgrid.locales[jgrid.defaults.locale]);` as a temporary solution. We don't recommend to hold the workaround for the long time.

### The following **new features** are implemented currently

* Auto-adjustment of the width on columns based on the content of data in the column and the column headers.
* Redesign of the structure of Navigator Bar of the pagers. Allow wrapping of icons in multiple lines and allow to place texts under the navigator icons.
* Support of other icons as jQuery UI icons. New jqGrid `iconSet` can be used to redefine full set of icons. Currently allowed values of `iconSet` option are "jQueryUI" and "fontAwesome". It's enough to define new set of icons under `$.jgrid.icons` in the same way like "jQueryUI" and "fontAwesome" and use new value of `iconSet` option.

### The default values of the following old jqGrid options are changed (comparing with jqGrid 4.7)

* **height: "auto"** are used now instead of `150` before. It improves the visibility of small grids or the grids having small number of rows. No `scrollOffset: 0` are required to remove unneeded free space which one sees on some grids which have no vertical scrollbar.
* **gridview: true** are used as default with the only exception: `afterInsertRow` callback are defined. The usage of `gridview: true` improves performance of rendering of the grid. In case of usage `afterInsertRow` in old projects instead of much more effective `cellattr`, `rowattr` or custom formatters one will have backward compatibility.
* *dynamic* default value is used now for `rowNum`. The default value `rowNum: 20` will be changed to 10000 (the value of the new `maxRowNum` property) if no pager exists in jqGrid (no `pager` and `toppager: true` option are used) or if one uses jqGrid option which switches off the pagination (like `treeGrid: true`). New jqGrid option `maxRowNum` can be used to change the maximal value of rows displayed in the grid from 10000 default to another value. By the way jqGrid allow now to specify `rowNum: 0` or `rowNum: 0`. In the case jqGrid replace the `rowNum` value to `maxRowNum` during initialization of the grid.
* *dynamic* default value is used now for `datatype`. If one uses input option `data` or if one don't specified any `url` option, then undefined `datatype` will be initialized to `"local"`. If one uses no `data` option and specifies `url` option then one initializes `datatype` to `"json"` if the input option `jsonReader` are used. In case of usage any other combinations of input parameters the option `datatype` will be set to **"xml"** to stay mostly compatible to jqGrid 4.7.0 and older.
* **editurl: "clientArray"** are use now instead of **editurl: null** used before. It allows to use *local* editing without minimal additional efforts and the requirement to have any server part implemented.
* **cellsubmit: "clientArray"** are use now instead of **cellsubmit: "remote"** used before.

The most the changes corresponds the tendency of web development last years. Local JavaScript data and JSON data loaded from the server (especially in combination with `loadonce: true`) are used now much more frequently. The data will be more and more quickly processed by web browsers espessially the data which are not placed on the HTML page as DOM elements. Thus free jqGrid improves support of local data source and it will continue to do this in the next versions.

### The following *new features* are implemented (comparing with jqGrid 4.7)

* support of **auto-adjustment of the column width based on the content of data in the column and the content of the column header**. To use the feature one should specify `autoResizable: true` property in the column (one can use `cmTemplate: {autoResizable: true}` to set the property for all columns). After that the usage of **double-click in the resizer** (in the column header close to vertical line between columns) the width of the column will be adjusted. One can use `autoresizeOnLoad: true` jqGrid option to auto-resize *all columns* having `autoResizable: true` property directly after loading/sorting/paging of the grid. **LIMITATION: Some values of `text-overflow` CSS style defined on `<td>` could break auto-resizing functionality. For example the usage of `.ui-jqgrid tr.jqgrow td { text-overflow:ellipsis }` will break auto-resizing.
* one can specify the alignment of the column headers. See below the description of `labelAlign` and `labelClasses` properties of `colModel`.
* CSS of jqGrid is changed to simplify integration of jqGrid in projects which uses frameworks other as jQuery UI, for example Bootstrap.
* `jsonmap` property of `colModel` can be used now with `datatype: "local"`. The only exception is the existence of non-empty `dataTypeOrg` jqGrid option. The option will be set *automatically* after loading the data from the server and changing `datatype: "json"` and `datatype: "xml"` to `datatype: "local"`. The option allows to use `jsonmap` property for the data loading from the server and skip the property in later processing of the local data.	
* `.trigger("reloadGrid")` has now additional option `fromServer: true` which allows to reload the data from the server in case of `loadonce: true` scenario.
* including of English localization file `grid.locale-en.js` is not more required for successful working of jqGrid.
* new `formatter: "checkboxFontAwesome4"` (in `plugins/jQuery.jqGrid.checkboxFontAwesome4.js`) and the method `initFontAwesome` (in `plugins/jQuery.jqGrid.fontAwesome4.css` and `plugins/jQuery.jqGrid.fontAwesome4.js`).

### The following *new jqGrid options* are implemented (comparing with jqGrid 4.7)

* new `lastSelectedData` option with sorted and filtered `data` can be used. See [the old answer](http://stackoverflow.com/a/9831125/315935) for details. No "subclassing" of internal `$.jgrid.from` method are required more. The name of the internal option `lastSelected` are changed to `lastSelectedData`.
* new `widthOrg` option saves the value of `width` during creating of the grid. It will be used internally mostly to detect the case when jqGrid was created without specifying of any `width` explicitly. It will be interpreted so, that the width of the grid could be adjusted on other changes of the width of the columns.
* new `dataTypeOrg` option will be used internally in case of the usage remote `datatype` (`"json"` and `"xml"`) together with `loadonce: true`. The option will be deleted by `.trigger("reloadGrid")`.
* new `doubleClickSensitivity` option with the default value `250` specify the time in ms. The resizer will stay visible at least the time after the first click. In the time the user can makes the second click and the double-click on the resizer could be detect.
* new `autoresizeOnLoad` option used in combination with `autoResizable: true` property of `colModel`. If `autoresizeOnLoad: true` option are used then jqGrid make auto-resizing of all columns having `autoResizable: true` property direct after `loadComplete`. REMARK: Auto-resizing of hidden grids not work. So if you for example fill the grid on the hidden jQuery UI Tab for example then you can include the call of `autoResizeAllColumns` method directly after the tab will be active.
* new `autoResizing` option is map of properties like `groupingView` used in grouping. It allows to tune some behaviour of auto-resizing.
  * compact - default value `false`. Means the usage of compact calculation of the width of the column header without reservation of the place of sorting icons
  * widthOfVisiblePartOfSortIcon: default value 12. Should be used only if one replaces the default jQuery UI icons to another icons.
  * minColWidth: 33 - minimal width of column after resizing
  * maxColWidth: 300 - maximal width of column after resizing
  * wrapperClassName: "ui-jqgrid-cell-wrapper" - the name of the class assign to `<span>` included in every cell of the grid
  * adjustGridWidth: true - means that the width of the grid need be adjusted after resizing of the column
  * fixWidthOnShrink: false - fill be removed later. It will be not included in the release
* new `singleSelectClickMode` option with default value `"toggle"`. It allows to control deselection of previously selected row on clicking on the row. Default behaviour now is toggle of selection. The have old behavior one need to specify any other value for `singleSelectClickMode` option, for example `singleSelectClickMode: "selectonly"` or `singleSelectClickMode: ""`. It's important to stress, that the behaviour of `setSelection` method is **not changed**. Multiple calls of `setSelection` will **not deselect** the row.

### The following *new `colModel` properties* are implemented (comparing with jqGrid 4.7)

* one can use `template: "integer"`, `template: "number"`, `template: "actions"` in `colModel` to simplify the usage of `formatter: "integer"`, `formatter: "number"` and `formatter: "actions"` in `colModel`. The list of the standard templates will be extended in the next versions. One can use `$.extend(true, $.jgrid.cmTemplate, { myDataTemplate: {...}}` to define custom column templates which can be used like `template: "myDataTemplate"` in `colModel`. See [the post](http://www.trirand.com/blog/?page_id=393/bugs/bug-in-cmtemplate-new-feature) and [the old answer](http://stackoverflow.com/a/6047856/315935) for more information about column templates.
* `autoResizable` which will be used for auto-adjustment of the column width based on the content of data in the column and the content of the column header
* `autoResizingOption` property is an object like `editoptions`, `searchoptions` or `formatoptions`. It can be used to change some common `autoResizing` grid options to another value which is specific for the column only. The properties of `autoResizingOption`: `minColWidth`, `maxColWidth`, `compact`.
* `labelAlign` property with "left", "center" (default), "right" and "likeData" values, 
* `labelClasses` property allows to add CSS class to the column header.
* `editable` property can be defined as function. It have one parameter as object with properties: `rowid`, `iCol`, `iRow`, `name` (column name), `cm` (column item in `colModel`), `mode` (`"add"` or `"edit"` in case of inline editing, `"cell"` for cell editing and `"addForm"` or `"editForm"` in case of form editing). The callback function can return `true` to make the cell in the column editable. Form editing allows some other strings as return value: `"hidden"`, `"disabled"`, `"readonly"`. The value `"hidden"` means including the information in the form as hidden row. The value will be sent to the server in case of remote editing. The value `"readonly"` means making the text input field readonly. The value `"disabled"` means making data input field (select/checkbox/textarea and other) and the label disabled and readonly.

### The following *new methods* are implemented (comparing with jqGrid 4.7)

* setColWidth - allows to change the width of the column after the grid is created.
* autoResizeColumn - has integer iCol as parameters. It resize the column iCol if it has `autoResizable: true` property. Remark: Auto-resizing don't work with hidden grids.
* autoResizeAllColumns - has integer iCol as parameters. It resize of all columns having `autoResizable: true` property. Remark: Auto-resizing don't work with hidden grids.
* getGridComponent - allows to get different components of jqGrid like "bTable", "hTable", "fTable", "bDiv" and some other. The method will be extended later.

### Changes in existing methods and jqGrid options
* one allows to create the grid from `<table>` element existing on the HTML page even if it has no `id` attribute. jqGrid assign unique id to the `<table>` automatically.
* one can use `pager: true` option of jqGrid. In the case new `<div>` with unique `id` will be generated, placed on the `<body>` and the `pager` option will be modified to id selector of the new `<div>`
* one allows to use `navGrid` skipping of `pager` parameter. `navGrid` will will create the navigator bar on all pagers of the grid (on one or two pagers depend on the values of `pager` and `toppager` option of jqGrid).
* one allows to call `inlineNav` skipping of `pager` parameter. `inlineNav` will will create the navigator bar on all pagers of the grid.
* one allows to call `inlineNav` without previous calling of `navGrid` to create the empty pager.  `inlineNav` will call `navGrid` itself if it's required.
* Method `gridResize` are improved for the case of usage of the jqGrid option `height: "auto"` or `height: "100%"`. It allows only horizontal resizing of such grid. See **FontAwesome4** demo below to see how new version of `gridResize` works.

### The following *new callbacks and jQuery events* are implemented (comparing with jqGrid 4.7)

* `fatalError` - new callback which can be used to change displaying of critical error with respect of another function as default JvaScript function alert. One can use the feature in unit tests for example.
* `resizeDblClick` callback and `jqGridResizeDblClick` event will be called on the double-click on the column resizer. It's important to stress that the callbacks will be called even if no `autoResizable: true` property are defined in `colModel`. It allows to implement some custom action on double-click on the column resizer. Returning `false` or `"stop"` value from `resizeDblClick` callback or `jqGridResizeDblClick` event in case of `autoResizable: true` property set in the column will prevent resizing on the column by calling of `autoResizeColumn`.
* the callback `beforeInitGrid` and the event `jqGridBeforeInitGrid` are added. There will be executed directly at the beginning of creating jqGrid. It allows to make some changes *before* any parts of grid will be created.
* the callback `onShowHideCol` and `onRemapColumns` are added. There correspond `jqGridShowHideCol` and `jqGridRemapColumns` event which already exist in jqGrid 4.7.

### The following **bugs** are fixed

* reading of XML/JSON data having default `repeatitems: true` property in `jsonReader` or `xmlReader` in case of usage `key: true` in some column of the `colModel`.
* many parts of jqGrid are fixed to allow to use special characters like dot in ids.
* deleting of rows which id contains comma character.
* id duplicates in case of usage `inlineNav` for both top pager and bottom pager.
* the bug in data grouping with hiding of parent summary row on hiding of the last subgroup.
* ... 

### Other changes in jqGrid and remarks

* files from `i18n` are changes to UTF-8 format. The texts should be always used as Unicode characters if the corresponding characters are visible. Compare for example [grid.locale-ja.js](https://github.com/OlegKi/jqGrid/blob/master/js/i18n/grid.locale-ja.js) with the corresponding file included in jqGrid 4.7.0 (see [here](https://github.com/tonytomov/jqGrid/blob/v4.7.0/js/i18n/grid.locale-ja.js)).
* some common properties which have no relation to the language are moved from the localization files grid.locale-*.js to grid.base.js module.
* We plan to change default value of `autoencode` from `true` to `false` in the next release of jqGrid. We recommend all to include `autoencode` option explicitly. We remind that `autoencode: false` means that input data (including JSON data loaded from the server or local data loaded from the object) are interpreted as HTML fragments and not as pure data. It can produces some strange side effects if the data contains symbols `&`, `;`, `>` and other used in HTML markup.

### Changes in grid.locale-*.js files

* the files are renamed to corresponds ISO 639-1 or ISO 3166-2 defines abbreviations for languages. The list of changes:
  * grid.locale-cat.js with Catalan translation is renamed into           grid.locale-ca.js (ISO 639-1)
  * grid.locale-mne.js with Montenegrin translation is renamed into       grid.locale-me.js (ISO 3166-2)

### Some demos which demonstrates new features

* [GetFilteredData](http://www.ok-soft-gmbh.com/jqGrid/OK/GetFilteredData.htm) - demonstrates how to use new `lastSelectedData` option which returns, in contrast to `data`, *filtered* and *sorted* data items from all pages of jqGrid. Try to set some filter in the demo, make sorting by some column and set the page size to 2 for example. Click the button above the grid and see the displayed results.
* [jsonmapLocal](http://www.ok-soft-gmbh.com/jqGrid/OK/jsonmapLocal.htm) - demonstrates how to use `jsonmap` with `datatype: "local"`.
* [saveLocally](http://www.ok-soft-gmbh.com/jqGrid/OK/jsonmapLocalEditing.htm) - demonstrates how to use `saveLocally` in addition to `jsonmap` with `datatype: "local"` for implementing custom binding of columns to local data.
* [autoResizing](http://www.ok-soft-gmbh.com/jqGrid/OK/autoresizeOnDoubleClickOnColumnResizer.htm) - demonstrates the default behaviour of auto-resizing feature. Double-click on the column resizer (in the header close to the right border which divides the columns). You will see the default behaviour of column resizing.
* [autoResizingCompact](http://www.ok-soft-gmbh.com/jqGrid/OK/autoresizeOnDoubleClickOnColumnResizer1.htm) - demonstrates the default behaviour of auto-resizing feature. Double-click on the column resizer (in the header close to the right border which divides the columns). You will see the behaviour of column resizing in case of usage `autoResizing: { compact: true }`.
* [autoResizingWithShrinkCompact](http://www.ok-soft-gmbh.com/jqGrid/OK/autoresizeOnDoubleClickOnColumnResizerWithShrink.htm) - modification of the previous demo. It uses no `shrinkToFit: false` option and `width: 518` instead.
* [autoresizeOnLoad](http://www.ok-soft-gmbh.com/jqGrid/OK/autoresizeOnLoad1.htm) - demonstrates auto-resizing on loading. Try to use sorting, paging the grid, and see the results.
* [autoresizeOnLoadCompact](http://www.ok-soft-gmbh.com/jqGrid/OK/autoresizeOnLoad2.htm) - the same demo as before (auto-resizing on loading), but with the usage of `autoResizing: { compact: true }` additionally.
* [autoResizingPerformane1000](http://www.ok-soft-gmbh.com/jqGrid/OK/performane-1000.htm) - the demo create the grid with 1000 rows. By double-click on resizer you can see the performance of resizing for relatively large number of rows.
* [alignLabel](http://www.ok-soft-gmbh.com/jqGrid/OK/alignLabel.htm) - demonstrates the usage of new `labelAlign` and `labelClasses` properties of `colModel`.
* [autoResizingGrouping](http://www.ok-soft-gmbh.com/jqGrid/OK/grouping1.htm) - demonstrates then auto-resizing on loading works with grouping too.
* [autoResizingGroupingRtl](http://www.ok-soft-gmbh.com/jqGrid/OK/groupingRtl1.htm) - the same as the previous demo, but it uses RTL.
* [LocalTreeGrid](http://www.ok-soft-gmbh.com/jqGrid/OK/LocalAdjacencyTree.htm) - TreeGrid filled with local data.
* [FontAwesome4](http://www.ok-soft-gmbh.com/jqGrid/OK/FontAwesome4.htm) - Demo which demonstrate the usage of Font Awesome 4 plugin.

* [navButtons0](http://www.ok-soft-gmbh.com/jqGrid/OK/navButtons0.htm) - demonstrates resizeable navigator bar with icons
* [navButtons1](http://www.ok-soft-gmbh.com/jqGrid/OK/navButtons1.htm) - demonstrates resizeable navigator bar with icons and texts
* [navButtons2](http://www.ok-soft-gmbh.com/jqGrid/OK/navButtons2.htm) - demonstrate new iconsOverText:true option
* [navButtons0-fa4](http://www.ok-soft-gmbh.com/jqGrid/OK/navButtons0-fa4.htm) - demonstrates resizeable navigator bar with icons. It uses Font Awesome 4.
* [navButtons1-fa4](http://www.ok-soft-gmbh.com/jqGrid/OK/navButtons1-fa4.htm) - demonstrates resizeable navigator bar with icons and texts. It uses Font Awesome 4.
* [navButtons2-fa4](http://www.ok-soft-gmbh.com/jqGrid/OK/navButtons2-fa4.htm) - demonstrate new `iconsOverText:true` option. It uses Font Awesome 4.
