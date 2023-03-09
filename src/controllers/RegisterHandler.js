//!==================================================================================
//! Run Register SQL
//!==================================================================================
const bcrypt = require('bcrypt')
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
const moduleName = 'RegisterHandler'
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
async function RegisterHandler(db, bodyParms) {
  try {
    //
    //  Destructure Parameters
    //
    const {
      user,
      email,
      name,
      password,
      fedid,
      fedcountry,
      dftmaxquestions,
      dftowner,
      showprogress,
      showscore,
      sortquestions,
      skipcorrect,
      admin,
      dev
    } = bodyParms
    if (debugLog) console.log(`bodyParms `, bodyParms)
    //
    // Get Database record (ASYNC)
    //
    await sqlDatabase(
      db,
      user,
      email,
      name,
      password,
      fedid,
      fedcountry,
      dftmaxquestions,
      dftowner,
      showprogress,
      showscore,
      sortquestions,
      skipcorrect,
      admin,
      dev
    )
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
async function sqlDatabase(
  db,
  user,
  email,
  name,
  password,
  fedid,
  fedcountry,
  dftmaxquestions,
  dftowner,
  showprogress,
  showscore,
  sortquestions,
  skipcorrect,
  admin,
  dev
) {
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
        upuser: user
      })
      .into('userspwd')
      .returning('*')
    const upid = data_userspwd[0].upid
    if (debugLog) console.log(`module(${moduleName}) upid `, upid)
    //-------------------------------------------------------------
    //  Users Insert
    //-------------------------------------------------------------
    const data_users = await db
      .insert({
        u_id: upid,
        u_name: name,
        u_user: user,
        u_email: email,
        u_admin: admin,
        u_fedid: fedid,
        u_fedcountry: fedcountry,
        u_showprogress: showprogress,
        u_showscore: showscore,
        u_sortquestions: sortquestions,
        u_skipcorrect: skipcorrect,
        u_dftmaxquestions: dftmaxquestions,
        u_joined: new Date(),
        u_dev: dev
      })
      .into('users')
      .returning('*')
    //-------------------------------------------------------------
    //  Registration failed
    //------------------------------------------------------------
    if (!data_users || !data_users[0]) {
      rtnObj.rtnMessage = `Register User: FAILED`
      if (debugLog) console.log(`module(${moduleName}) rtnMessage `, rtnObj.rtnMessage)
      return
    }
    //-------------------------------------------------------------
    //  Usersowner Insert
    //-------------------------------------------------------------
    await db
      .insert({
        uoid: upid,
        uouser: user,
        uoowner: dftowner
      })
      .into('usersowner')
    //-------------------------------------------------------------
    //  Registration SUCCESS
    //-------------------------------------------------------------
    if (debugLog) console.log(`module(${moduleName}) data_users `, data_users)
    rtnObj.rtnValue = true
    rtnObj.rtnMessage = `Register User: SUCCESS`
    rtnObj.rtnRows = data_users
    return
    //-------------------------------------------------------------
    // Errors
    //-------------------------------------------------------------
  } catch (err) {
    //
    //  Constraint (duplicate) error
    //
    const message = err.message
    if (message.includes('duplicate') && message.includes('userspwd_user')) {
      rtnObj.rtnMessage = 'Registration User already exists'
      if (debugLog) console.log(`module(${moduleName}) rtnMessage `, rtnObj.rtnMessage)
      return
    }
    //
    //  Other errors
    //
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
  RegisterHandler
}
