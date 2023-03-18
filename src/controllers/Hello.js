//==================================================================================
//= Process a Hello fetch request from server route
//==================================================================================
const { format } = require('date-fns')
const updCounter = require('./updCounter')
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
const moduleName = 'Hello'
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
//==================================================================================
async function Hello(req, res, db, logCounter) {
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
    //  Update counter1 - Try
    //
    const dbKey = 'Hello'
    let dbCounter = 'dbcount1'
    const rtnUpdCounter = await Promise.all([updCounter.updCounter(db, dbKey, dbCounter)])
    if (debugLog) console.log(`module(${moduleName}) rtnUpdCounter `, rtnUpdCounter)
    //
    // Parse Results
    //
    const rtnUpdCounterObject = rtnUpdCounter[0]
    rtnObj = Object.assign({}, rtnUpdCounterObject)
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
      return res.status(220).json(rtnObj)
    }
    //
    //  Log return values
    //
    logMessage = logMessage + ` Hello SUCCESS`
    console.log(logMessage)
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
    return res.status(400).json(rtnObj)
  }
}
//!==================================================================================
//! Exports
//!==================================================================================
module.exports = {
  Hello
}
