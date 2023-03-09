//==================================================================================
//= Process a Hello fetch request from server route
//==================================================================================
const { format } = require('date-fns')
const HelloHandler = require('./HelloHandler')
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
  const TimeStamp = format(new Date(), 'yyLLddHHmmss')
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
    //  Body parameters
    //
    const bodyParms = req.body
    //
    //  Action type not sent
    //
    const { helloType } = bodyParms
    //
    //  Check Action passed
    //
    if (!helloType) {
      rtnObj.rtnMessage = `helloType not sent as Body Parameters`
      return res.status(400).json(rtnObj)
    }
    //
    //  Validate helloType type
    //
    if (helloType !== 'SERVER' && helloType !== 'DATABASE') {
      rtnObj.rtnMessage = `sqlAction ${helloType}: helloType not valid`
      return res.status(400).json(rtnObj)
    }
    //
    // Process Request Promises(ALL)
    //
    const returnData = await Promise.all([HelloHandler.HelloHandler(db, bodyParms)])
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
      return res.status(220).json(rtnObj)
    }
    //
    //  Log return values
    //
    logMessage = logMessage + ` HelloType(${helloType}) SUCCESS`
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
