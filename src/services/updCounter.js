//!==================================================================================
//! Run updCounter
//!==================================================================================
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
const moduleName = 'updCounter'
//==================================================================================
//= Main ASYNC Function
//==================================================================================
async function updCounter(db, dbKey, dbCounter) {
  //
  //  Object returned by this module
  //
  const rtnObjHdlr = {
    rtnValue: false,
    rtnMessage: '',
    rtnSqlFunction: moduleName,
    rtnCatchFunction: '',
    rtnCatch: false,
    rtnCatchMsg: '',
    rtnRows: []
  }
  try {
    //.................................................................................
    //. Parameter Validation
    //..................................................................................
    if (debugLog) console.log(`module(${moduleName}) dbKey `, dbKey)
    if (debugLog) console.log(`module(${moduleName}) dbCounter `, dbCounter)
    //
    // Check Database (ASYNC)
    //
    const rtnObjHdlrdb = await sqlDatabase(db, dbKey, dbCounter)
    return rtnObjHdlrdb
    //
    // Errors
    //
  } catch (err) {
    console.log(`module(${moduleName}) `, err.message)
    rtnObjHdlr.rtnCatch = true
    rtnObjHdlr.rtnCatchMsg = err.message
    rtnObjHdlr.rtnCatchFunction = moduleName
    return rtnObjHdlr
  }
}
//!==================================================================================
//! Increment counts
//!==================================================================================
async function sqlDatabase(db, dbKey, dbCounter) {
  //
  // Define Return Variable
  //
  let rtnData
  const AxTable = 'dbstats'
  const AxAction = 'Increment'
  const AxString = `UPDATE ${AxTable} SET ${dbCounter} = ${dbCounter} + 1 WHERE dbKey = '${dbKey}' RETURNING *`
  if (debugLog) console.log(`module(${moduleName}) AxString `, AxString)
  //
  //  Object returned by this module
  //
  const rtnObjHdlrdb = {
    rtnValue: false,
    rtnMessage: '',
    rtnSqlFunction: moduleName,
    rtnCatchFunction: '',
    rtnCatch: false,
    rtnCatchMsg: '',
    rtnRows: []
  }
  //
  //  Try/Catch
  //
  try {
    rtnData = await db.raw(AxString)
    //
    //  Expect returning value
    //
    if (!rtnData || !rtnData.rows[0]) {
      rtnObjHdlrdb.rtnMessage = `SqlAction ${AxAction}: FAILED`
      return rtnObjHdlrdb
    }
    //
    // Update Return Values
    //
    const rows = rtnData.rows
    if (debugLog) console.log(`module(${moduleName}) rows `, [...rows])
    const record = rows[0]
    if (debugLog) console.log(`module(${moduleName}) record `, { ...record })
    let dbcount = 0
    dbCounter === 'dbcount1'
      ? (dbcount = record.dbcount1)
      : dbCounter === 'dbcount2'
      ? (dbcount = record.dbcount2)
      : (dbcount = record.dbcount3)

    rtnObjHdlrdb.rtnValue = true
    rtnObjHdlrdb.rtnMessage = `SqlAction ${AxAction}: SUCCESS - Updated ${dbCounter} ${dbcount}`
    rtnObjHdlrdb.rtnRows = rows
    if (debugLog) console.log(`module(${moduleName}) rtnMessage `, rtnObjHdlrdb.rtnMessage)
    return rtnObjHdlrdb
    //
    // Errors
    //
  } catch (err) {
    console.log(`module(${moduleName}) `, err.message)
    rtnObjHdlrdb.rtnCatch = true
    rtnObjHdlrdb.rtnCatchMsg = err.message
    rtnObjHdlrdb.rtnCatchFunction = moduleName
    return rtnObjHdlrdb
  }
}
//!==================================================================================
//! Exports
//!==================================================================================
module.exports = {
  updCounter
}
