//
//  Environment variables package
//
const process = require('node:process')
require('dotenv').config()
//
//  Debug Settings
//
let DEBUG_LOG_OVERRIDE = false
if (process.env.DEBUG_LOG_OVERRIDE === 'true') DEBUG_LOG_OVERRIDE = true

let DEBUG_LOG = false
if (process.env.DEBUG_LOG === 'true') DEBUG_LOG = true

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
