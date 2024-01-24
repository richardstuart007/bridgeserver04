//!==================================================================================
//! Run Signin SQL
//!==================================================================================
const bcrypt = require('bcrypt')
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
const moduleName = 'SigninHandler'
//==================================================================================
//= Main ASYNC Function
//==================================================================================
async function SigninHandler(db, bodyParms) {
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
    const { user, password } = bodyParms
    if (debugLog) console.log(`module(${moduleName}) bodyParms `, { ...bodyParms })
    //
    // Get Database record (ASYNC)
    //
    const rtnObjHdlrdb = await sqlDatabase(db, user, password)
    if (debugLog) console.log(`module(${moduleName}) rtnObjHdlr `, { ...rtnObjHdlr })
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
  // Define Return Variable
  //
  let data_userspwd = false
  let data_users = false
  let data_usersowner = false
  let AxWhere
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
    if (debugLog) console.log(`module(${moduleName}) user `, user)
    //-------------------------------------------------------------
    //  Userspwd GET
    //-------------------------------------------------------------
    AxWhere = `upuser = '${user}'`
    if (debugLog) console.log(`module(${moduleName}) userspwd - AxWhere `, AxWhere)
    data_userspwd = await db.select('*').from('userspwd').whereRaw(AxWhere)
    //
    //  Userspwd not found
    //
    if (!data_userspwd || !data_userspwd[0]) {
      rtnObjHdlrdb.rtnMessage = `Invalid User, please Register`
      rtnObjHdlrdb.rtnSts = 8
      if (debugLog) console.log(`module(${moduleName}) rtnMessage `, rtnObjHdlrdb.rtnMessage)
      return rtnObjHdlrdb
    }
    //-------------------------------------------------------------
    //  Validate password
    //-------------------------------------------------------------
    const userspwd = data_userspwd[0]
    const uphash = userspwd.uphash
    const valid = bcrypt.compareSync(password, uphash)
    if (!valid) {
      rtnObjHdlrdb.rtnMessage = `Invalid Password`
      rtnObjHdlrdb.rtnSts = 8
      if (debugLog) console.log(`module(${moduleName}) rtnMessage`, rtnObjHdlrdb.rtnMessage)
      return rtnObjHdlrdb
    }
    //
    //  User ID
    //
    const upuid = userspwd.upuid
    //-------------------------------------------------------------
    //  GET Users
    //-------------------------------------------------------------
    AxWhere = `u_uid = '${upuid}'`
    if (debugLog) console.log(`module(${moduleName}) users - AxWhere `, AxWhere)
    data_users = await db.select('*').from('users').whereRaw(AxWhere)
    //
    //  Not found
    //
    if (!data_users || !data_users[0]) {
      rtnObjHdlrdb.rtnMessage = `Database error (Users) not found for user(${user}) id(${upuid})`
      rtnObjHdlrdb.rtnSts = 8
      if (debugLog) console.log(`module(${moduleName}) rtnMessage`, rtnObjHdlrdb.rtnMessage)
      return rtnObjHdlrdb
    }
    //-------------------------------------------------------------
    //  GET Usersowner
    //-------------------------------------------------------------
    AxWhere = `uouid = '${upuid}'`
    if (debugLog) console.log(`module(${moduleName}) usersowner - AxWhere `, AxWhere)
    data_usersowner = await db.select('*').from('usersowner').whereRaw(AxWhere)
    //
    //  Not found
    //
    if (!data_usersowner) {
      rtnObjHdlrdb.rtnMessage = `Database error (Usersowner) not found for user($user) id($upuid)`
      if (debugLog) console.log(`module(${moduleName}) rtnMessage `, rtnObjHdlrdb.rtnMessage)
    }
    //-------------------------------------------------------------
    //  Return user found
    //-------------------------------------------------------------
    if (debugLog) console.log(`module(${moduleName}) data_users`, [...data_users])
    if (debugLog) console.log(`module(${moduleName}) data_usersowner`, [...data_usersowner])
    //
    // Update Return Values
    //
    rtnObjHdlrdb.rtnValue = true
    rtnObjHdlrdb.rtnMessage = `Signin User: SUCCESS`
    rtnObjHdlrdb.rtnRows[0] = data_users[0]
    rtnObjHdlrdb.rtnRows[1] = data_usersowner
    rtnObjHdlrdb.rtnSts = 1
    return rtnObjHdlrdb
    //-------------------------------------------------------------
    // Errors
    //-------------------------------------------------------------
  } catch (err) {
    console.log(`module(${moduleName}) err.message `, err.message)
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
  SigninHandler
}
