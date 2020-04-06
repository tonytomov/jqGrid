/**
*
* @license Guriddo jqGrid JS - v5.4.0 
* Copyright(c) 2008, Tony Tomov, tony@trirand.com
* 
* License: http://guriddo.net/?page_id=103334
*/
!function(a){"use strict";"function"==typeof define&&define.amd?define(["jquery","./grid.base","./jquery.fmatter","./grid.utils"],a):a(jQuery)}(function(a){"use strict";a.jgrid=a.jgrid||{},a.extend(a.jgrid,{formatCell:function(b,c,d,e,f,g){var h;if(void 0!==e.formatter){var i={rowId:"",colModel:e,gid:f.p.id,pos:c,styleUI:"",isExported:!0,exporttype:g};h=a.isFunction(e.formatter)?e.formatter.call(f,b,i,d):a.fmatter?a.fn.fmatter.call(f,e.formatter,b,i,d):b}else h=b;return h},formatCellCsv:function(a,b){a=null==a?"":String(a);try{a=a.replace(b._regexsep,b.separatorReplace).replace(/\r\n/g,b.replaceNewLine).replace(/\n/g,b.replaceNewLine)}catch(b){a=""}return b.escquote&&(a=a.replace(b._regexquot,b.escquote+b.quote)),-1!==a.indexOf(b.separator)&&-1!==a.indexOf(b.qoute)||(a=b.quote+a+b.quote),a},excelCellPos:function(a){for(var b="A".charCodeAt(0),c="Z".charCodeAt(0),d=c-b+1,e="";a>=0;)e=String.fromCharCode(a%d+b)+e,a=Math.floor(a/d)-1;return e},makeNode:function(b,c,d){var e=b.createElement(c);return d&&(d.attr&&a(e).attr(d.attr),d.children&&a.each(d.children,function(a,b){e.appendChild(b)}),d.hasOwnProperty("text")&&e.appendChild(b.createTextNode(d.text))),e},xmlToZip:function(b,c){var d,e,f,g,h,i,j=this,k=new XMLSerializer,l=-1===k.serializeToString(a.parseXML(a.jgrid.excelStrings["xl/worksheets/sheet1.xml"])).indexOf("xmlns:r"),m=[];a.each(c,function(c,n){if(a.isPlainObject(n))d=b.folder(c),j.xmlToZip(d,n);else{if(l){for(e=n.childNodes[0],f=e.attributes.length-1;f>=0;f--){var o=e.attributes[f].nodeName,p=e.attributes[f].nodeValue;-1!==o.indexOf(":")&&(m.push({name:o,value:p}),e.removeAttribute(o))}for(f=0,g=m.length;f<g;f++)h=n.createAttribute(m[f].name.replace(":","_dt_b_namespace_token_")),h.value=m[f].value,e.setAttributeNode(h)}i=k.serializeToString(n),l&&(-1===i.indexOf("<?xml")&&(i='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+i),i=i.replace(/_dt_b_namespace_token_/g,":")),i=i.replace(/<row xmlns="" /g,"<row ").replace(/<cols xmlns="">/g,"<cols>").replace(/<mergeCells xmlns="" /g,"<mergeCells ").replace(/<numFmt xmlns="" /g,"<numFmt ").replace(/<xf xmlns="" /g,"<xf "),b.file(c,i)}})},excelStrings:{"_rels/.rels":'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',"xl/_rels/workbook.xml.rels":'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',"[Content_Types].xml":'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml" /><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" /><Default Extension="jpeg" ContentType="image/jpeg" /><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" /><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" /><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" /></Types>',"xl/workbook.xml":'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="24816"/><workbookPr showInkAnnotation="0" autoCompressPictures="0"/><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="19020" tabRatio="500"/></bookViews><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>',"xl/worksheets/sheet1.xml":'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><sheetData/></worksheet>',"xl/styles.xml":'<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><numFmts count="7"><numFmt numFmtId="164" formatCode="#,##0.00_- [$$-45C]"/><numFmt numFmtId="165" formatCode="&quot;£&quot;#,##0.00"/><numFmt numFmtId="166" formatCode="[$€-2] #,##0.00"/><numFmt numFmtId="167" formatCode="0.0%"/><numFmt numFmtId="168" formatCode="#,##0;(#,##0)"/><numFmt numFmtId="169" formatCode="#,##0.00;(#,##0.00)"/><numFmt numFmtId="170" formatCode="yyyy/mm/dd;@"/></numFmts><fonts count="5" x14ac:knownFonts="1"><font><sz val="11" /><name val="Calibri" /></font><font><sz val="11" /><name val="Calibri" /><color rgb="FFFFFFFF" /></font><font><sz val="11" /><name val="Calibri" /><b /></font><font><sz val="11" /><name val="Calibri" /><i /></font><font><sz val="11" /><name val="Calibri" /><u /></font></fonts><fills count="6"><fill><patternFill patternType="none" /></fill><fill/><fill><patternFill patternType="solid"><fgColor rgb="FFD9D9D9" /><bgColor indexed="64" /></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD99795" /><bgColor indexed="64" /></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="ffc6efce" /><bgColor indexed="64" /></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="ffc6cfef" /><bgColor indexed="64" /></patternFill></fill></fills><borders count="2"><border><left /><right /><top /><bottom /><diagonal /></border><border diagonalUp="false" diagonalDown="false"><left style="thin"><color auto="1" /></left><right style="thin"><color auto="1" /></right><top style="thin"><color auto="1" /></top><bottom style="thin"><color auto="1" /></bottom><diagonal /></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" /></cellStyleXfs><cellXfs count="67"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="left"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="right"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="fill"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment textRotation="90"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment wrapText="1"/></xf><xf numFmtId="9"   fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="166" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="167" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="168" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="169" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="3" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="4" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="1" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="2" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="170" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0" /></cellStyles><dxfs count="0" /><tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4" /></styleSheet>'},excelParsers:[{match:/^\-?\d+\.\d%$/,style:60,fmt:function(a){return a/100}},{match:/^\-?\d+\.?\d*%$/,style:56,fmt:function(a){return a/100}},{match:/^\-?\$[\d,]+.?\d*$/,style:57},{match:/^\-?£[\d,]+.?\d*$/,style:58},{match:/^\-?€[\d,]+.?\d*$/,style:59},{match:/^\-?\d+$/,style:65},{match:/^\-?\d+\.\d{2}$/,style:66},{match:/^\([\d,]+\)$/,style:61,fmt:function(a){return-1*a.replace(/[\(\)]/g,"")}},{match:/^\([\d,]+\.\d{2}\)$/,style:62,fmt:function(a){return-1*a.replace(/[\(\)]/g,"")}},{match:/^\-?[\d,]+$/,style:63},{match:/^\-?[\d,]+\.\d{2}$/,style:64},{match:/^\d{4}\-\d{2}\-\d{2}$/,style:67},{match:/(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi,style:4}]}),a.jgrid.extend({exportToCsv:function(b){b=a.extend(!0,{separator:",",separatorReplace:" ",quote:'"',escquote:'"',newLine:"\r\n",replaceNewLine:" ",includeCaption:!0,includeLabels:!0,includeGroupHeader:!0,includeFooter:!0,fileName:"jqGridExport.csv",mimetype:"text/csv;charset=utf-8",returnAsString:!1,onBeforeExport:null,loadIndicator:!0},b||{});var c="";if(this.each(function(){function d(b,c){function d(a,b,c){var d,e=!1;if(0===b)e=c[a];else{var f=c[a].idx;if(0===f)e=c[a];else for(d=a;d>=0;d--)if(c[d].idx===f-b){e=c[d];break}}return e}function e(b,e,f,g){var h,j,k=d(b,e,f),l=k.cnt,o=new Array(c.collen),p=0;for(j=g;j<n;j++)if(m[j]._excol){var q="{0}";a.each(k.summary,function(){if(this.nm===m[j].name){m[j].summaryTpl&&(q=m[j].summaryTpl),"string"==typeof this.st&&"avg"===this.st.toLowerCase()&&(this.sd&&this.vd?this.v=this.v/this.vd:this.v&&l>0&&(this.v=this.v/l));try{this.groupCount=k.cnt,this.groupIndex=k.dataIndex,this.groupValue=k.value,h=i.formatter("",this.v,j,this)}catch(a){h=this.v}return o[p]=a.jgrid.formatCellCsv(a.jgrid.stripHtml(a.jgrid.template(q,h)),c),!1}}),p++}return o}var f="",g=i.p.groupingView,h=[],l=g.groupField.length,m=i.p.colModel,n=m.length,o=0;a.each(m,function(a,b){var c;for(c=0;c<l;c++)if(g.groupField[c]===b.name){h[c]=a;break}});var p,q,r=a.makeArray(g.groupSummary);if(r.reverse(),"local"===i.p.datatype&&!i.p.loadonce){a(i).jqGrid("groupingSetup");for(var s=a.jgrid.getMethod("groupingPrepare"),t=0;t<k;t++)s.call(a(i),j[t],t)}return a.each(g.groups,function(d,j){o++;try{p=a.isArray(g.formatDisplayField)&&a.isFunction(g.formatDisplayField[j.idx])?g.formatDisplayField[j.idx].call(i,j.displayValue,j.value,i.p.colModel[h[j.idx]],j.idx,g):i.formatter("",j.displayValue,h[j.idx],j.value)}catch(a){p=j.displayValue}var k="";"string"!=typeof(k=a.isFunction(g.groupText[j.idx])?g.groupText[j.idx].call(i,p,j.cnt,j.summary):a.jgrid.template(g.groupText[j.idx],p,j.cnt,j.summary))&&"number"!=typeof k&&(k=p);var n;if(n="header"===g.groupSummaryPos[j.idx]?e(d,0,g.groups,0):new Array(c.collen),n[0]=a.jgrid.formatCellCsv(a.jgrid.stripHtml(k),c),f+=n.join(c.separator)+c.newLine,l-1===j.idx){var s,t,u,v=g.groups[d+1],w=0,x=j.startRow,y=void 0!==v?v.startRow:g.groups[d].startRow+g.groups[d].cnt;for(s=x;s<y&&b[s-w];s++){for(u=b[s-w],q=0,t=0;t<m.length;t++)m[t]._expcol&&(n[q]=a.jgrid.formatCellCsv(a.jgrid.formatCell(a.jgrid.getAccessor(u,m[t].name),t,u,m[t],i,"csv"),c),q++);f+=n.join(c.separator)+c.newLine}if("header"!==g.groupSummaryPos[j.idx]){var z;if(void 0!==v){for(z=0;z<g.groupField.length&&v.dataIndex!==g.groupField[z];z++);o=g.groupField.length-z}for(t=0;t<o;t++)r[t]&&(n=e(d,t,g.groups,0),f+=n.join(c.separator)+c.newLine);o=z}}}),f}b._regexsep=new RegExp(b.separator,"g"),b._regexquot=new RegExp(b.quote,"g");var e,f,g,h,i=this,j=this.addLocalData(!0),k=j.length,l=i.p.colModel,m=l.length,n=i.p.colNames,o=0,p="",q="",r="",s="",t="",u=[];a.isFunction(b.loadIndicator)?b.loadIndicator("show"):b.loadIndicator&&a(i).jqGrid("progressBar",{method:"show",loadtype:i.p.loadui,htmlcontent:a.jgrid.getRegional(i,"defaults.loadtext")});var v,w=[];if(a.each(l,function(c,d){d._expcol=!0,void 0===d.exportcol?d.hidden&&(d._expcol=!1):d._expcol=d.exportcol,"cb"!==d.name&&"rn"!==d.name&&"subgrid"!==d.name||(d._expcol=!1),d._expcol&&(u.push(a.jgrid.formatCellCsv(n[c],b)),w.push(d.name))}),b.includeLabels&&(t=u.join(b.separator)+b.newLine),b.collen=u.length,i.p.grouping){var x=!!i.p.groupingView._locgr;i.p.groupingView._locgr=!1,p+=d(j,b),i.p.groupingView._locgr=x}else for(;o<k;){for(f=j[o],g=[],h=0,e=0;e<m;e++)l[e]._expcol&&(g[h]=a.jgrid.formatCellCsv(a.jgrid.formatCell(a.jgrid.getAccessor(f,l[e].name),e,f,l[e],i,"csv"),b),h++);p+=g.join(b.separator)+b.newLine,o++}if(j=null,g=new Array(b.collen),b.includeCaption&&i.p.caption){for(o=b.collen;--o;)g[o]="";g[0]=a.jgrid.formatCellCsv(i.p.caption,b),q+=g.join(b.separator)+b.newLine}if(b.includeGroupHeader&&i.p.groupHeader&&i.p.groupHeader.length){var y=i.p.groupHeader;for(e=0;e<y.length;e++){var z=y[e].groupHeaders;for(o=0,g=[],v=0;v<w.length;v++){for(g[o]="",h=0;h<z.length;h++)z[h].startColumnName===w[v]&&(g[o]=a.jgrid.formatCellCsv(z[h].titleText,b));o++}r+=g.join(b.separator)+b.newLine}}if(b.includeFooter&&i.p.footerrow){if(a(".ui-jqgrid-ftable",this.sDiv).length){var A=a(i).jqGrid("footerData","get");for(e=0,g=[];e<b.collen;){var B=w[e];A.hasOwnProperty(B)&&g.push(a.jgrid.formatCellCsv(a.jgrid.stripHtml(A[B]),b)),e++}s+=g.join(b.separator)+b.newLine}}c=q+r+t+p+s,a.isFunction(b.loadIndicator)?b.loadIndicator("hide"):b.loadIndicator&&a(i).jqGrid("progressBar",{method:"hide",loadtype:i.p.loadui})}),b.returnAsString)return c;if(-1!==b.mimetype.toUpperCase().indexOf("UTF-8")&&(c="\ufeff"+c),a.isFunction(b.onBeforeExport)&&!(c=b.onBeforeExport(c)))throw"Before export does not return data!";a.jgrid.saveAs(c,b.fileName,{type:b.mimetype})},exportToExcel:function(b){b=a.extend(!0,{includeLabels:!0,includeGroupHeader:!0,includeFooter:!0,fileName:"jqGridExport.xlsx",mimetype:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",maxlength:40,onBeforeExport:null,replaceStr:null,loadIndicator:!0},b||{}),this.each(function(){function c(a){return a.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g,"")}function d(b,c){return a.jgrid.makeNode(n,"c",{attr:b,children:[a.jgrid.makeNode(n,"v",{text:c})]})}function e(b,c){return a.jgrid.makeNode(n,"c",{attr:b,children:[a.jgrid.makeNode(n,"f",{text:c})]})}function f(b,c){return a.jgrid.makeNode(n,"c",{attr:{t:"inlineStr",r:b},children:{row:a.jgrid.makeNode(n,"is",{children:{row:a.jgrid.makeNode(n,"t",{text:c})}})}})}function g(a){var b,c;(b=document.createElement("div")).innerHTML=a;var c=b.firstChild;return"A"===c.nodeName?[c.href,c.text]:"#text"===c.nodeName&&[c.textContent,c.textContent]}function h(b){function c(a,b,c){var d,e=!1;if(0===b)e=c[a];else{var f=c[a].idx;if(0===f)e=c[a];else for(d=a;d>=0;d--)if(c[d].idx===f-b){e=c[d];break}}return e}function d(b,d,f,g){var h,j,l=c(b,d,f),m=l.cnt,n=e(w.header);for(j=g;j<i;j++)if(u[j]._expcol){var o="{0}";a.each(l.summary,function(){if(this.nm===u[j].name){u[j].summaryTpl&&(o=u[j].summaryTpl),"string"==typeof this.st&&"avg"===this.st.toLowerCase()&&(this.sd&&this.vd?this.v=this.v/this.vd:this.v&&m>0&&(this.v=this.v/m));try{this.groupCount=l.cnt,this.groupIndex=l.dataIndex,this.groupValue=l.value,h=k.formatter("",this.v,j,this)}catch(a){h=this.v}return n[this.nm]=a.jgrid.stripHtml(a.jgrid.template(o,h)),!1}})}return n}function e(a){for(var b={},c=0;c<a.length;c++)b[a[c]]="";return b}var f=k.p.groupingView,g=[],h=f.groupField.length,i=u.length,j=0;a.each(u,function(a,b){var c;for(c=0;c<h;c++)if(f.groupField[c]===b.name){g[c]=a;break}});var l,m=a.makeArray(f.groupSummary);if(m.reverse(),"local"===k.p.datatype&&!k.p.loadonce){a(k).jqGrid("groupingSetup");for(var n=a.jgrid.getMethod("groupingPrepare"),o=0;o<w.body.length;o++)n.call(a(k),w.body[o],o)}a.each(f.groups,function(c,i){j++;try{l=a.isArray(f.formatDisplayField)&&a.isFunction(f.formatDisplayField[i.idx])?f.formatDisplayField[i.idx].call(k,i.displayValue,i.value,k.p.colModel[g[i.idx]],i.idx,f):k.formatter("",i.displayValue,g[i.idx],i.value)}catch(a){l=i.displayValue}var n="";"string"!=typeof(n=a.isFunction(f.groupText[i.idx])?f.groupText[i.idx].call(k,l,i.cnt,i.summary):a.jgrid.template(f.groupText[i.idx],l,i.cnt,i.summary))&&"number"!=typeof n&&(n=l);var o;if(o="header"===f.groupSummaryPos[i.idx]?d(c,0,f.groups,0):e(w.header),o[Object.keys(o)[0]]=a.jgrid.stripHtml(new Array(5*i.idx).join(" ")+n),B(o,!0),h-1===i.idx){var p,q,r=f.groups[c+1],s=0,t=i.startRow,u=void 0!==r?r.startRow:f.groups[c].startRow+f.groups[c].cnt;for(p=t;p<u&&b[p-s];p++){var v=b[p-s];B(v,!1)}if("header"!==f.groupSummaryPos[i.idx]){var x;if(void 0!==r){for(x=0;x<f.groupField.length&&r.dataIndex!==f.groupField[x];x++);j=f.groupField.length-x}for(q=0;q<j;q++)m[q]&&(o=d(c,q,f.groups,0),B(o,!0));j=x}}})}var i,j,k=this,l=a.jgrid.excelStrings,m=0,n=a.parseXML(l["xl/worksheets/sheet1.xml"]),o=n.getElementsByTagName("sheetData")[0],p=a.parseXML(l["xl/styles.xml"]),q=p.getElementsByTagName("numFmts")[0],r=a(q.getElementsByTagName("numFmt")),s=p.getElementsByTagName("cellXfs")[0],t={_rels:{".rels":a.parseXML(l["_rels/.rels"])},xl:{_rels:{"workbook.xml.rels":a.parseXML(l["xl/_rels/workbook.xml.rels"])},"workbook.xml":a.parseXML(l["xl/workbook.xml"]),"styles.xml":p,worksheets:{"sheet1.xml":n}},"[Content_Types].xml":a.parseXML(l["[Content_Types].xml"])},u=k.p.colModel,v=0,w={body:k.addLocalData(!0),header:[],footer:[],width:[],map:[],parser:[]},x=function(b){if(a.isEmptyObject(b))b.excel_parsers=!0;else if(b.excel_format&&!b.excel_style){var c=0,d=0;a.each(r,function(b,e){c++,d=Math.max(d,parseInt(a(e).attr("numFmtId"),10))});var e=a.jgrid.makeNode(p,"numFmt",{attr:{numFmtId:d+1,formatCode:b.excel_format}});q.appendChild(e),a(q).attr("count",c+1),c=0,e=a.jgrid.makeNode(p,"xf",{attr:{numFmtId:d+1+"",fontId:"0",fillId:"0",borderId:"0",applyFont:"1",applyFill:"1",applyBorder:"1",xfId:"0",applyNumberFormat:"1"}}),s.appendChild(e),c=parseInt(a(s).attr("count"),10),a(s).attr("count",c+1),b.excel_style=c+1}return b};for(i=0,j=u.length;i<j;i++)u[i]._expcol=!0,void 0===u[i].exportcol?u[i].hidden&&(u[i]._expcol=!1):u[i]._expcol=u[i].exportcol,"cb"!==u[i].name&&"rn"!==u[i].name&&"subgrid"!==u[i].name&&u[i]._expcol&&(w.header[v]=u[i].name,w.width[v]=5,w.map[v]=i,w.parser[i]=x(u[i].hasOwnProperty("exportoptions")?u[i].exportoptions:{}),v++);var y,z,A=a.isFunction(b.replaceStr)?b.replaceStr:c,B=function(c,h){y=m+1,z=a.jgrid.makeNode(n,"row",{attr:{r:y}});for(var i,j=15,l=0;l<w.header.length;l++){var p,q,r=a.jgrid.excelCellPos(l)+""+y,s=a.isArray(c)&&h?k.p.colNames[w.map[l]]:a.jgrid.getAccessor(c,w.header[l]);null==s&&(s=""),h||(s=a.jgrid.formatCell(s,w.map[l],c,u[w.map[l]],k,"excel")),w.width[l]=Math.max(w.width[l],Math.min(parseInt(s.toString().length,10),b.maxlength)),p=null;var t=w.parser[w.map[l]];if(!0!==t.excel_parsers||h)void 0===t.excel_format||void 0===t.excel_style||h||p||(t.replace_format&&(s=t.replace_format(s)),p=d({r:r,s:t.excel_style},s),z.appendChild(p));else for(var v=0,x=a.jgrid.excelParsers.length;v<x;v++){var B=a.jgrid.excelParsers[v];if(s.match&&!s.match(/^0\d+/)&&s.match(B.match)){var C=s;if(s=s.replace(/[^\d\.\-]/g,""),B.fmt&&(s=B.fmt(s)),67===B.style)p=d({t:"d",r:r,s:B.style},s);else if(4===B.style)s=g(C),p=s?e({t:"str",r:r,s:B.style},'HYPERLINK("'+s[0]+'","'+s[1]+'")'):f(r,C);else{if(a.inArray(B.style,["63","64","65","66"])&&s.toString().length>j){i=C.replace?A(C):C,p=f(r,i),z.appendChild(p);break}p=d({r:r,s:B.style},s)}z.appendChild(p);break}}p||(s.match&&(q=s.match(/^-?([1-9]\d+)(\.(\d+))?$/)),"number"==typeof s&&s.toString().length<=j||q&&q[1].length+(q[2]?q[3].length:0)<=j?p=d({t:"n",r:r},s):(i=s.replace?A(s):s,p=f(r,i)),z.appendChild(p))}o.appendChild(z),m++};if(a.isFunction(b.loadIndicator)?b.loadIndicator("show"):b.loadIndicator&&a(k).jqGrid("progressBar",{method:"show",loadtype:k.p.loadui,htmlcontent:a.jgrid.getRegional(k,"defaults.loadtext")}),a("sheets sheet",t.xl["workbook.xml"]).attr("name",b.sheetName),b.includeGroupHeader&&k.p.groupHeader&&k.p.groupHeader.length){var C,D,E=k.p.groupHeader,F=[],G=0;for(D=0;D<E.length;D++){var H=E[D].groupHeaders,I={};for(G++,i=0,i=0;i<w.header.length;i++){C=w.header[i],I[C]="";for(var J=0;J<H.length;J++)if(H[J].startColumnName===C){I[C]=H[J].titleText;var K=a.jgrid.excelCellPos(i)+G,L=a.jgrid.excelCellPos(i+H[J].numberOfColumns-1)+G;F.push({ref:K+":"+L})}}B(I,!0)}a("row c",n).attr("s","2");var M=a.jgrid.makeNode(n,"mergeCells",{attr:{count:F.length}});for(a("worksheet",n).append(M),v=0;v<F.length;v++)M.appendChild(a.jgrid.makeNode(n,"mergeCell",{attr:F[v]}))}if(b.includeLabels&&(B(w.header,!0),a("row:last c",n).attr("s","2")),k.p.grouping){var N=!!k.p.groupingView._locgr;k.p.groupingView._locgr=!1,h(w.body),k.p.groupingView._locgr=N}else for(var O=0,P=w.body.length;O<P;O++)B(w.body[O],!1);if(b.includeFooter||k.p.footerrow){w.footer=a(k).jqGrid("footerData","get");for(v in w.footer)w.footer.hasOwnProperty(v)&&(w.footer[v]=a.jgrid.stripHtml(w.footer[v]));B(w.footer,!0),a("row:last c",n).attr("s","2")}var Q=a.jgrid.makeNode(n,"cols");for(a("worksheet",n).prepend(Q),v=0,j=w.width.length;v<j;v++)Q.appendChild(a.jgrid.makeNode(n,"col",{attr:{min:v+1,max:v+1,width:w.width[v],customWidth:1}}));a.isFunction(b.onBeforeExport)&&b.onBeforeExport(t,m),w=null;try{var R=new JSZip,S={type:"blob",mimeType:b.mimetype};a.jgrid.xmlToZip(R,t),R.generateAsync?R.generateAsync(S).then(function(c){a.jgrid.saveAs(c,b.fileName,{type:b.mimetype})}):a.jgrid.saveAs(R.generate(S),b.fileName,{type:b.mimetype})}catch(a){throw a}finally{a.isFunction(b.loadIndicator)?b.loadIndicator("hide"):b.loadIndicator&&a(k).jqGrid("progressBar",{method:"hide",loadtype:k.p.loadui})}})},exportToPdf:function(b){return b=a.extend(!0,{title:null,orientation:"portrait",pageSize:"A4",description:null,onBeforeExport:null,download:"download",includeLabels:!0,includeGroupHeader:!0,includeFooter:!0,fileName:"jqGridExport.pdf",mimetype:"application/pdf",loadIndicator:!0},b||{}),this.each(function(){function c(b){function c(b,c){for(var d=0,e=[],f=0;f<l.length;f++)j={text:null==b[l[f]]?"":c?a.jgrid.formatCell(b[l[f]]+"",n[d],k[m],r[n[d]],g,"pdf"):b[l[f]],alignment:q[f],style:"tableBody"},e.push(j),d++;return e}function d(a,b,c){var d,e=!1;if(0===b)e=c[a];else{var f=c[a].idx;if(0===f)e=c[a];else for(d=a;d>=0;d--)if(c[d].idx===f-b){e=c[d];break}}return e}function e(b,c,e,h){var i,j,k=d(b,c,e),m=k.cnt,n=f(l);for(j=h;j<s;j++)if(r[j]._expcol){var o="{0}";a.each(k.summary,function(){if(this.nm===r[j].name){r[j].summaryTpl&&(o=r[j].summaryTpl),"string"==typeof this.st&&"avg"===this.st.toLowerCase()&&(this.sd&&this.vd?this.v=this.v/this.vd:this.v&&m>0&&(this.v=this.v/m));try{this.groupCount=k.cnt,this.groupIndex=k.dataIndex,this.groupValue=k.value,i=g.formatter("",this.v,j,this)}catch(a){i=this.v}return n[this.nm]=a.jgrid.stripHtml(a.jgrid.template(o,i)),!1}})}return n}function f(a){for(var b={},c=0;c<a.length;c++)b[a[c]]="";return b}var i=g.p.groupingView,o=[],p=i.groupField.length,r=g.p.colModel,s=r.length,t=0;a.each(r,function(a,b){var c;for(c=0;c<p;c++)if(i.groupField[c]===b.name){o[c]=a;break}});var u,v=a.makeArray(i.groupSummary);if(v.reverse(),"local"===g.p.datatype&&!g.p.loadonce){a(g).jqGrid("groupingSetup");for(var w=a.jgrid.getMethod("groupingPrepare"),x=0;x<k.length;x++)w.call(a(g),k[x],x)}a.each(i.groups,function(d,j){t++;try{u=a.isArray(i.formatDisplayField)&&a.isFunction(i.formatDisplayField[j.idx])?i.formatDisplayField[j.idx].call(g,j.displayValue,j.value,g.p.colModel[o[j.idx]],j.idx,i):g.formatter("",j.displayValue,o[j.idx],j.value)}catch(a){u=j.displayValue}var k="";"string"!=typeof(k=a.isFunction(i.groupText[j.idx])?i.groupText[j.idx].call(g,u,j.cnt,j.summary):a.jgrid.template(i.groupText[j.idx],u,j.cnt,j.summary))&&"number"!=typeof k&&(k=u);var m;if(m="header"===i.groupSummaryPos[j.idx]?e(d,0,i.groups,0):f(l),m[Object.keys(m)[0]]=a.jgrid.stripHtml(new Array(5*j.idx).join(" ")+k),h.push(c(m,!1)),p-1===j.idx){var n,q,r=i.groups[d+1],s=0,w=j.startRow,x=void 0!==r?r.startRow:i.groups[d].startRow+i.groups[d].cnt;for(n=w;n<x&&b[n-s];n++){var y=b[n-s];h.push(c(y,!0))}if("header"!==i.groupSummaryPos[j.idx]){var z;if(void 0!==r){for(z=0;z<i.groupField.length&&r.dataIndex!==i.groupField[z];z++);t=i.groupField.length-z}for(q=0;q<t;q++)v[q]&&(m=e(d,q,i.groups,0),h.push(c(m,!1)));t=z}}})}var d,e,f,g=this,h=[],i=g.p.colModel,j={},k=g.addLocalData(!0),l=[],m=0,n=[],o=[],p=[],q={};a.isFunction(b.loadIndicator)?b.loadIndicator("show"):b.loadIndicator&&a(g).jqGrid("progressBar",{method:"show",loadtype:g.p.loadui,htmlcontent:a.jgrid.getRegional(g,"defaults.loadtext")});var r;for(d=0,e=i.length;d<e;d++)i[d]._expcol=!0,void 0===i[d].exportcol?i[d].hidden&&(i[d]._expcol=!1):i[d]._expcol=i[d].exportcol,"cb"!==i[d].name&&"rn"!==i[d].name&&"subgrid"!==i[d].name&&i[d]._expcol&&(j={text:g.p.colNames[d],style:"tableHeader"},o.push(j),l[m]=i[d].name,n[m]=d,p.push(i[d].width),q[i[d].name]=i[d].align||"left",m++);var s;if(b.includeGroupHeader&&g.p.groupHeader&&g.p.groupHeader.length)for(s=g.p.groupHeader,m=0;m<s.length;m++){var t=[],u=s[m].groupHeaders;for(f=0;f<l.length;f++){for(j={text:"",style:"tableHeader"},r=0;r<u.length;r++)u[r].startColumnName===l[f]&&(j={text:u[r].titleText,colSpan:u[r].numberOfColumns,style:"tableHeader"});t.push(j),d++}h.push(t)}if(b.includeLabels&&h.push(o),g.p.grouping){var v=!!g.p.groupingView._locgr;g.p.groupingView._locgr=!1,c(k),g.p.groupingView._locgr=v}else{var w;for(m=0,e=k.length;m<e;m++){for(r=0,o=[],w=k[m],f=0;f<l.length;f++)j={text:null==w[l[f]]?"":a.jgrid.formatCell(a.jgrid.getAccessor(w,l[f])+"",n[r],k[m],i[n[r]],g,"pdf"),alignment:q[l[f]],style:"tableBody"},o.push(j),r++;h.push(o)}}if(b.includeFooter&&g.p.footerrow){var x=a(g).jqGrid("footerData","get");for(o=[],f=0;f<l.length;f++)j={text:a.jgrid.stripHtml(a.jgrid.getAccessor(x,l[f])),style:"tableFooter",alignment:q[l[f]]},o.push(j);h.push(o)}var y={pageSize:b.pageSize,
pageOrientation:b.orientation,content:[{style:"tableExample",widths:p,table:{headerRows:null!=s?0:1,body:h}}],styles:{tableHeader:{bold:!0,fontSize:11,color:"#2e6e9e",fillColor:"#dfeffc",alignment:"center"},tableBody:{fontSize:10},tableFooter:{bold:!0,fontSize:11,color:"#2e6e9e",fillColor:"#dfeffc"},title:{alignment:"center",fontSize:15},description:{}},defaultStyle:{fontSize:10}};b.description&&y.content.unshift({text:b.description,style:"description",margin:[0,0,0,12]}),b.title&&y.content.unshift({text:b.title,style:"title",margin:[0,0,0,12]}),a.isFunction(b.onBeforeExport)&&b.onBeforeExport.call(g,y);try{var z=pdfMake.createPdf(y);z.getDataUrl(function(c){a.isFunction(b.loadIndicator)?b.loadIndicator("hide"):b.loadIndicator&&a(g).jqGrid("progressBar",{method:"hide",loadtype:g.p.loadui})}),"open"===b.download?z.open():z.getBuffer(function(c){a.jgrid.saveAs(c,b.fileName,{type:b.mimetype})})}catch(a){throw a}})},exportToHtml:function(b){b=a.extend(!0,{title:"",onBeforeExport:null,includeLabels:!0,includeGroupHeader:!0,includeFooter:!0,tableClass:"jqgridprint",autoPrint:!1,topText:"",bottomText:"",returnAsString:!1,loadIndicator:!0},b||{});var c;return this.each(function(){function d(b){function c(a,b,c){var d,e=!1;if(0===b)e=c[a];else{var f=c[a].idx;if(0===f)e=c[a];else for(d=a;d>=0;d--)if(c[d].idx===f-b){e=c[d];break}}return e}function d(b,d,f,i){var k,m,n=c(b,d,f),o=n.cnt,p=e(j.header);for(m=i;m<l;m++)if(h[m]._expcol){var q="{0}";a.each(n.summary,function(){if(this.nm===h[m].name){h[m].summaryTpl&&(q=h[m].summaryTpl),"string"==typeof this.st&&"avg"===this.st.toLowerCase()&&(this.sd&&this.vd?this.v=this.v/this.vd:this.v&&o>0&&(this.v=this.v/o));try{this.groupCount=n.cnt,this.groupIndex=n.dataIndex,this.groupValue=n.value,k=g.formatter("",this.v,m,this)}catch(a){k=this.v}return p[this.nm]=a.jgrid.stripHtml(a.jgrid.template(q,k)),!1}})}return p}function e(a){for(var b={},c=0;c<a.length;c++)b[a[c]]="";return b}var f=g.p.groupingView,i=[],k=f.groupField.length,l=h.length,m=0,n="";a.each(h,function(a,b){var c;for(c=0;c<k;c++)if(f.groupField[c]===b.name){i[c]=a;break}});var p,q=a.makeArray(f.groupSummary);if(q.reverse(),"local"===g.p.datatype&&!g.p.loadonce){a(g).jqGrid("groupingSetup");for(var r=a.jgrid.getMethod("groupingPrepare"),s=0;s<j.body.length;s++)r.call(a(g),j.body[s],s)}return a.each(f.groups,function(c,h){m++;try{p=a.isArray(f.formatDisplayField)&&a.isFunction(f.formatDisplayField[h.idx])?f.formatDisplayField[h.idx].call(g,h.displayValue,h.value,g.p.colModel[i[h.idx]],h.idx,f):g.formatter("",h.displayValue,i[h.idx],h.value)}catch(a){p=h.displayValue}var l="";"string"!=typeof(l=a.isFunction(f.groupText[h.idx])?f.groupText[h.idx].call(g,p,h.cnt,h.summary):a.jgrid.template(f.groupText[h.idx],p,h.cnt,h.summary))&&"number"!=typeof l&&(l=p);var r,s=!1;if("header"===f.groupSummaryPos[h.idx]?r=d(c,0,f.groups,0):(r=e(j.header),s=!0),r[Object.keys(r)[0]]=new Array(5*h.idx).join(" ")+l,n+=o(r,"td",!1,1===m,s),k-1===h.idx){var t,u,v=f.groups[c+1],w=0,x=h.startRow,y=void 0!==v?v.startRow:f.groups[c].startRow+f.groups[c].cnt;for(t=x;t<y&&b[t-w];t++){var z=b[t-w];n+=o(z,"td",!1)}if("header"!==f.groupSummaryPos[h.idx]){var A;if(void 0!==v){for(A=0;A<f.groupField.length&&v.dataIndex!==f.groupField[A];A++);m=f.groupField.length-A}for(u=0;u<m;u++)q[u]&&(r=d(c,u,f.groups,0),n+=o(r,"td",!1));m=A}}}),n}var e,f,g=this,h=g.p.colModel,i=0,j={body:g.addLocalData(!0),header:[],footer:[],width:[],map:[],align:[]};for(e=0,f=h.length;e<f;e++)h[e]._expcol=!0,void 0===h[e].exportcol?h[e].hidden&&(h[e]._expcol=!1):h[e]._expcol=h[e].exportcol,"cb"!==h[e].name&&"rn"!==h[e].name&&"subgrid"!==h[e].name&&h[e]._expcol&&(j.header[i]=h[e].name,j.width[i]=h[e].width,j.map[i]=e,j.align[i]=h[e].align||"left",i++);var k=document.createElement("a"),l=function(b){var c=a(b).clone()[0];return"link"===c.nodeName.toLowerCase()&&(c.href=m(c.href)),c.outerHTML},m=function(a){k.href=a;var b=k.host;return-1===b.indexOf("/")&&0!==k.pathname.indexOf("/")&&(b+="/"),k.protocol+"//"+b+k.pathname+k.search},n=function(a,b,c){for(var d,e="<tr>",f=0,h=a.length;f<h;f++)d=!0===c?" style=width:"+j.width[f]+"px;":"",e+="<"+b+d+">"+g.p.colNames[j.map[f]]+"</"+b+">";return e+"</tr>"},o=function(b,c,d,e,f){for(var i,k,l="<tr>",m=0,n=j.header.length;m<n&&(k=f?' colspan= "'+j.header.length+'" style=text-align:left':!0===e?" style=width:"+j.width[m]+"px;text-align:"+j.align[m]+";":" style=text-align:"+j.align[m]+";",i=j.header[m],b.hasOwnProperty(i)&&(l+="<"+c+k+">"+(d?a.jgrid.formatCell(a.jgrid.getAccessor(b,i),j.map[m],b,h[j.map[m]],g,"html"):b[i])+"</"+c+">"),!f);m++);return l+"</tr>"};a.isFunction(b.loadIndicator)?b.loadIndicator("show"):b.loadIndicator&&a(g).jqGrid("progressBar",{method:"show",loadtype:g.p.loadui,htmlcontent:a.jgrid.getRegional(g,"defaults.loadtext")});var p='<table class="'+b.tableClass+'">';if(b.includeLabels&&(p+="<thead>"+n(j.header,"th",!0)+"</thead>"),p+="<tbody>",g.p.grouping){var q=!!g.p.groupingView._locgr;g.p.groupingView._locgr=!1,p+=d(j.body),g.p.groupingView._locgr=q}else for(var i=0,f=j.body.length;i<f;i++)p+=o(j.body[i],"td",!0,0===i);if(b.includeFooter&&g.p.footerrow&&(j.footer=a(g).jqGrid("footerData","get",null,!1),p+=o(j.footer,"td",!1)),p+="</tbody>",p+="</table>",b.returnAsString)c=p;else{var r=window.open("","");r.document.close();var s=b.title?"<title>"+b.title+"</title>":"";a("style, link").each(function(){s+=l(this)});try{r.document.head.innerHTML=s}catch(b){a(r.document.head).html(s)}r.document.body.innerHTML=(b.title?"<h1>"+b.title+"</h1>":"")+"<div>"+(b.topText||"")+"</div>"+p+"<div>"+(b.bottomText||"")+"</div>",a(r.document.body).addClass("html-view"),a("img",r.document.body).each(function(a,b){b.setAttribute("src",m(b.getAttribute("src")))}),b.onBeforeExport&&b.onBeforeExport(r),Boolean(r.chrome)?b.autoPrint&&(r.print(),r.close()):setTimeout(function(){b.autoPrint&&(r.print(),r.close())},1e3)}a.isFunction(b.loadIndicator)?b.loadIndicator("hide"):b.loadIndicator&&a(g).jqGrid("progressBar",{method:"hide",loadtype:g.p.loadui})}),c}})});