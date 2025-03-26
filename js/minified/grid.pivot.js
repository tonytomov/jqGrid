(e=>{"function"==typeof define&&define.amd?define(["jquery","./grid.base","./grid.grouping"],e):e(jQuery)})(function(J){J.assocArraySize=function(e){var r,t=0;for(r in e)e.hasOwnProperty(r)&&t++;return t},J.jgrid.extend({pivotSetup:function(G,e){var z=[],V=[],q=[],Q=[],B=[],I={grouping:!0,groupingView:{groupField:[],groupSummary:[],groupSummaryPos:[]}},E=[],R=J.extend({rowTotals:!1,rowTotalsText:"Total",colTotals:!1,groupSummary:!0,groupSummaryPos:"header",frozenStaticCols:!1,xMeta:[]},e||{});return this.each(function(){var d,f,p,e,c=this,r=G.length,t=0;function a(e,r,t){e=function(e,r){var t,a,o,n=[];if(!this||"function"!=typeof e||e instanceof RegExp)throw new TypeError;for(o=this.length,t=0;t<o;t++)if(this.hasOwnProperty(t)&&(a=this[t],e.call(r,a,t,this))){n.push(a);break}return n}.call(e,r,t);return 0<e.length?e[0]:null}function o(e,r){var t,a=0,o=!0;for(t in e)if(e.hasOwnProperty(t)){if(e[t]!=this[a]){o=!1;break}if(++a>=this.length)break}return o&&(D=r),o}function n(e,r,t,a){var o,n,i,l,s=r.length,g="",u=[],m=1;for(Array.isArray(t)?(i=t.length,u=t):(i=1,u[0]=t),B=[],n=(Q=[]).root=0;n<i;n++){for(var d,f=[],p=0;p<s;p++){if(l="string"==typeof r[p].aggregator?r[p].aggregator:"cust",null==t)d=o=J.jgrid.trim(r[p].member)+"_"+l,u[0]=r[p].label||l+" "+J.jgrid.trim(r[p].member);else{d=t[n].replace(/\s+/g,"");try{o=1===s?g+d:g+d+"_"+l+"_"+String(p)}catch(e){}u[n]=t[n]}o=isNaN(parseInt(o,10))?o:o+" ","avg"===r[p].aggregator&&(l=-1===D?V.length+"_"+o:D+"_"+o,h[l]?h[l]++:h[l]=1,m=h[l]),a[o]=f[o]=((e,r,t,a,o)=>{var n;if(J.jgrid.isFunction(e))n=e.call(c,r,t,a);else switch(e){case"sum":n=J.jgrid.floatNum(r)+J.jgrid.floatNum(a[t]);break;case"count":""!==r&&null!=r||(r=0),n=a.hasOwnProperty(t)?r+1:0;break;case"min":n=""===r||null==r?J.jgrid.floatNum(a[t]):Math.min(J.jgrid.floatNum(r),J.jgrid.floatNum(a[t]));break;case"max":n=""===r||null==r?J.jgrid.floatNum(a[t]):Math.max(J.jgrid.floatNum(r),J.jgrid.floatNum(a[t]));break;case"avg":n=(J.jgrid.floatNum(r)*(o-1)+J.jgrid.floatNum(a[t]))/o}return n})(r[p].aggregator,a[o],r[p].member,e,m)}g+=t&&null!=t[n]?t[n].replace(/\s+/g,""):"",Q[o]=f,B[o]=u[n]}return a}if(R.rowTotals&&0<R.yDimension.length&&(e=R.yDimension[0].dataName,R.yDimension.splice(0,0,{dataName:e}),R.yDimension[0].converter=function(){return"_r_Totals"}),d=Array.isArray(R.xDimension)?R.xDimension.length:0,f=R.yDimension.length,p=Array.isArray(R.aggregates)?R.aggregates.length:0,0===d||0===p)throw"xDimension or aggregates optiona are not set!";var i,l=[],s=0;for(w=0;w<d;w++)R.xDimension[w].hasOwnProperty("dataName")?(i={name:R.xDimension[w].dataName,frozen:R.frozenStaticCols},null==R.xDimension[w].isGroupField&&(R.xDimension[w].isGroupField=!0),R.xDimension[w].isGroupField&&l.push(R.xDimension[w].dataName),i=J.extend(!0,i,R.xDimension[w]),z.push(i)):s++;d-=s;for(var g,u={},h=[],m=l.length;t<r;){var v=G[t],y=[],x=[],j={},w=0;for(w=0;w<z.length;w++)g=z[w].name,v.hasOwnProperty(g)&&(y.push(J.jgrid.trim(v[g])),j[g]=J.jgrid.trim(v[g]));var b,O=0,D=-1;if(b=a(V,o,y)){if(0<=D){if(O=0,1<=f){for(O=0;O<f;O++)x[O]=J.jgrid.trim(v[R.yDimension[O].dataName]),void 0===x[O]?x[O]=null:R.yDimension[O].converter&&J.jgrid.isFunction(R.yDimension[O].converter)&&(x[O]=R.yDimension[O].converter.call(this,x[O],y,x));b=n(v,R.aggregates,x,b)}else 0===f&&(b=n(v,R.aggregates,null,b));for(w=0;w<R.xMeta.length;w++){var N,P=R.xMeta[w];Object.hasOwn(P,"dataName")&&Object.hasOwn(v,P.dataName)&&(N=Object.hasOwn(P,"separator")?P.separator:", ",b[P.dataName]+=N+v[P.dataName])}V[D]=b}}else{if(O=0,1<=f){for(O=0;O<f;O++)x[O]=J.jgrid.trim(v[R.yDimension[O].dataName]),void 0===x[O]?x[O]=null:R.yDimension[O].converter&&J.jgrid.isFunction(R.yDimension[O].converter)&&(x[O]=R.yDimension[O].converter.call(this,x[O],y,x));j=n(v,R.aggregates,x,j)}else 0===f&&(j=n(v,R.aggregates,null,j));for(w=0;w<R.xMeta.length;w++){var P=R.xMeta[w];Object.hasOwn(P,"dataName")&&Object.hasOwn(v,P.dataName)&&(j[P.dataName]=v[P.dataName]+"")}V.push(j)}var S,T=0,C=null,_=null;for(S in Q)if(Q.hasOwnProperty(S)){if(0===T)C=(u=u.children&&void 0!==u.children?u:{text:S,level:0,children:[],label:S}).children;else{for(_=null,w=0;w<C.length;w++)if(C[w].text===S){_=C[w];break}C=(_||(C.push({children:[],text:S,level:T,fields:Q[S],label:B[S]}),C[C.length-1])).children}T++}t++}var F,h=null,H=[],M=z.length,A=M;if(0<f&&(E[f-1]={useColSpanStyle:!1,groupHeaders:[]}),!function e(r){var t,a,o,n,i;for(o in r)if(r.hasOwnProperty(o)){if("object"!=typeof r[o]){if("level"===o){if(void 0===H[r.level]&&(H[r.level]="",0<r.level)&&-1===r.text.indexOf("_r_Totals")&&(E[r.level-1]={useColSpanStyle:!1,groupHeaders:[]}),H[r.level]!==r.text&&r.children.length&&-1===r.text.indexOf("_r_Totals")&&0<r.level){E[r.level-1].groupHeaders.push({titleText:r.label,numberOfColumns:0});var l=E[r.level-1].groupHeaders.length-1,s=0==l?A:M;if(r.level-1==(R.rowTotals?1:0)&&0<l){for(var g=0,u=0;u<l;u++)g+=E[r.level-1].groupHeaders[u].numberOfColumns;g&&(s=g+d)}z[s]&&(E[r.level-1].groupHeaders[l].startColumnName=z[s].name,E[r.level-1].groupHeaders[l].numberOfColumns=z.length-s),M=z.length}H[r.level]=r.text}if(r.level===f&&"level"===o&&0<f)if(1<p){var m=1;for(t in r.fields)r.fields.hasOwnProperty(t)&&(1===m&&E[f-1].groupHeaders.push({startColumnName:t,numberOfColumns:1,titleText:r.label||r.text}),m++);E[f-1].groupHeaders[E[f-1].groupHeaders.length-1].numberOfColumns=m-1}else E.splice(f-1,1)}if(null!=r[o]&&"object"==typeof r[o]&&e(r[o]),"level"===o&&0<r.level&&(r.level===(0===f?r.level:f)||-1!==H[r.level].indexOf("_r_Totals")))for(t in a=0,r.fields)if(r.fields.hasOwnProperty(t)){for(n in i={},R.aggregates[a])if(R.aggregates[a].hasOwnProperty(n))switch(n){case"member":case"label":case"aggregator":break;default:i[n]=R.aggregates[a][n]}1<p?(i.name=t,i.label=R.aggregates[a].label||r.label):(i.name=r.text,i.label="_r_Totals"===r.text?R.rowTotalsText:r.label),z.push(i),a++}}}(u),R.colTotals)for(var k=V.length;k--;)for(w=d;w<z.length;w++)F=z[w].name,q[F]?q[F]+=J.jgrid.floatNum(V[k][F]):q[F]=J.jgrid.floatNum(V[k][F]);if(0<m){for(w=0;w<m;w++)I.groupingView.groupField.push(l[w]),I.groupingView.groupSummary.push(R.groupSummary),I.groupingView.groupSummaryPos.push(R.groupSummaryPos);I.sortname=l[w]}else I.grouping=!1;I.groupingView.hideFirstGroupCol=!0}),{colModel:z,rows:V,groupOptions:I,groupHeaders:E,summary:q}},jqPivot:function(t,g,u,a){return this.each(function(){var s=this,e=u.regional||"en";function r(e){J.jgrid.isFunction(g.onInitPivot)&&g.onInitPivot.call(s),Array.isArray(e)||(e=[]);var r,t,a,o,n=jQuery(s).jqGrid("pivotSetup",e,g),e=0<J.assocArraySize(n.summary),i=J.jgrid.from.call(s,n.rows);for(g.ignoreCase&&(i=i.ignoreCase()),r=0;r<n.groupOptions.groupingView.groupField.length;r++)t=g.xDimension[r].sortorder||"asc",a=g.xDimension[r].sorttype||"text",i.orderBy(n.groupOptions.groupingView.groupField[r],t,a,"",a);if(o=g.xDimension.length,u.sortname){for(t=u.sortorder||"asc",a="text",r=0;r<o;r++)if(g.xDimension[r].dataName===u.sortname){a=g.xDimension[r].sorttype||"text";break}i.orderBy(u.sortname,t,a,"",a)}else n.groupOptions.sortname&&o&&(t=g.xDimension[o-1].sortorder||"asc",a=g.xDimension[o-1].sorttype||"text",i.orderBy(n.groupOptions.sortname,t,a,"",a));jQuery(s).jqGrid(J.extend(!0,{data:J.extend(i.select(),e?{userdata:n.summary}:{}),datatype:"local",footerrow:e,userDataOnFooter:e,colModel:n.colModel,viewrecords:!0,formatFooterData:!0===g.colTotals,sortname:g.xDimension[0].dataName},n.groupOptions,u||{}));var l=n.groupHeaders;if(l.length)for(r=0;r<l.length;r++)l[r]&&l[r].groupHeaders.length&&jQuery(s).jqGrid("setGroupHeaders",l[r]);g.frozenStaticCols&&jQuery(s).jqGrid("setFrozenColumns"),J.jgrid.isFunction(g.onCompletePivot)&&g.onCompletePivot.call(s),g.loadMsg&&J(".loading_pivot").remove()}void 0===g.loadMsg&&(g.loadMsg=!0),g.loadMsg&&J("<div class='loading_pivot ui-state-default ui-state-active row'>"+J.jgrid.getRegional(s,"regional."+e+".defaults.loadtext")+"</div>").insertBefore(s).show(),"string"==typeof t?J.ajax(J.extend({url:t,dataType:"json",success:function(e){r(J.jgrid.getAccessor(e,a&&a.reader?a.reader:"rows"))}},a||{})):r(t)})}})});