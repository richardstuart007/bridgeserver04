//!==================================================================================
//! Run updCounter
//!==================================================================================
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
const moduleName = 'updCounter'
//.................................
//  Object returned by this module
//.................................
const rtnObj = {
  rtnValue: false,
  rtnMessage: '',
  rtnSqlFunction: moduleName,
  rtnCatchFunction: '',
  rtnCatch: false,
  rtnCatchMsg: '',
  rtnRows: []
}
//==================================================================================
//= Main ASYNC Function
//==================================================================================
async function updCounter(db, dbKey, dbCounter) {
  try {
    //
    //  Initialise Values
    //
    rtnObj.rtnValue = false
    rtnObj.rtnMessage = ''
    rtnObj.rtnSqlFunction = moduleName
    rtnObj.rtnCatchFunction = ''
    rtnObj.rtnCatch = false
    rtnObj.rtnCatchMsg = ''
    rtnObj.rtnRows = []
    //..................................................................................
    //. Parameter Validation
    //..................................................................................
    if (debugLog) console.log(`module(${moduleName}) dbKey `, dbKey)
    if (debugLog) console.log(`module(${moduleName}) dbCounter `, dbCounter)
    //
    // Check Database (ASYNC)
    //
    await sqlDatabase(db, dbKey, dbCounter)
    return rtnObj
    //
    // Errors
    //
  } catch (err) {
    console.log(`module(${moduleName}) `, err.message)
    rtnObj.rtnCatch = true
    rtnObj.rtnCatchMsg = err.message
    rtnObj.rtnCatchFunction = moduleName
    return rtnObj
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
  const sqlTable = 'dbstats'
  const sqlAction = 'Increment'
  const sqlString = `UPDATE ${sqlTable} SET ${dbCounter} = ${dbCounter} + 1 WHERE dbKey = '${dbKey}' RETURNING *`
  if (debugLog) console.log(`module(${moduleName}) sqlString `, sqlString)
  //
  //  Try/Catch
  //
  try {
    rtnData = await db.raw(sqlString)
    //
    //  Expect returning value
    //
    if (!rtnData || !rtnData.rows[0]) {
      rtnObj.rtnMessage = `SqlAction ${sqlAction}: FAILED`
      return
    }
    //
    // Update Return Values
    //
    const rows = rtnData.rows
    if (debugLog) console.log(`module(${moduleName}) rows `, rows)
    const record = rows[0]
    if (debugLog) console.log(`module(${moduleName}) record `, record)
    let dbcount = 0
    dbCounter === 'dbcount1'
      ? (dbcount = record.dbcount1)
      : dbCounter === 'dbcount2'
      ? (dbcount = record.dbcount2)
      : (dbcount = record.dbcount3)

    rtnObj.rtnValue = true
    rtnObj.rtnMessage = `SqlAction ${sqlAction}: SUCCESS - Updated ${dbCounter} ${dbcount}`
    rtnObj.rtnRows = rows
    if (debugLog) console.log(`module(${moduleName}) rtnMessage `, rtnObj.rtnMessage)
    return
    //
    // Errors
    //
  } catch (err) {
    console.log(`module(${moduleName}) `, err.message)
    rtnObj.rtnCatch = true
    rtnObj.rtnCatchMsg = err.message
    rtnObj.rtnCatchFunction = moduleName
    return
  }
}
//!==================================================================================
//! Exports
//!==================================================================================
module.exports = {
  updCounter
}
