//==================================================================================
//= Process a Signin fetch request from server route
//==================================================================================
const { format } = require('date-fns')
const SigninHandler = require('./SigninHandler')
const updCounter = require('./updCounter')
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
const moduleName = 'Signin'
//
//  Global Variable - Define return object
//
let rtnObj = {
  rtnValue: false,
  rtnMessage: '',
  rtnSqlFunction: moduleName,
  rtnCatchFunction: '',
  rtnCatch: false,
  rtnCatchMsg: '',
  rtnRows: []
}
//
// Global
//
const dbKey = 'Signin'
//==================================================================================
//= Signin a User
//==================================================================================
async function Signin(req, res, db, logCounter) {
  //
  //  Time Stamp
  //
  const TimeStamp = format(new Date(), 'HHmmss')
  let logMessage = `Handler. ${logCounter} Time:${TimeStamp} Module(${moduleName})`
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
    //
    //  Update Counter 1 (Raw Request)
    //
    UpdCounters(db, dbKey, 'dbcount1')
    //..................................................................................
    //. Check values sent in Body
    //..................................................................................
    const bodyParms = req.body
    const { user, password } = bodyParms
    //
    //  Check required parameters
    //
    if (!user || !password) {
      rtnObj.rtnMessage = `User or Password empty`
      //
      //  Update Counter 3 (Raw Fail)
      //
      UpdCounters(db, dbKey, 'dbcount3')
      return res.status(400).json(rtnObj)
    }
    //
    // Process Request Promises(ALL)
    //
    const returnData = await Promise.all([SigninHandler.SigninHandler(db, bodyParms)])
    if (debugLog) console.log(`module(${moduleName}) returnData `, returnData)
    //
    // Parse Results
    //
    const returnDataObject = returnData[0]
    rtnObj = Object.assign({}, returnDataObject)
    //
    //  Return values
    //
    if (debugLog) {
      console.log(`Handler. ${logCounter} Time:${TimeStamp} Module(${moduleName}) rtnObj `, rtnObj)
    }
    //
    //  Catch
    //
    const rtnCatch = rtnObj.rtnCatch
    if (rtnCatch) {
      if (debugLog) {
        console.log(
          `Handler. ${logCounter} Time:${TimeStamp} Module(${moduleName}) message(${rtnObj.rtnCatchMsg})`
        )
      }
      return res.status(420).json(rtnObj)
    }
    //
    //  Not found
    //
    const rtnValue = rtnObj.rtnValue
    if (!rtnValue) {
      if (debugLog) {
        console.log(
          `Handler. ${logCounter} Time:${TimeStamp} Module(${moduleName}) message(${rtnObj.rtnMessage})`
        )
      }
      //
      //  Update Counter 3 (Raw Fail)
      //
      UpdCounters(db, dbKey, 'dbcount3')
      return res.status(220).json(rtnObj)
    }
    //
    //  Log return values
    //
    const records = Object.keys(rtnObj.rtnRows).length
    logMessage = logMessage + ` records(${records})`
    console.log(logMessage)
    //
    //  Update Counter 2 (Raw Success)
    //
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
    //
    //  Update Counter 3 (Raw Fail)
    //
    UpdCounters(db, dbKey, 'dbcount3')
    return res.status(400).json(rtnObj)
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
  Signin
}
