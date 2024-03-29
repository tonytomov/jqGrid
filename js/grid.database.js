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
		indexedDB.databases().then(function(r) { 
			const connection  = indexedDB.open(ts.p.dbconfig.dbname /*, ts.p.dbconfig.dbversion*/);
			connection.onupgradeneeded = (e) => {
				console.info('Database created: '+ts.p.dbconfig.dbname);
			};
			connection.onsuccess = function(e) {
				const db = e.target.result;
				var version =  parseInt(db.version),
				idcol = $.jgrid.getElemByAttrVal(ts.p.colModel, 'key', true);

				async function getIndexedDbData( skipCreate ) {
					var data, options = ts.p.dbconfig;
					if(typeof options.dataUrl === 'string') {
						try {
						let req = await fetch(options.dataUrl, options.fetchOptions);	
							data = await req.json();
							if(options.reader !== null) {
								data = $.jgrid.getAccessor(data, options.reader);
							}
						} catch(error) {
							console.log("Error:" +error);
							return;
						}
						if($.jgrid.isFunction(options.beforeInsertData)) {
							data = options.beforeInsertData.call(ts, data);
						}
					} else if(Array.isArray(options.dataUrl)) {
						data = options.dataUrl;
					}
						ts.p.dbconfig.dbversion = version + 1;
					var secondconn = indexedDB.open(options.dbname, version + 1/*, ts.p.dbconfig.dbversion*/);
						secondconn.onupgradeneeded = function (e) {
							var db = e.target.result;
							if(!skipCreate) {
								const objectStore = db.createObjectStore(ts.p.dbconfig.dbtable, {keyPath: idcol.name});
								for(let i =0;i<ts.p.colModel.length; i++) {
									let cm = ts.p.colModel[i];
									if(cm.name === idcol.name) {
										objectStore.createIndex(cm.name, cm.name, { unique: true });
									} else {
										objectStore.createIndex(cm.name, cm.name, { unique: false });
									}
								}
							}
							const transaction = e.target.transaction;
							const objectStore1 = transaction.objectStore(ts.p.dbconfig.dbtable);
							objectStore1.transaction.oncomplete = function(e){
								// data added
								//ts.p.dbconfig.loadIfExists = false;
							};
							objectStore1.transaction.onerror = function(e){
								$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
							};
							for(var row of data){
								if(!ts.p.dbconfig.isKeyInData) {
									row[idcol.name] = Math.random().toString(16).slice(2);
								}
								objectStore1.put(row);
							}
							ts.p.dbconfig.ready_req = true;
							ts.grid.populate();
						};
						secondconn.onerror =(e) => {
							$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
						};
					}
					if($.isEmptyObject(idcol)) {
						$.jgrid.info_dialog("Warning","Missed key: No uniquie key is set in colModel. Creating table fail",'Close');
						return;
					}
					if( !db.objectStoreNames.contains(ts.p.dbconfig.dbtable) ) {
						db.close();
						getIndexedDbData( false );
				} else if(ts.p.dbconfig.loadIfExists || ts.p.dbconfig.deleteIfExists) {
					const tr = db.transaction(ts.p.dbconfig.dbtable, "readwrite");
						const oS = tr.objectStore(ts.p.dbconfig.dbtable);
						const countRequest = oS.count();
						countRequest.onsuccess = () => {						
							if(countRequest.result > 0)  {
							if(ts.p.dbconfig.deleteIfExists) {
								const objectStoreRequest = oS.clear();
								objectStoreRequest.onsuccess = (event) => {
									// report the success of our request
									console.log("All records are cleared");
									db.close();
									getIndexedDbData( true );
								};
								objectStoreRequest.onerror = (e) => {
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
			connection.onerror =(e) => {
				$.jgrid.info_dialog("Error",e.target.error.name + " : "+e.target.error.message,'Close');
			};
		});	
	});},
	updateStorageRecord : async function (data, keyName) {
		let ts = this[0], dbcfg = ts.p.dbconfig, type = ts.p.datatype;
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
					const DBOpenRequest = window.indexedDB.open(dbcfg.dbname /*, dbcfg.dbversion*/);
					DBOpenRequest.onsuccess = (event) => {
						const db = DBOpenRequest.result;
						const transaction = db.transaction(dbcfg.dbtable, "readwrite");
						transaction.oncomplete = (event) => {
							resolve(event);
							console.log("Transaction completed succefully");
						};
						transaction.onerror = (event) => {
							reject(event);
							try {
								$.jgrid.info_dialog.call("Error", event.target.error, "Close", {styleUI : ts.p.styleUI});
							} catch (e) {
								console.log(event.target.error);
							}
						};
						const objectStore = transaction.objectStore(dbcfg.dbtable);
						for(let i=0;i<data.length;i++) {
							if(!data[i].hasOwnProperty(keyName) || data[i][keyName] === "") {
								transaction.abort();
								break;
							}
							const req2 = objectStore.openCursor();
							req2.onsuccess = (e) => {
								 const cursor = e.target.result;
								 if(!cursor) {
									 return;
								 }
								var updateData = cursor.value;
								if(updateData[keyName] === data[i][keyName]) {
									delete data[i].oper;
									updateData = Object.assign(updateData, data[i]);
									const updateRequest = cursor.update(updateData);
									return;
								} else {
									 cursor.continue();
								}
								};
							req2.onerror = (e) => {
								console.log(e.target.error);
							};
						}
					};
				break;
			} 
		});
	},
	addStorageRecord : async function (data, keyName) {
		let ts = this[0], dbcfg = ts.p.dbconfig, type = ts.p.datatype;
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
					const DBOpenRequest = window.indexedDB.open(dbcfg.dbname /*, dbcfg.dbversion*/);
					DBOpenRequest.onsuccess = (event) => {
						const db = DBOpenRequest.result;
						const transaction = db.transaction(dbcfg.dbtable, "readwrite");
						transaction.oncomplete = (event) => {
							resolve(event);
							console.log("Transaction completed succefully");
						};
						transaction.onerror = (event) => {
							reject(event);
							try {
								$.jgrid.info_dialog.call("Error", event.target.error, "Close", {styleUI : ts.p.styleUI});
							} catch (e) {
								console.log(event.target.error);
							}
						};
						const objectStore = transaction.objectStore(dbcfg.dbtable);
						for(let i=0;i<data.length;i++) {
							if(!data[i].hasOwnProperty(keyName) || data[i][keyName] === "") {
								data[i][keyName] = Math.random().toString(16).slice(2);
							}
							var objectStoreRequest = objectStore.add(data[i]);
							objectStoreRequest.onsuccess = (event) => {
								//console.log(event.type, objectStoreRequest.result);
							};
						}
					};
				break;
			} 
		});
	},
	deleteStorageRecord : async function (data, keyName) {
		let ts = this[0], dbcfg = ts.p.dbconfig, type = ts.p.datatype;
		return new Promise(function(resolve, reject){
			if(!Array.isArray(data)) {
				data = data.split(",");
			}	
			if(!keyName) {
				keyName = ts.p.keyName;
			}
			switch(type) {
				case 'indexeddb' :
					var test =[], obj={};
					for (let i=0;i<data.length;i++) {
						obj[keyName] = data[i];
						test.push(obj);
					}
					// detect keytype
					test = $.jgrid.normalizeDbData.call(ts, test, ts.p.colModel );			
					const DBOpenRequest = window.indexedDB.open(dbcfg.dbname /*, dbcfg.dbversion*/);
					DBOpenRequest.onsuccess = (event) => {
						const db = DBOpenRequest.result;
						const transaction = db.transaction(dbcfg.dbtable, "readwrite");
						transaction.oncomplete = (event) => {
							resolve(event);
							console.log("Transaction completed succefully");
						};
						transaction.onerror = (event) => {
							reject(event);
							try {
								$.jgrid.info_dialog.call("Error", event.target.error, "Close", {styleUI : ts.p.styleUI});
							} catch (e) {
								console.log(event.target.error);
							}
						};
						const objectStore = transaction.objectStore(dbcfg.dbtable);
						for(let i=0;i<data.length;i++) {
							var objectStoreRequest = objectStore.delete(test[i][keyName]);
							objectStoreRequest.onsuccess = (event) => {
								console.log("Deleted record: " + data[i]);
							};							
						}
					};
				break;
			} 
		});
	}	
});
//module end
}));
