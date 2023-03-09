//!==================================================================================
//! Run Raw SQL
//!==================================================================================
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
const moduleName = 'RawHandler'
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
async function RawHandler(db, bodyParms) {
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
    const { sqlAction, sqlString, sqlTable, sqlWhere, sqlOrderByRaw, sqlRow, sqlKeyName } =
      bodyParms
    if (debugLog) console.log(`module(${moduleName}) bodyParms `, bodyParms)
    //
    // Check values sent
    //
    if (!sqlAction) {
      rtnObj.rtnMessage = `SqlAction parameter not passed`
      return rtnObj
    }
    //
    //  Validate sqlAction type
    //
    if (
      sqlAction !== 'DELETE' &&
      sqlAction !== 'EXIST' &&
      sqlAction !== 'SELECTSQL' &&
      sqlAction !== 'SELECT' &&
      sqlAction !== 'INSERT' &&
      sqlAction !== 'UPDATE' &&
      sqlAction !== 'UPSERT'
    ) {
      rtnObj.rtnMessage = `SqlAction ${sqlAction}: SqlAction not valid`
      return rtnObj
    }
    //
    //  SELECTSQL needs sqlString
    //
    if (sqlAction === 'SELECTSQL' && !sqlString) {
      rtnObj.rtnMessage = `SqlAction ${sqlAction}: sqlString not passed`
      return rtnObj
    }
    //
    //  not SELECTSQL needs table
    //
    if (sqlAction !== 'SELECTSQL' && !sqlTable) {
      rtnObj.rtnMessage = `SqlAction ${sqlAction}: sqlTable not passed`
      return rtnObj
    }
    //
    // Get Database record (ASYNC)
    //
    await sqlDatabase(
      db,
      sqlAction,
      sqlString,
      sqlTable,
      sqlWhere,
      sqlOrderByRaw,
      sqlRow,
      sqlKeyName
    )
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
async function sqlDatabase(
  db,
  sqlAction,
  sqlString,
  sqlTable,
  sqlWhere,
  sqlOrderByRaw,
  sqlRow,
  sqlKeyName
) {
  //
  // Define Return Variable
  //
  let sqlData
  let returning = false
  //
  //  Try/Catch
  //
  try {
    switch (sqlAction) {
      case 'SELECTSQL':
        sqlData = await db.select(db.raw(sqlString))
        break
      case 'SELECT':
        if (sqlOrderByRaw) {
          sqlData = await db.select('*').from(sqlTable).whereRaw(sqlWhere).orderByRaw(sqlOrderByRaw)
        } else {
          sqlData = await db.select('*').from(sqlTable).whereRaw(sqlWhere)
        }
        break
      case 'UPDATE':
        returning = true
        sqlData = await db.update(sqlRow).from(sqlTable).whereRaw(sqlWhere).returning(['*'])

        break
      case 'DELETE':
        returning = true
        sqlData = await db.del().from(sqlTable).whereRaw(sqlWhere).returning(['*'])
        break
      case 'INSERT':
        returning = true
        if (sqlKeyName) {
          sqlData = await db
            .insert(sqlRow)
            .into(sqlTable)
            .returning(['*'])
            .onConflict(sqlKeyName)
            .ignore()
        } else {
          sqlData = await db.insert(sqlRow).into(sqlTable).returning(['*'])
        }
        break
      case 'UPSERT':
        returning = true
        sqlData = await db
          .insert(sqlRow)
          .into(sqlTable)
          .returning(['*'])
          .onConflict(sqlKeyName)
          .merge()
        break
    }
    //
    //  Expect returning value
    //
    if (debugLog) console.log(`module(${moduleName}) sqlData `, sqlData)
    if (returning && (!sqlData || !sqlData[0])) {
      rtnObj.rtnMessage = `SqlAction ${sqlAction}: FAILED`
      return
    }
    //
    // Update Return Values
    //
    rtnObj.rtnValue = true
    rtnObj.rtnMessage = `SqlAction ${sqlAction}: SUCCESS`
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
  RawHandler
}
