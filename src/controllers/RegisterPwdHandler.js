//!==================================================================================
//! Run Register SQL
//!==================================================================================
const bcrypt = require('bcrypt')
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
const moduleName = 'RegisterPwdHandler'
//==================================================================================
//= Main ASYNC Function
//==================================================================================
async function RegisterPwdHandler(db, bodyParms) {
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
    rtnSts: 0,
  }
  try {
    //
    //  Destructure Parameters
    //
    const { user, password } = bodyParms
    if (debugLog) console.log(`bodyParms `, bodyParms)
    //
    // Get Database record (ASYNC)
    //
    const rtnObjHdlrdb = await sqlDatabase(db, user, password)
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
async function sqlDatabase(db, user, password) {
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
    rtnSts: 0,
  }
  try {
    //-------------------------------------------------------------
    //  Hash the password
    //-------------------------------------------------------------
    const saltRounds = 10
    const hash = bcrypt.hashSync(password, saltRounds)
    //-------------------------------------------------------------
    //  Userspwd Insert
    //-------------------------------------------------------------
    const data_userspwd = await db
      .insert({
        uphash: hash,
        upuser: user,
      })
      .into('userspwd')
      .returning('*')
    const upuid = data_userspwd[0].upuid
    if (debugLog) console.log(`module(${moduleName}) upuid `, upuid)
    //
    //  Registration failed
    //
    if (!upuid) {
      rtnObjHdlrdb.rtnMessage = `Register User: FAILED`
      rtnObjHdlrdb.rtnSts = 8
      if (debugLog) console.log(`module(${moduleName}) rtnMessage `, rtnObjHdlrdb.rtnMessage)
      return rtnObjHdlrdb
    }
    //-------------------------------------------------------------
    //  Registration SUCCESS
    //-------------------------------------------------------------
    if (debugLog) console.log(`module(${moduleName}) data_userspwd `, [...data_userspwd])
    delete data_userspwd[0].uphash
    rtnObjHdlrdb.rtnValue = true
    rtnObjHdlrdb.rtnMessage = `Register Pwd: SUCCESS`
    rtnObjHdlrdb.rtnRows = data_userspwd
    rtnObjHdlrdb.rtnSts = 1
    return rtnObjHdlrdb
    //-------------------------------------------------------------
    // Errors
    //-------------------------------------------------------------
  } catch (err) {
    //
    //  Constraint (duplicate) error
    //
    const message = err.message
    if (message.includes('duplicate') && message.includes('userspwd_user')) {
      rtnObjHdlrdb.rtnValue = false
      rtnObjHdlrdb.rtnMessage = 'Registration User already exists'
      if (debugLog) console.log(`module(${moduleName}) rtnMessage `, rtnObjHdlrdb.rtnMessage)
      rtnObjHdlrdb.rtnSts = 9
      return rtnObjHdlrdb
    }
    //
    //  Other errors
    //
    rtnObjHdlrdb.rtnValue = false
    rtnObjHdlrdb.rtnMessage = ''
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
  RegisterPwdHandler,
}
