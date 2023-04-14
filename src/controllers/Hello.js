//==================================================================================
//= Process a Hello fetch request from server route
//==================================================================================
const { format } = require('date-fns')
const updCounter = require('../services/updCounter')
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
const moduleName = 'Hello'
//==================================================================================
async function Hello(req, res, db, logCounter) {
  let logMessage
  //
  //  Define return object
  //
  let rtnObj = {
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
      console.log(`Handler. ${logCounter} Time:${TimeStamp} Module(${moduleName}) rtnObj `, {
        ...rtnObj
      })
    //
    //  Update counter1 - Try
    //
    const dbKey = 'Hello'
    const dbCounter = 'dbcount1'
    const returnData = await Promise.all([updCounter.updCounter(db, dbKey, dbCounter)])
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
      rtnObj.rtnSts = 9
      return res.status(503).json(rtnObj)
    }
    //
    //  Not found
    //
    const rtnValue = rtnObj.rtnValue
    if (!rtnValue) {
      rtnObj.rtnSts = 2
      return res.status(200).json(rtnObj)
    }
    //
    //  Log return values
    //
    logMessage = logMessage + ` Hello SUCCESS`
    console.log(logMessage)
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
    rtnObj.rtnSts = 9
    return res.status(503).json(rtnObj)
  }
}
//!==================================================================================
//! Exports
//!==================================================================================
module.exports = {
  Hello
}
