//!==================================================================================
//! Run Raw SQL
//!==================================================================================
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
const moduleName = 'RawHandler'
//==================================================================================
//= Main ASYNC Function
//==================================================================================
async function RawHandler(db, bodyParms) {
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
    //..................................................................................
    //. Parameter Validation
    //..................................................................................
    //
    //  Destructure Parameters
    //
    const { sqlAction, sqlString, sqlTable, sqlWhere, sqlOrderByRaw, sqlRow, sqlKeyName } =
      bodyParms
    if (debugLog) console.log(`module(${moduleName}) bodyParms `, { ...bodyParms })
    //
    // Check values sent
    //
    if (!sqlAction) {
      rtnObjHdlr.rtnMessage = `SqlAction parameter not passed`
      return rtnObjHdlr
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
      rtnObjHdlr.rtnMessage = `SqlAction ${sqlAction}: SqlAction not valid`
      return rtnObjHdlr
    }
    //
    //  SELECTSQL needs sqlString
    //
    if (sqlAction === 'SELECTSQL' && !sqlString) {
      rtnObjHdlr.rtnMessage = `SqlAction ${sqlAction}: sqlString not passed`
      return rtnObjHdlr
    }
    //
    //  not SELECTSQL needs table
    //
    if (sqlAction !== 'SELECTSQL' && !sqlTable) {
      rtnObjHdlr.rtnMessage = `SqlAction ${sqlAction}: sqlTable not passed`
      return rtnObjHdlr
    }
    //
    // Get Database record (ASYNC)
    //
    const rtnObjHdlrdb = await sqlDatabase(
      db,
      sqlAction,
      sqlString,
      sqlTable,
      sqlWhere,
      sqlOrderByRaw,
      sqlRow,
      sqlKeyName
    )
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
    if (debugLog) console.log(`module(${moduleName}) sqlData `, [...sqlData])
    if (returning && (!sqlData || !sqlData[0])) {
      rtnObjHdlrdb.rtnMessage = `SqlAction ${sqlAction}: FAILED`
      return rtnObjHdlrdb
    }
    //
    // Update Return Values
    //
    rtnObjHdlrdb.rtnValue = true
    rtnObjHdlrdb.rtnMessage = `SqlAction ${sqlAction}: SUCCESS`
    rtnObjHdlrdb.rtnRows = sqlData
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
  RawHandler
}
