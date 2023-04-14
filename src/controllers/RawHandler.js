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
    rtnRows: [],
    rtnSts: 0
  }
  try {
    //..................................................................................
    //. Parameter Validation
    //..................................................................................
    //
    //  Destructure Parameters
    //
    const { AxAction, AxString, AxTable, AxWhere, AxOrderByRaw, AxRow, AxKeyName } = bodyParms
    if (debugLog) console.log(`module(${moduleName}) bodyParms `, { ...bodyParms })
    //
    // Check values sent
    //
    if (!AxAction) {
      rtnObjHdlr.rtnMessage = `SqlAction parameter not passed`
      rtnObjHdlr.rtnSts = 8
      return rtnObjHdlr
    }
    //
    //  Validate AxAction type
    //
    if (
      AxAction !== 'DELETE' &&
      AxAction !== 'EXIST' &&
      AxAction !== 'SELECTSQL' &&
      AxAction !== 'SELECT' &&
      AxAction !== 'INSERT' &&
      AxAction !== 'UPDATE' &&
      AxAction !== 'UPDATERAW' &&
      AxAction !== 'UPSERT'
    ) {
      rtnObjHdlr.rtnMessage = `SqlAction ${AxAction}: SqlAction not valid`
      rtnObjHdlr.rtnSts = 8
      return rtnObjHdlr
    }
    //
    //  SELECTSQL needs AxString
    //
    if (AxAction === 'SELECTSQL' && !AxString) {
      rtnObjHdlr.rtnMessage = `SqlAction ${AxAction}: AxString not passed`
      rtnObjHdlr.rtnSts = 8
      return rtnObjHdlr
    }
    //
    //  not SELECTSQL needs table
    //
    if (AxAction !== 'SELECTSQL' && !AxTable) {
      rtnObjHdlr.rtnMessage = `SqlAction ${AxAction}: AxTable not passed`
      rtnObjHdlr.rtnSts = 8
      return rtnObjHdlr
    }
    //
    // Get Database record (ASYNC)
    //
    const rtnObjHdlrdb = await sqlDatabase(
      db,
      AxAction,
      AxString,
      AxTable,
      AxWhere,
      AxOrderByRaw,
      AxRow,
      AxKeyName
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
    rtnObjHdlr.rtnSts = 9
    return rtnObjHdlr
  }
}
//!==================================================================================
//! Main function - Await
//!==================================================================================
async function sqlDatabase(
  db,
  AxAction,
  AxString,
  AxTable,
  AxWhere,
  AxOrderByRaw,
  AxRow,
  AxKeyName
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
    rtnRows: [],
    rtnSts: 0
  }
  //
  //  Try/Catch
  //
  try {
    switch (AxAction) {
      case 'SELECTSQL':
        sqlData = await db.select(db.raw(AxString))
        break
      case 'SELECT':
        if (AxOrderByRaw) {
          sqlData = await db.select('*').from(AxTable).whereRaw(AxWhere).orderByRaw(AxOrderByRaw)
        } else {
          sqlData = await db.select('*').from(AxTable).whereRaw(AxWhere)
        }
        break
      case 'UPDATE':
        returning = true
        sqlData = await db.update(AxRow).from(AxTable).whereRaw(AxWhere).returning(['*'])
        break
      case 'UPDATERAW':
        returning = true
        sqlData = await db.raw(AxString)
        break
      case 'DELETE':
        returning = true
        sqlData = await db.del().from(AxTable).whereRaw(AxWhere).returning(['*'])
        break
      case 'INSERT':
        returning = true
        if (AxKeyName) {
          sqlData = await db
            .insert(AxRow)
            .into(AxTable)
            .returning(['*'])
            .onConflict(AxKeyName)
            .ignore()
        } else {
          sqlData = await db.insert(AxRow).into(AxTable).returning(['*'])
        }
        break
      case 'UPSERT':
        returning = true
        sqlData = await db
          .insert(AxRow)
          .into(AxTable)
          .returning(['*'])
          .onConflict(AxKeyName)
          .merge()
        break
    }
    //
    //  Expect returning value
    //
    if (debugLog) console.log(`module(${moduleName}) sqlData `, [...sqlData])
    if (returning && (!sqlData || !sqlData[0])) {
      rtnObjHdlrdb.rtnMessage = `SqlAction ${AxAction}: FAILED`
      rtnObjHdlrdb.rtnSts = 9
      return rtnObjHdlrdb
    }
    //
    // Update Return Values
    //
    rtnObjHdlrdb.rtnValue = true
    rtnObjHdlrdb.rtnMessage = `SqlAction ${AxAction}: SUCCESS`
    rtnObjHdlrdb.rtnRows = sqlData
    rtnObjHdlrdb.rtnSts = 1
    return rtnObjHdlrdb
    //
    // Errors
    //
  } catch (err) {
    console.log(`module(${moduleName}) `, err.message)
    rtnObjHdlrdb.rtnCatch = true
    rtnObjHdlrdb.rtnCatchMsg = err.message
    rtnObjHdlrdb.rtnCatchFunction = moduleName
    rtnObjHdlrdb.rtnSts = 9
    return rtnObjHdlrdb
  }
}
//!==================================================================================
//! Exports
//!==================================================================================
module.exports = {
  RawHandler
}
