/*jshint eqeqeq:false, eqnull:true */
/*global jQuery, define */
// Grouping module
(function( factory ) {
	"use strict";
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"./grid.base"
		], factory );
	} else {
		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {
"use strict";
//module begin
$.jgrid.extend({
	dbInit : function (dbtype) {
		return this.each(function (){
			switch (dbtype) {
				case  'indexeddb':
					$(this).jqGrid('_initIndexedDB_');
				break;
			}
		});
	},
	_initIndexedDB_ : function() { 
	this.each(function(){
		var ts = this;
		var openDb = function() { 
			var connection  = indexedDB.open(ts.p.dbconfig.dbname /*, ts.p.dbconfig.dbversion*/);
			connection.onupgradeneeded = function(e) {
				console.info('Database created: '+ts.p.dbconfig.dbname);
			};
			connection.onsuccess = function(e) {
				var db = e.target.result;
				var version =  parseInt(db.version),
				idcol = $.jgrid.getElemByAttrVal(ts.p.colModel, 'key', true);

				function storeIndexedDbData( data, skipCreate ) {
					var options = ts.p.dbconfig;
					ts.p.dbconfig.dbversion = version + 1;
					var secondconn = indexedDB.open(options.dbname, version + 1/*, ts.p.dbconfig.dbversion*/);
					secondconn.onupgradeneeded = function (e) {
						var db = e.target.result, i;
						if(!skipCreate) {
							var objectStore = db.createObjectStore(ts.p.dbconfig.dbtable, {keyPath: idcol.name});
							for(i =0;i<ts.p.colModel.length; i++) {
								var cm = ts.p.colModel[i];
								if(cm.name === idcol.name) {
									objectStore.createIndex(cm.name, cm.name, { unique: true });
								} else {
									objectStore.createIndex(cm.name, cm.name, { unique: false });
								}
							}
						}
						var transaction = e.target.transaction;
						var objectStore1 = transaction.objectStore(ts.p.dbconfig.dbtable);
						objectStore1.transaction.oncomplete = function(e){
							// data added
							//ts.p.dbconfig.loadIfExists = false;
						};
						objectStore1.transaction.onerror = function(e){
							$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
						};
						if(data && data.length) {
							for(i = 0; i < data.length; i++){
								var row = data[i];
								if(!ts.p.dbconfig.isKeyInData) {
									row[idcol.name] = Math.random().toString(16).slice(2);
								}
								objectStore1.put(row);
							}
						}
						ts.p.dbconfig.ready_req = true;
						ts.grid.populate();
					};
					secondconn.onerror = function(e) {
						$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
					};
				}
				function getIndexedDbData( skipCreate ) {
					var options = ts.p.dbconfig,
					onData = function( data ) {
						if(options.reader !== null) {
							data = $.jgrid.getAccessor(data, options.reader);
						}
						if($.jgrid.isFunction(options.beforeInsertData)) {
							data = options.beforeInsertData.call(ts, data);
						}
						storeIndexedDbData( data, skipCreate );
					},
					onError = function( error ) {
						console.log("Error:" +error);
					};
					if(typeof options.dataUrl === 'string') {
						if(typeof window.fetch === 'function') {
							try {
								window.fetch(options.dataUrl, options.fetchOptions).then(function(req) {
									return req.json();
								}).then(onData)["catch"](onError);
							} catch(error) {
								onError(error);
							}
						} else {
							// IE11 / Edge IE mode - no fetch API
							$.ajax($.extend({ dataType : "json" }, options.ajaxOptions || {}, { url : options.dataUrl }))
								.done(function(data) {
									try {
										onData(data);
									} catch(error) {
										onError(error);
									}
								})
								.fail(function(xhr, status, err) {
									onError(err || status);
								});
						}
					} else {
						storeIndexedDbData( Array.isArray(options.dataUrl) ? options.dataUrl : undefined, skipCreate );
					}
				}
				if($.isEmptyObject(idcol)) {
					$.jgrid.info_dialog("Warning","Missed key: No uniquie key is set in colModel. Creating table fail",'Close');
					return;
				}
				if( !db.objectStoreNames.contains(ts.p.dbconfig.dbtable) ) {
					db.close();
					getIndexedDbData( false );
				} else if(ts.p.dbconfig.loadIfExists || ts.p.dbconfig.deleteIfExists) {
					var tr = db.transaction(ts.p.dbconfig.dbtable, "readwrite");
					var oS = tr.objectStore(ts.p.dbconfig.dbtable);
					var countRequest = oS.count();
					countRequest.onsuccess = function() {
						if(countRequest.result > 0)  {
							if(ts.p.dbconfig.deleteIfExists) {
								var objectStoreRequest = oS.clear();
								objectStoreRequest.onsuccess = function(event) {
									// report the success of our request
									console.log("All records are cleared");
									db.close();
									getIndexedDbData( true );
								};
								objectStoreRequest.onerror = function(e) {
									// report the success of our request
									$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
								};
							} else if(ts.p.dbconfig.loadIfExists) {
								db.close();
								getIndexedDbData( true );
							} else {
								db.close();
								ts.p.dbconfig.ready_req = true;
								ts.grid.populate();
							}
						} else {
							db.close();
							getIndexedDbData( true );
						}
					};
				} else {
					db.close();
					ts.p.dbconfig.ready_req = true;
					ts.grid.populate();
				}
			};
			connection.onerror = function(e) {
				$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
			};
		};
		if(typeof indexedDB.databases === 'function') {
			indexedDB.databases().then(openDb, openDb);
		} else {
			openDb();
		}
	});},
	updateStorageRecord : function (data, keyName) {
		var ts = this[0], dbcfg = ts.p.dbconfig, type = ts.p.datatype;
		return new Promise(function(resolve, reject){
			if(!Array.isArray(data)) {
				data = [data];
			}
			if(!keyName) {
				keyName = ts.p.keyName;
			}
			data = $.jgrid.normalizeDbData.call(ts, data, ts.p.colModel );
			switch(type) {
				case 'indexeddb' :
					var DBOpenRequest = window.indexedDB.open(dbcfg.dbname /*, dbcfg.dbversion*/);
					DBOpenRequest.onsuccess = function(event) {
						var db = DBOpenRequest.result;
						var transaction = db.transaction(dbcfg.dbtable, "readwrite");
						transaction.oncomplete = function(event) {
							resolve(event);
							console.log("Transaction completed succefully");
						};
						transaction.onerror = function(event) {
							reject(event);
							try {
								$.jgrid.info_dialog.call("Error", event.target.error, "Close", {styleUI : ts.p.styleUI});
							} catch (e) {
								console.log(event.target.error);
							}
						};
						var objectStore = transaction.objectStore(dbcfg.dbtable);
						var updateRecord = function( rec ) {
							var req2 = objectStore.openCursor();
							req2.onsuccess = function(e) {
								var cursor = e.target.result;
								if(!cursor) {
									return;
								}
								var updateData = cursor.value;
								if(updateData[keyName] === rec[keyName]) {
									delete rec.oper;
									for(var rk in rec) {
										if(rec.hasOwnProperty(rk)) { updateData[rk] = rec[rk]; }
									}
									cursor.update(updateData);
									return;
								} else {
									cursor["continue"]();
								}
							};
							req2.onerror = function(e) {
								console.log(e.target.error);
							};
						};
						for(var i=0;i<data.length;i++) {
							if(!data[i].hasOwnProperty(keyName) || data[i][keyName] === "") {
								transaction.abort();
								break;
							}
							updateRecord( data[i] );
						}
					};
				break;
			} 
		});
	},
	addStorageRecord : function (data, keyName) {
		var ts = this[0], dbcfg = ts.p.dbconfig, type = ts.p.datatype;
		return new Promise(function(resolve, reject){
			if(!Array.isArray(data)) {
				data = [data];
			}
			if(!keyName) {
				keyName = ts.p.keyName;
			}
			data = $.jgrid.normalizeDbData.call(ts, data, ts.p.colModel );
			switch(type) {
				case 'indexeddb' :
					var DBOpenRequest = window.indexedDB.open(dbcfg.dbname /*, dbcfg.dbversion*/);
					DBOpenRequest.onsuccess = function(event) {
						var db = DBOpenRequest.result;
						var transaction = db.transaction(dbcfg.dbtable, "readwrite");
						transaction.oncomplete = function(event) {
							resolve(event);
							console.log("Transaction completed succefully");
						};
						transaction.onerror = function(event) {
							reject(event);
							try {
								$.jgrid.info_dialog.call("Error", event.target.error, "Close", {styleUI : ts.p.styleUI});
							} catch (e) {
								console.log(event.target.error);
							}
						};
						var objectStore = transaction.objectStore(dbcfg.dbtable);
						for(var i=0;i<data.length;i++) {
							if(!data[i].hasOwnProperty(keyName) || data[i][keyName] === "") {
								data[i][keyName] = Math.random().toString(16).slice(2);
							}
							var objectStoreRequest = objectStore.add(data[i]);
							objectStoreRequest.onsuccess = function(event) {
								//console.log(event.type, objectStoreRequest.result);
							};
						}
					};
				break;
			} 
		});
	},
	deleteStorageRecord : function (data, keyName) {
		var ts = this[0], dbcfg = ts.p.dbconfig, type = ts.p.datatype;
		return new Promise(function(resolve, reject){
			if(!Array.isArray(data)) {
				data = data.split(",");
			}	
			if(!keyName) {
				keyName = ts.p.keyName;
			}
			switch(type) {
				case 'indexeddb' :
					var test =[], obj, i;
					for (i=0;i<data.length;i++) {
						obj = {};
						obj[keyName] = data[i];
						test.push(obj);
					}
					// detect keytype
					test = $.jgrid.normalizeDbData.call(ts, test, ts.p.colModel );			
					var DBOpenRequest = window.indexedDB.open(dbcfg.dbname /*, dbcfg.dbversion*/);
					DBOpenRequest.onsuccess = function(event) {
						var db = DBOpenRequest.result;
						var transaction = db.transaction(dbcfg.dbtable, "readwrite");
						transaction.oncomplete = function(event) {
							resolve(event);
							console.log("Transaction completed succefully");
						};
						transaction.onerror = function(event) {
							reject(event);
							try {
								$.jgrid.info_dialog.call("Error", event.target.error, "Close", {styleUI : ts.p.styleUI});
							} catch (e) {
								console.log(event.target.error);
							}
						};
						var objectStore = transaction.objectStore(dbcfg.dbtable);
						var deleteRecord = function( key, label ) {
							var objectStoreRequest = objectStore["delete"](key);
							objectStoreRequest.onsuccess = function(event) {
								console.log("Deleted record: " + label);
							};
						};
						for(var j=0;j<data.length;j++) {
							deleteRecord( test[j][keyName], data[j] );
						}
					};
				break;
			} 
		});
	}	
});
//module end
}));
