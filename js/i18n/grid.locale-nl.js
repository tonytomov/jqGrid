(function($){
    $.jgrid = {
        defaults:{recordtext:"{0} - {1} van {2}",
            emptyrecords:"Geen records",
            loadtext:"Laden...",
            pgtext:"Pagina {0} van {1}"
        },
        search:{
            caption:"Zoeken...",
            Find:"Zoek",
            Reset:"Herstellen",
            odata:["gelijk aan","niet gelijk aan","minder dan","minder dan of gelijk aan","groter dan","groter dan of gelijk aan","begint met","begint niet met","is in","is niet in","eindigd met","eindigd niet met","bevat","bevat niet"],
            groupOps:[{op:"AND",text:"alles"},{op:"OR",text:"een van de"}],
            matchText:" match",
            rulesText:" regels"
        },
        edit:{
            addCaption:"Add Record",
            editCaption:"Edit Record",
            bSubmit:"Submit",
            bCancel:"Cancel",
            bClose:"Close",
            saveData:"Data has been changed! Save changes?",
            bYes:"Yes",
            bNo:"No",
            bExit:"Cancel",
            msg:{
                required:"Field is required",
                number:"Please, enter valid number",
                minValue:"value must be greater than or equal to ",
                maxValue:"value must be less than or equal to",
                email:"is not a valid e-mail",
                integer:"Please, enter valid integer value",
                date:"Please, enter valid date value",
                url:"is not a valid URL. Prefix required ('http://' or 'https://')"}
            },
            view:{
                caption:"View Record",
                bClose:"Close"
            },
            del:{
                caption:"Delete",
                msg:"Delete selected record(s)?",
                bSubmit:"Delete",
                bCancel:"Cancel"
            },
            nav:{
                edittext:"",
                edittitle:"Edit selected row",
                addtext:"",
                addtitle:"Add new row",
                deltext:"",
                deltitle:"Delete selected row",
                searchtext:"",
                searchtitle:"Find records",
                refreshtext:"",
                refreshtitle:"Reload Grid",
                alertcap:"Warning",
                alerttext:"Please, select row",
                viewtext:"",
                viewtitle:"View selected row"
            },
            col:{
                caption:"Show/Hide Columns",
                bSubmit:"Submit",
                bCancel:"Cancel"
            },
            errors:{
                errcap:"Error",
                nourl:"No url is set",
                norecords:"No records to process",
                model:"Length of colNames <> colModel!"
            },
            formatter:{
                integer:{thousandsSeparator:" ",defaultValue:"0"},
                number:{decimalSeparator:".",thousandsSeparator:" ",decimalPlaces:2,defaultValue:"0.00"},
                currency:{decimalSeparator:".",thousandsSeparator:" ",decimalPlaces:2,prefix:"",suffix:"",defaultValue:"0.00"},
                date:{
                    dayNames:["Sun","Mon","Tue","Wed","Thr","Fri","Sat","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                    monthNames:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","January","February","March","April","May","June","July","August","September","October","November","December"],
                    AmPm:["am","pm","AM","PM"],
                    S:function(b){
                        return b<11||b>13?["st","nd","rd","th"][Math.min((b-1)%10,3)]:"th"
                    },
                    srcformat:"Y-m-d",
                    newformat:"d/m/Y",
                    masks:{
                        ISO8601Long:"Y-m-d H:i:s",
                        ISO8601Short:"Y-m-d",
                        ShortDate:"n/j/Y",
                        LongDate:"l, F d, Y",
                        FullDateTime:"l, F d, Y g:i:s A",
                        MonthDay:"F d",
                        ShortTime:"g:i A",
                        LongTime:"g:i:s A",
                        SortableDateTime:"Y-m-d\\TH:i:s",
                        UniversalSortableDateTime:"Y-m-d H:i:sO",
                        YearMonth:"F, Y"
                    },
                    reformatAfterEdit:false
                },
                baseLinkUrl:"",
                showAction:"",
                target:"",
                checkbox:{disabled:true},
                idName:"id"
            }
    }
})(jQuery);