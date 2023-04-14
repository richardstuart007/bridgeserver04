//==================================================================================
//= Process a REGISTER fetch request from server route
//==================================================================================
const { format } = require('date-fns')
const RegisterHandler = require('./RegisterHandler')
const updCounter = require('../services/updCounter')
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
//
// Constants
//
const moduleName = 'Register'
const dbKey = 'Register'
//==================================================================================
//= Register a User
//==================================================================================
async function Register(req, res, db, logCounter) {
  let logMessage
  //
  //  Define return object
  //
  const rtnObj = {
    rtnBodyParms: '',
    rtnValue: '',
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
      console.log(`Handler. ${logCounter} Time:${TimeStamp} Module(${moduleName}) rtnObj Init`, {
        ...rtnObj
      })
    //
    //  Update Counter 1 (Raw Request)
    //
    UpdCounters(db, dbKey, 'dbcount1')
    //..................................................................................
    //. Check values sent in Body
    //..................................................................................
    const { user, email, name, password } = bodyParms
    //
    //  Check required parameters
    //
    if (!user || !email || !name || !password) {
      rtnObj.rtnMessage = `User or Email or Name or Password empty`
      logMessage = logMessage + ' ' + rtnObj.rtnMessage
      console.log(logMessage)
      UpdCounters(db, dbKey, 'dbcount3')
      rtnObj.rtnSts = 8
      return res.status(503).json(rtnObj)
    }
    //
    // Process Request Promises(ALL)
    //
    const returnData = await Promise.all([RegisterHandler.RegisterHandler(db, bodyParms)])
    if (debugLog)
      console.log(`Handler. ${logCounter} Time:${TimeStamp} Module(${moduleName}) returnData `, [
        ...returnData
      ])
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
    rtnObj.rtnSts = tempObj.rtnSts
    if (debugLog)
      console.log(`Handler. ${logCounter} Time:${TimeStamp} Module(${moduleName}) rtnObj 1`, {
        ...rtnObj
      })
    //
    //  Catch
    //
    const rtnCatch = rtnObj.rtnCatch
    if (rtnCatch) {
      logMessage = logMessage + ' ' + rtnObj.rtnCatchMsg
      console.log(logMessage)
      UpdCounters(db, dbKey, 'dbcount3')
      return res.status(503).json(rtnObj)
    }
    //
    //  Not found
    //
    const rtnValue = rtnObj.rtnValue
    if (!rtnValue) {
      logMessage = logMessage + ' ' + rtnObj.rtnMessage
      console.log(logMessage)
      UpdCounters(db, dbKey, 'dbcount3')
      if (debugLog)
        console.log(`Handler. ${logCounter} Time:${TimeStamp} Module(${moduleName}) rtnObj`, {
          ...rtnObj
        })
      return res.status(200).json(rtnObj)
    }
    //
    //  Log return values
    //
    const records = Object.keys(rtnObj.rtnRows).length
    logMessage = logMessage + ` records(${records})`
    console.log(logMessage)
    UpdCounters(db, dbKey, 'dbcount2')
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
  Register
}
