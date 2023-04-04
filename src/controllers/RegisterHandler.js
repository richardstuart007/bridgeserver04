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
//==================================================================================
//= Main ASYNC Function
//==================================================================================
async function RegisterHandler(db, bodyParms) {
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
    rtnRows: []
  }
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
    const rtnObjHdlrdb = await sqlDatabase(
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
    return rtnObjHdlrdb
    //
    // Errors
    //
  } catch (err) {
    console.log(`module(${moduleName}) `, err.message)
    rtnObjHdlr.rtnCatch = true
    rtnObjHdlr.rtnCatchMsg = err.message
    rtnObjHdlr.rtnCatchFunction = moduleName
    return rtnObjHdlr
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
    rtnRows: []
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
      rtnObjHdlrdb.rtnMessage = `Register User: FAILED`
      if (debugLog) console.log(`module(${moduleName}) rtnMessage `, rtnObjHdlrdb.rtnMessage)
      return rtnObjHdlrdb
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
    rtnObjHdlrdb.rtnValue = true
    rtnObjHdlrdb.rtnMessage = `Register User: SUCCESS`
    rtnObjHdlrdb.rtnRows = data_users
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
      rtnObjHdlrdb.rtnMessage = ''
      rtnObjHdlrdb.rtnMessage = 'Registration User already exists'
      if (debugLog) console.log(`module(${moduleName}) rtnMessage `, rtnObjHdlrdb.rtnMessage)
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
    return rtnObjHdlrdb
  }
}
//!==================================================================================
//! Exports
//!==================================================================================
module.exports = {
  RegisterHandler
}
