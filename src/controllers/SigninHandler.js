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
//.................................
//  Object returned by this module
//.................................
const rtnObj = {
  rtnValue: false,
  rtnMessage: '',
  rtnSqlFunction: moduleName,
  rtnCatchFunction: '',
  rtnCatch: false,
  rtnCatchMsg: '',
  rtnRows: []
}
//==================================================================================
//= Main ASYNC Function
//==================================================================================
async function SigninHandler(db, bodyParms) {
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
    //..................................................................................
    //. Parameter Validation
    //..................................................................................
    //
    //  Destructure Parameters
    //
    const { user, password } = bodyParms
    if (debugLog) console.log(`module(${moduleName}) bodyParms `, bodyParms)
    //
    // Get Database record (ASYNC)
    //
    await sqlDatabase(db, user, password)
    if (debugLog) console.log(`module(${moduleName}) rtnObj `, rtnObj)
    return rtnObj
    //
    // Errors
    //
  } catch (err) {
    console.log(`module(${moduleName}) `, err.message)
    rtnObj.rtnCatch = true
    rtnObj.rtnCatchMsg = err.message
    rtnObj.rtnCatchFunction = moduleName
    return rtnObj
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
  let sqlWhere
  //
  //  Try/Catch
  //
  try {
    if (debugLog) console.log(`module(${moduleName}) user `, user)
    //-------------------------------------------------------------
    //  Userspwd GET
    //-------------------------------------------------------------
    sqlWhere = `upuser = '${user}'`
    if (debugLog) console.log(`module(${moduleName}) userspwd - sqlWhere `, sqlWhere)
    data_userspwd = await db.select('*').from('userspwd').whereRaw(sqlWhere)
    //
    //  Userspwd not found
    //
    if (!data_userspwd || !data_userspwd[0]) {
      rtnObj.rtnMessage = `Invalid User, please Register`
      if (debugLog) console.log(`module(${moduleName}) rtnMessage `, rtnObj.rtnMessage)
      return
    }
    //-------------------------------------------------------------
    //  Validate password
    //-------------------------------------------------------------
    const userspwd = data_userspwd[0]
    const uphash = userspwd.uphash
    const valid = bcrypt.compareSync(password, uphash)
    if (!valid) {
      rtnObj.rtnMessage = `Invalid Password`
      if (debugLog) console.log(`module(${moduleName}) rtnMessage`, rtnObj.rtnMessage)
      return
    }
    //
    //  User ID
    //
    const upid = userspwd.upid
    //-------------------------------------------------------------
    //  GET Users
    //-------------------------------------------------------------
    sqlWhere = `u_id = '${upid}'`
    if (debugLog) console.log(`module(${moduleName}) users - sqlWhere `, sqlWhere)
    data_users = await db.select('*').from('users').whereRaw(sqlWhere)
    //
    //  Not found
    //
    if (!data_users || !data_users[0]) {
      rtnObj.rtnMessage = `Database error (Users) not found for user($user) id($upid)`
      if (debugLog) console.log(`module(${moduleName}) rtnMessage`, rtnObj.rtnMessage)
      return
    }
    //-------------------------------------------------------------
    //  GET Usersowner
    //-------------------------------------------------------------
    sqlWhere = `uoid = '${upid}'`
    if (debugLog) console.log(`module(${moduleName}) usersowner - sqlWhere `, sqlWhere)
    data_usersowner = await db.select('*').from('usersowner').whereRaw(sqlWhere)
    //
    //  Not found
    //
    if (!data_usersowner) {
      rtnObj.rtnMessage = `Database error (Usersowner) not found for user($user) id($upid)`
      if (debugLog) console.log(`module(${moduleName}) rtnMessage `, rtnObj.rtnMessage)
    }
    //-------------------------------------------------------------
    //  Return user found
    //-------------------------------------------------------------
    if (debugLog) console.log(`module(${moduleName}) data_users`, data_users)
    if (debugLog) console.log(`module(${moduleName}) data_usersowner`, data_usersowner)
    //
    // Update Return Values
    //
    rtnObj.rtnValue = true
    rtnObj.rtnMessage = `Signin User: SUCCESS`
    rtnObj.rtnRows[0] = data_users[0]
    rtnObj.rtnRows[1] = data_usersowner
    return
    //-------------------------------------------------------------
    // Errors
    //-------------------------------------------------------------
  } catch (err) {
    console.log(`module(${moduleName}) err.message `, err.message)
    rtnObj.rtnCatch = true
    rtnObj.rtnCatchMsg = err.message
    rtnObj.rtnCatchFunction = moduleName
    return
  }
}
//!==================================================================================
//! Exports
//!==================================================================================
module.exports = {
  SigninHandler
}
