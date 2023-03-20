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
//
//  Global Variable - Define return object
//
let rtnObj = {
  rtnBodyParms: '',
  rtnValue: '',
  rtnMessage: '',
  rtnSqlFunction: moduleName,
  rtnCatchFunction: '',
  rtnCatch: false,
  rtnCatchMsg: '',
  rtnRows: []
}
//==================================================================================
//= Register a User
//==================================================================================
async function Register(req, res, db, logCounter) {
  //
  //  Time Stamp
  //
  const TimeStamp = format(new Date(), 'HHmmss')
  let logMessage = `Handler. ${logCounter} Time:${TimeStamp} Module(${moduleName})`
  try {
    const bodyParms = req.body
    //
    //  Initialise Values
    //
    rtnObj.rtnBodyParms = bodyParms
    rtnObj.rtnValue = false
    rtnObj.rtnMessage = ''
    rtnObj.rtnSqlFunction = moduleName
    rtnObj.rtnCatchFunction = ''
    rtnObj.rtnCatch = false
    rtnObj.rtnCatchMsg = ''
    rtnObj.rtnRows = []
    if (debugLog)
      console.log(`Handler. ${logCounter} Time:${TimeStamp} Module(${moduleName}) rtnObj `, rtnObj)
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
      UpdCounters(db, dbKey, 'dbcount3')
      return res.status(400).json(rtnObj)
    }
    //
    // Process Request Promises(ALL)
    //
    const returnData = await Promise.all([RegisterHandler.RegisterHandler(db, bodyParms)])
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
      UpdCounters(db, dbKey, 'dbcount3')
      return res.status(420).json(rtnObj)
    }
    //
    //  Not found
    //
    const rtnValue = rtnObj.rtnValue
    if (!rtnValue) {
      UpdCounters(db, dbKey, 'dbcount3')
      return res.status(220).json(rtnObj)
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
  Register
}
