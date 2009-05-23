;(function($){
/**
 * jqGrid Turkish Translation
 * H.İbrahim Yılmaz ibrahim.yilmaz@karmabilisim.net
 * http://www.arkeoloji.web.tr
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
**/
$.jgrid = {
	defaults : {
		recordtext: "Satır(lar)",
		loadtext: "Yükleniyor...",
		pgtext : "/"
	},
	search : {
	    caption: "Arama...",
	    Find: "Bul",
	    Reset: "Temizle",
	    odata : ['eşittir', 'eşit değildir', 'küçük', 'küçük veya eşit','büyük','büyük veya eşit', 'ile başlayan','ile biten','içeren' ]
	},
	edit : {
	    addCaption: "Kayıt Ekle",
	    editCaption: "Kayıt Düzenle",
	    bSubmit: "Gönder",
	    bCancel: "İptal",
		bClose: "Kapat",
	    processData: "İşlem yapılıyor...",
	    msg: {
	        required:"Alan gerekli",
	        number:"Lütfen bir numara giriniz",
	        minValue:"girilen değer daha büyük ya da buna eşit olmalıdır",
	        maxValue:"girilen değer daha küçük ya da buna eşit olmalıdır",
	        email: "geçerli bir e-posta adresi değildir",
	        integer: "Lütfen bir tamsayı giriniz",
			date: "Please, enter valid date value"
	    }
	},
	del : {
	    caption: "Sil",
	    msg: "Seçilen kayıtlar silinsin mi?",
	    bSubmit: "Sil",
	    bCancel: "İptal",
	    processData: "İşlem yapılıyor..."
	},
	nav : {
		edittext: " ",
	    edittitle: "Seçili satırı düzenle",
		addtext:" ",
	    addtitle: "Yeni satır ekle",
	    deltext: " ",
	    deltitle: "Seçili satırı sil",
	    searchtext: " ",
	    searchtitle: "Kayıtları bul",
	    refreshtext: "",
	    refreshtitle: "Tabloyu yenile",
	    alertcap: "Uyarı",
	    alerttext: "Lütfen bir satır seçiniz"
	},
	col : {
	    caption: "Sütunları göster/gizle",
	    bSubmit: "Gönder",
	    bCancel: "İptal"	
	},
	errors : {
		errcap : "Hata",
		nourl : "Bir url yapılandırılmamış",
		norecords: "İşlem yapılacak bir kayıt yok",
	    model : "Length of colNames <> colModel!"
	},
	formatter : {
		integer : {thousandsSeparator: " ", defaulValue: 0},
		number : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, defaulValue: 0},
		currency : {decimalSeparator:".", thousandsSeparator: " ", decimalPlaces: 2, prefix: "", suffix:"", defaulValue: 0},
		date : {
			dayNames:   [
				"Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat",
				"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
			],
			monthNames: [
				"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
				"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
			],
			AmPm : ["am","pm","AM","PM"],
			S: function (j) {return j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th'},
			srcformat: 'Y-m-d',
			newformat: 'd/m/Y',
			masks : {
	            ISO8601Long:"Y-m-d H:i:s",
	            ISO8601Short:"Y-m-d",
	            ShortDate: "n/j/Y",
	            LongDate: "l, F d, Y",
	            FullDateTime: "l, F d, Y g:i:s A",
	            MonthDay: "F d",
	            ShortTime: "g:i A",
	            LongTime: "g:i:s A",
	            SortableDateTime: "Y-m-d\\TH:i:s",
	            UniversalSortableDateTime: "Y-m-d H:i:sO",
	            YearMonth: "F, Y"
	        },
	        reformatAfterEdit : false
		},
		baseLinkUrl: '',
		showAction: '',
	    target: '',
	    checkbox : {disabled:true},
		idName : 'id'
	}
};
})(jQuery);
