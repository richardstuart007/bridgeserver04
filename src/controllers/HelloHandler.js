//!==================================================================================
//! Run Hello
//!==================================================================================
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
const moduleName = 'HelloHandler'
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
async function HelloHandler(db, bodyParms) {
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
    //
    //  Destructure Parameters
    //
    const { helloType } = bodyParms
    if (debugLog) console.log(`module(${moduleName}) bodyParms `, bodyParms)
    //
    //  Check Action passed
    //
    if (!helloType) {
      rtnObj.rtnMessage = `helloType not sent as Body Parameters`
      return rtnObj
    }
    //
    //  Validate helloType type
    //
    if (helloType !== 'SERVER' && helloType !== 'DATABASE') {
      rtnObj.rtnMessage = `sqlAction ${helloType}: helloType not valid`
      return rtnObj
    }
    //
    // Check Server (ASYNC)
    //
    if (helloType === 'SERVER') {
      await checkServer()
      return rtnObj
    }
    //
    // Check Database (ASYNC)
    //
    await sqlDatabase(db)
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
//! Main function - Await
//!==================================================================================
async function checkServer() {
  try {
    //-------------------------------------------------------------
    //  Registration SUCCESS
    //-------------------------------------------------------------
    rtnObj.rtnValue = true
    rtnObj.rtnMessage = `Hello: SUCCESS`
    return
    //-------------------------------------------------------------
    // Errors
    //-------------------------------------------------------------
  } catch (err) {
    rtnObj.rtnCatch = true
    rtnObj.rtnCatchMsg = err.message
    rtnObj.rtnCatchFunction = moduleName
    return
  }
}
//!==================================================================================
//! Increment connection counts
//!==================================================================================
async function sqlDatabase(db) {
  //
  // Define Return Variable
  //
  let sqlData
  const sqlTable = 'dbinfo'
  const sqlAction = 'Increment'
  //
  //  Try/Catch
  //
  try {
    sqlData = await db
      .from(sqlTable)
      .increment({
        dbvisits: 1
      })
      .returning(['*'])
    //
    //  Expect returning value
    //
    if (debugLog) console.log(`module(${moduleName}) sqlData `, sqlData)
    if (!sqlData || !sqlData[0]) {
      rtnObj.rtnMessage = `SqlAction ${sqlAction}: FAILED`
      return
    }
    //
    // Update Return Values
    //
    const dbvisits = sqlData[0].dbvisits
    rtnObj.rtnValue = true
    rtnObj.rtnMessage = `SqlAction ${sqlAction}: SUCCESS - Updated visits(${dbvisits})`
    rtnObj.rtnRows = sqlData
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
  HelloHandler
}
