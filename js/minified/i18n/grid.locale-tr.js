(e=>{"function"==typeof define&&define.amd?define(["jquery","../grid.base"],e):e(jQuery)})(function(e){e.jgrid=e.jgrid||{},e.jgrid.hasOwnProperty("regional")||(e.jgrid.regional=[]),e.jgrid.regional.tr={defaults:{recordtext:"{0}-{1} listeleniyor. Toplam:{2}",emptyrecords:"Kayıt bulunamadı",loadtext:"Yükleniyor...",pgtext:"{0}/{1}. Sayfa",savetext:"Saving...",pgfirst:"First Page",pglast:"Last Page",pgnext:"Next Page",pgprev:"Previous Page",pgrecs:"Records per Page",showhide:"Toggle Expand Collapse Grid",pagerCaption:"Grid::Page Settings",pageText:"Page:",recordPage:"Records per Page",nomorerecs:"No more records...",scrollPullup:"Pull up to load more...",scrollPulldown:"Pull down to refresh...",scrollRefresh:"Release to refresh...",valT:"checked",valF:"unchecked",selectLine:"Select row",selectAllLines:"Select all rows"},search:{caption:"Arama...",Find:"Bul",Reset:"Temizle",odata:[{oper:"eq",text:"eşit"},{oper:"ne",text:"eşit değil"},{oper:"lt",text:"daha az"},{oper:"le",text:"daha az veya eşit"},{oper:"gt",text:"daha fazla"},{oper:"ge",text:"daha fazla veya eşit"},{oper:"bw",text:"ile başlayan"},{oper:"bn",text:"ile başlamayan"},{oper:"in",text:"içinde"},{oper:"ni",text:"içinde değil"},{oper:"ew",text:"ile biten"},{oper:"en",text:"ile bitmeyen"},{oper:"cn",text:"içeren"},{oper:"nc",text:"içermeyen"},{oper:"nu",text:"is null"},{oper:"nn",text:"is not null"},{oper:"bt",text:"between"}],groupOps:[{op:"VE",text:"tüm"},{op:"VEYA",text:"herhangi"}],operandTitle:"Click to select search operation.",resetTitle:"Reset Search Value",addsubgrup:"Add subgroup",addrule:"Add rule",delgroup:"Delete group",delrule:"Delete rule",Close:"Close",Operand:"Operand : ",Operation:"Oper : ",filterFor:"filter for"},edit:{addCaption:"Kayıt Ekle",editCaption:"Kayıt Düzenle",bSubmit:"Gönder",bCancel:"İptal",bClose:"Kapat",saveData:"Veriler değişti! Kayıt edilsin mi?",bYes:"Evet",bNo:"Hayıt",bExit:"İptal",msg:{required:"Alan gerekli",number:"Lütfen bir numara giriniz",minValue:"girilen değer daha büyük ya da buna eşit olmalıdır",maxValue:"girilen değer daha küçük ya da buna eşit olmalıdır",email:"geçerli bir e-posta adresi değildir",integer:"Lütfen bir tamsayı giriniz",url:"Geçerli bir URL değil. ('http://' or 'https://') ön eki gerekli.",nodefined:" is not defined!",novalue:" return value is required!",customarray:"Custom function should return array!",customfcheck:"Custom function should be present in case of custom checking!"}},view:{caption:"Kayıt Görüntüle",bClose:"Kapat"},del:{caption:"Sil",msg:"Seçilen kayıtlar silinsin mi?",bSubmit:"Sil",bCancel:"İptal"},nav:{edittext:" ",edittitle:"Seçili satırı düzenle",addtext:" ",addtitle:"Yeni satır ekle",deltext:" ",deltitle:"Seçili satırı sil",searchtext:" ",searchtitle:"Kayıtları bul",refreshtext:"",refreshtitle:"Tabloyu yenile",alertcap:"Uyarı",alerttext:"Lütfen bir satır seçiniz",viewtext:"",viewtitle:"Seçilen satırı görüntüle",savetext:"",savetitle:"Save row",canceltext:"",canceltitle:"Cancel row editing",selectcaption:"Actions..."},col:{caption:"Sütunları göster/gizle",bSubmit:"Gönder",bCancel:"İptal"},errors:{errcap:"Hata",nourl:"Bir url yapılandırılmamış",norecords:"İşlem yapılacak bir kayıt yok",model:"colNames uzunluğu <> colModel!"},formatter:{integer:{thousandsSeparator:" ",defaultValue:"0"},number:{decimalSeparator:".",thousandsSeparator:" ",decimalPlaces:2,defaultValue:"0.00"},currency:{decimalSeparator:".",thousandsSeparator:" ",decimalPlaces:2,prefix:"",suffix:"",defaultValue:"0.00"},date:{dayNames:["Paz","Pts","Sal","Çar","Per","Cum","Cts","Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"],monthNames:["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara","Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],AmPm:["am","pm","AM","PM"],S:function(e){return e<11||13<e?["st","nd","rd","th"][Math.min((e-1)%10,3)]:"th"},srcformat:"Y-m-d",newformat:"d/m/Y",parseRe:/[#%\\\/:_;.,\t\s-]/,masks:{ISO8601Long:"Y-m-d H:i:s",ISO8601Short:"Y-m-d",ShortDate:"n/j/Y",LongDate:"l, F d, Y",FullDateTime:"l, F d, Y g:i:s A",MonthDay:"F d",ShortTime:"g:i A",LongTime:"g:i:s A",SortableDateTime:"Y-m-d\\TH:i:s",UniversalSortableDateTime:"Y-m-d H:i:sO",YearMonth:"F, Y"},reformatAfterEdit:!1,userLocalTime:!1},baseLinkUrl:"",showAction:"",target:"",checkbox:{disabled:!0},idName:"id"},colmenu:{sortasc:"Sort Ascending",sortdesc:"Sort Descending",columns:"Columns",filter:"Filter",grouping:"Group By",ungrouping:"Ungroup",searchTitle:"Get items with value that:",freeze:"Freeze",unfreeze:"Unfreeze",reorder:"Move to reorder",hovermenu:"Click for column quick actions"}}});