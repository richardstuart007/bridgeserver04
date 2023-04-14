//==================================================================================
//= Process a RAW fetch request from server route
//==================================================================================
const { format } = require('date-fns')
const RawHandler = require('./RawHandler')
const updCounter = require('../services/updCounter')
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
//
// Constants
//
const moduleName = 'Raw'
const dbKey = 'Raw'
//==================================================================================
//= Get a row from a table : table, keyName, keyValue are passed in Body
//==================================================================================
async function Raw(req, res, db, logCounter) {
  let logMessage
  //
  //  Define return object
  //
  const rtnObj = {
    rtnBodyParms: '',
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
    //
    //  Time Stamp
    //
    const TimeStamp = format(new Date(), 'HHmmss')
    //
    //  Parameters
    //
    const bodyParms = req.body
    const { AxClient, AxSess, AxId, AxTry } = bodyParms
    logMessage = `Handler. ${logCounter} Time:${TimeStamp} AxSess(${AxSess}) AxId(${AxId}) AxTry(${AxTry}) Module(${moduleName}) AxClient(${AxClient})`
    rtnObj.rtnBodyParms = bodyParms
    if (debugLog)
      console.log(`Handler. ${logCounter} Time:${TimeStamp} Module(${moduleName}) rtnObj `, {
        ...rtnObj
      })
    //
    //  Update Counter 1 (Raw Request)
    //
    UpdCounters(db, dbKey, 'dbcount1')
    //..................................................................................
    //. Check values sent in Body
    //..................................................................................
    //
    //  Action type not sent
    //
    const { AxAction, AxTable } = bodyParms
    //
    //  Table/Action to message
    //
    logMessage = logMessage + ` Table(${AxTable}) ${AxAction}`
    //
    //  Check Action passed
    //
    if (!AxAction) {
      rtnObj.rtnMessage = `AxAction not sent as Body Parameters`
      logMessage = logMessage + ' ' + rtnObj.rtnMessage
      console.log(logMessage)
      UpdCounters(db, dbKey, 'dbcount3')
      rtnObj.rtnSts = 8
      return res.status(503).json(rtnObj)
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
      rtnObj.rtnMessage = `AxAction ${AxAction}: AxAction not valid`
      logMessage = logMessage + ' ' + rtnObj.rtnMessage
      console.log(logMessage)
      UpdCounters(db, dbKey, 'dbcount3')
      rtnObj.rtnSts = 8
      return res.status(503).json(rtnObj)
    }
    //
    // Process Request Promises(ALL)
    //
    const returnData = await Promise.all([RawHandler.RawHandler(db, bodyParms)])
    //
    // Parse Results
    //
    const rtnObjHandler = returnData[0]
    const tempObj = Object.assign({}, rtnObjHandler)
    rtnObj.rtnValue = tempObj.rtnValue
    rtnObj.rtnMessage = tempObj.rtnMessage
    rtnObj.rtnCatchFunction = tempObj.rtnCatchFunction
    rtnObj.rtnCatch = tempObj.rtnCatch
    rtnObj.rtnCatchMsg = tempObj.rtnCatchMsg
    rtnObj.rtnRows = tempObj.rtnRows
    //
    //  Catch
    //
    const rtnCatch = rtnObj.rtnCatch
    if (rtnCatch) {
      logMessage = logMessage + ' ' + rtnObj.rtnCatchMsg
      console.log(logMessage)
      UpdCounters(db, dbKey, 'dbcount3')
      rtnObj.rtnSts = 8
      return res.status(503).json(rtnObj)
    }
    //
    //  Log return values
    //
    const records = Object.keys(rtnObj.rtnRows).length
    logMessage = logMessage + `(${records})`
    console.log(logMessage)
    UpdCounters(db, dbKey, 'dbcount2')
    rtnObj.rtnSts = 1
    return res.status(200).json(rtnObj)
    //
    // Errors
    //
  } catch (err) {
    logMessage = logMessage + ` Error(${err.message})`
    console.log(logMessage)
    rtnObj.rtnCatch = true
    rtnObj.rtnCatchMsg = err.message
    rtnObj.rtnCatchFunction = moduleName
    UpdCounters(db, dbKey, 'dbcount3')
    rtnObj.rtnSts = 9
    return res.status(503).json(rtnObj)
  }
}
//..................................................................................
//. Update Counters
//..................................................................................
async function UpdCounters(db, dbKey, dbCounter) {
  try {
    //
    //  Update counter
    //
    await Promise.all([updCounter.updCounter(db, dbKey, dbCounter)])
    //
    // Errors
    //
  } catch (err) {
    console.log(err)
    return
  }
}
//!==================================================================================
//! Exports
//!==================================================================================
module.exports = {
  Raw
}
