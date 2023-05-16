//
//  Environment variables package
//
const process = require('node:process')
require('dotenv').config()
//
//  Debug Settings
//
const DEBUG_LOG_OVERRIDE = process.env.DEBUG_LOG_OVERRIDE
const DEBUG_LOG = process.env.DEBUG_LOG
function debugSettings(debug = false) {
  //
  //  Log Override, then return Debug_Log value ?
  //
  if (DEBUG_LOG_OVERRIDE) return DEBUG_LOG
  //
  // No Override - return incomming parameter (or default of false)
  //
  return debug
}
//!==================================================================================
//! Exports
//!==================================================================================
module.exports = {
  debugSettings
}
