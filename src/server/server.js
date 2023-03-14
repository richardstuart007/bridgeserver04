//
//  Libraries
//
const express = require('express')
const myRouter = express.Router()
const knex = require('knex')
const { format } = require('date-fns')
const process = require('node:process')
const myCors = require('cors')
//
//  Components
//
const Hello = require('../controllers/Hello')
const Raw = require('../controllers/Raw')
const Register = require('../controllers/Register')
const Signin = require('../controllers/Signin')
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings(true)
//.............................................................................
//.  Initialisation
//.............................................................................
//
//  Arguments
//
const node_module = process.argv[0]
const script_path = process.argv[1]
let server_database = process.argv[2]
const env_database = process.env.DATABASE
if (debugLog) console.log('node_module ', node_module)
if (debugLog) console.log('script_path ', script_path)
if (debugLog) console.log('server_database ', server_database)
if (debugLog) console.log('env_database ', env_database)
//
//  Override database if not sent
//
if (!server_database) server_database = env_database
if (debugLog) console.log('server_database ', server_database)
//
//  Check if server is remote version run locally
//
let isLocalEnvironment = false
if (server_database >= 10) isLocalEnvironment = true
if (debugLog) console.log('isLocalEnvironment ', isLocalEnvironment)
const localpath = 'C:'
const isLocalProgram = script_path.substring(0, 2) === localpath
if (debugLog) console.log('isLocalProgram ', isLocalProgram)
if (isLocalProgram & !isLocalEnvironment) {
  console.log(
    `Error: Database is REMOTE(${server_database}) but trying to run LOCAL server to LOCAL database`
  )
  return
}
//
//  Counter
//
let logCounter = 0
const moduleName = 'server'
// --------------------
// Express
// --------------------
const app = express()
app.use(express.json())
// --------------------
//  Cors Middleware
// --------------------
let cors_Whitelist
getWhiteList()
if (debugLog) console.log('cors_Whitelist ', cors_Whitelist)
const corsOptions = {
  origin: cors_Whitelist,
  optionsSuccessStatus: 200,
  methods: ['POST', 'DELETE', 'OPTIONS']
}
app.options('*', myCors(corsOptions))
app.use(myCors(corsOptions))
// --------------------
//  Router
// --------------------
app.use(myRouter)
// --------------------
// Knex
// --------------------
let KNEX_CLIENT
let KNEX_HOST
let KNEX_USER
let KNEX_PWD
let KNEX_DATABASE
let KNEX_PORT
getknexparams()
const db = knex({
  client: KNEX_CLIENT,
  connection: {
    host: KNEX_HOST,
    user: KNEX_USER,
    password: KNEX_PWD,
    database: KNEX_DATABASE,
    port: KNEX_PORT
  }
})
//
//  Log setup
//
console.log(
  `${moduleName} Database Connection==> Client(${KNEX_CLIENT}) host(${KNEX_HOST}) user(${KNEX_USER}) database(${KNEX_DATABASE})`
)
//.............................................................................
// Routes
//.............................................................................
const { URL_HELLO, URL_SIGNIN, URL_TABLES, URL_REGISTER } = require('../constants.js')
// --------------------
//.  Routes - Hello
// --------------------
myRouter.post(URL_HELLO, (req, res) => {
  logHello(req)
  Hello.Hello(req, res, db, logCounter)
})
// --------------------
//.  Routes - Tables
// --------------------
myRouter.post(URL_TABLES, (req, res) => {
  logRawTables(req, 'POST', 'RAW', 'Raw')
  Raw.Raw(req, res, db, logCounter)
})
myRouter.delete(URL_TABLES, (req, res) => {
  logRawTables(req, 'DELETE', 'RAW', 'Raw')
  Raw.Raw(req, res, db, logCounter)
})
// --------------------
//.  Routes - SignIn
// --------------------
myRouter.post(URL_SIGNIN, (req, res) => {
  logRawSignIn(req, 'POST Signin')
  Signin.Signin(req, res, db, logCounter)
})
// --------------------
//.  Routes - Register
// --------------------
myRouter.post(URL_REGISTER, (req, res) => {
  logRawSignIn(req, 'POST Register')
  Register.Register(req, res, db, logCounter)
})
//.............................................................................
//.  Start Server
//.............................................................................
let serverPort
getServerPort()
const TimeStamp = format(new Date(), 'HHmmss')
let logMessage = `Server.. ${logCounter} Time:${TimeStamp} Module(${moduleName}) running on PORT(${serverPort})`
const server = app.listen(serverPort, () => console.log(logMessage))
const { KEEP_ALIVE_TIMEOUT, HEADERS_TIMEOUT } = require('../constants.js')
server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT
server.headersTimeout = HEADERS_TIMEOUT
//.............................................................................
//.  get the WhiteList
//.............................................................................
function getWhiteList() {
  const {
    CORS_WHITELIST_SRVREM_DB1,
    CORS_WHITELIST_SRVREM_DB2,
    CORS_WHITELIST_SRVREM_DB3,
    CORS_WHITELIST_SRVREM_DB4,
    CORS_WHITELIST_SRVLOC_DB1,
    CORS_WHITELIST_SRVLOC_DB2,
    CORS_WHITELIST_SRVLOC_DB3,
    CORS_WHITELIST_SRVLOC_DB4,
    CORS_WHITELIST_SRVLOC_DB6,
    CORS_WHITELIST_SRVLOC_DB7
  } = require('../constants.js')
  //
  //  Determimne the correct whitelist
  //
  switch (server_database) {
    case '01':
      cors_Whitelist = CORS_WHITELIST_SRVREM_DB1
      break
    case '02':
      cors_Whitelist = CORS_WHITELIST_SRVREM_DB2
      break
    case '03':
      cors_Whitelist = CORS_WHITELIST_SRVREM_DB3
      break
    case '04':
      cors_Whitelist = CORS_WHITELIST_SRVREM_DB4
      break
    case '11':
      cors_Whitelist = CORS_WHITELIST_SRVLOC_DB1
      break
    case '12':
      cors_Whitelist = CORS_WHITELIST_SRVLOC_DB2
      break
    case '13':
      cors_Whitelist = CORS_WHITELIST_SRVLOC_DB3
      break
    case '14':
      cors_Whitelist = CORS_WHITELIST_SRVLOC_DB4
      break
    case '16':
      cors_Whitelist = CORS_WHITELIST_SRVLOC_DB6
      break
    case '17':
      cors_Whitelist = CORS_WHITELIST_SRVLOC_DB7
      break
    default:
  }
}
//.............................................................................
//.  get the KNEX parameters
//.............................................................................
function getknexparams() {
  //
  // Database 1
  //
  const {
    KNEX_PORT1,
    KNEX_CLIENT1,
    KNEX_HOST1,
    KNEX_USER1,
    KNEX_PWD1,
    KNEX_DATABASE1
  } = require('../constants.js')
  //
  // Database 2
  //
  const {
    KNEX_PORT2,
    KNEX_CLIENT2,
    KNEX_HOST2,
    KNEX_USER2,
    KNEX_PWD2,
    KNEX_DATABASE2
  } = require('../constants.js')
  //
  // Database 3
  //
  const {
    KNEX_PORT3,
    KNEX_CLIENT3,
    KNEX_HOST3,
    KNEX_USER3,
    KNEX_PWD3,
    KNEX_DATABASE3
  } = require('../constants.js')
  //
  // Database 4
  //
  const {
    KNEX_PORT4,
    KNEX_CLIENT4,
    KNEX_HOST4,
    KNEX_USER4,
    KNEX_PWD4,
    KNEX_DATABASE4
  } = require('../constants.js')
  //
  // Database 6
  //
  const {
    KNEX_PORT6,
    KNEX_CLIENT6,
    KNEX_HOST6,
    KNEX_USER6,
    KNEX_PWD6,
    KNEX_DATABASE6
  } = require('../constants.js')
  //
  // Database 7
  //
  const {
    KNEX_PORT7,
    KNEX_CLIENT7,
    KNEX_HOST7,
    KNEX_USER7,
    KNEX_PWD7,
    KNEX_DATABASE7
  } = require('../constants.js')
  //
  //  Set KNEX
  //
  switch (server_database) {
    case '01':
      KNEX_CLIENT = KNEX_CLIENT1
      KNEX_HOST = KNEX_HOST1
      KNEX_USER = KNEX_USER1
      KNEX_PWD = KNEX_PWD1
      KNEX_DATABASE = KNEX_DATABASE1
      KNEX_PORT = KNEX_PORT1
      break
    case '02':
      KNEX_CLIENT = KNEX_CLIENT2
      KNEX_HOST = KNEX_HOST2
      KNEX_USER = KNEX_USER2
      KNEX_PWD = KNEX_PWD2
      KNEX_DATABASE = KNEX_DATABASE2
      KNEX_PORT = KNEX_PORT2
      break
    case '03':
      KNEX_CLIENT = KNEX_CLIENT3
      KNEX_HOST = KNEX_HOST3
      KNEX_USER = KNEX_USER3
      KNEX_PWD = KNEX_PWD3
      KNEX_DATABASE = KNEX_DATABASE3
      KNEX_PORT = KNEX_PORT3
      break
    case '04':
      KNEX_CLIENT = KNEX_CLIENT4
      KNEX_HOST = KNEX_HOST4
      KNEX_USER = KNEX_USER4
      KNEX_PWD = KNEX_PWD4
      KNEX_DATABASE = KNEX_DATABASE4
      KNEX_PORT = KNEX_PORT4
      break
    case '11':
      KNEX_CLIENT = KNEX_CLIENT1
      KNEX_HOST = KNEX_HOST1
      KNEX_USER = KNEX_USER1
      KNEX_PWD = KNEX_PWD1
      KNEX_DATABASE = KNEX_DATABASE1
      KNEX_PORT = KNEX_PORT1
      break
    case '12':
      KNEX_CLIENT = KNEX_CLIENT2
      KNEX_HOST = KNEX_HOST2
      KNEX_USER = KNEX_USER2
      KNEX_PWD = KNEX_PWD2
      KNEX_DATABASE = KNEX_DATABASE2
      KNEX_PORT = KNEX_PORT2
      break
    case '13':
      KNEX_CLIENT = KNEX_CLIENT3
      KNEX_HOST = KNEX_HOST3
      KNEX_USER = KNEX_USER3
      KNEX_PWD = KNEX_PWD3
      KNEX_DATABASE = KNEX_DATABASE3
      KNEX_PORT = KNEX_PORT3
      break
    case '14':
      KNEX_CLIENT = KNEX_CLIENT4
      KNEX_HOST = KNEX_HOST4
      KNEX_USER = KNEX_USER4
      KNEX_PWD = KNEX_PWD4
      KNEX_DATABASE = KNEX_DATABASE4
      KNEX_PORT = KNEX_PORT4
      break
    case '16':
      KNEX_CLIENT = KNEX_CLIENT6
      KNEX_HOST = KNEX_HOST6
      KNEX_USER = KNEX_USER6
      KNEX_PWD = KNEX_PWD6
      KNEX_DATABASE = KNEX_DATABASE6
      KNEX_PORT = KNEX_PORT6
      break
    case '17':
      KNEX_CLIENT = KNEX_CLIENT7
      KNEX_HOST = KNEX_HOST7
      KNEX_USER = KNEX_USER7
      KNEX_PWD = KNEX_PWD7
      KNEX_DATABASE = KNEX_DATABASE7
      KNEX_PORT = KNEX_PORT7
      break
    default:
  }
}
//.............................................................................
//.  get the SERVER Port
//.............................................................................
function getServerPort() {
  //
  // Server Ports
  //
  const {
    SERVERPORT_SRVREM_DB1,
    SERVERPORT_SRVLOC_DB1,
    SERVERPORT_SRVREM_DB2,
    SERVERPORT_SRVLOC_DB2,
    SERVERPORT_SRVREM_DB3,
    SERVERPORT_SRVLOC_DB3,
    SERVERPORT_SRVREM_DB4,
    SERVERPORT_SRVLOC_DB4,
    SERVERPORT_SRVLOC_DB6,
    SERVERPORT_SRVLOC_DB7
  } = require('../constants.js')
  //
  //  server_database connection
  //
  switch (server_database) {
    case '01':
      serverPort = SERVERPORT_SRVREM_DB1
      break
    case '02':
      serverPort = SERVERPORT_SRVREM_DB2
      break
    case '03':
      serverPort = SERVERPORT_SRVREM_DB3
      break
    case '04':
      serverPort = SERVERPORT_SRVREM_DB4
      break
    case '11':
      serverPort = SERVERPORT_SRVLOC_DB1
      break
    case '12':
      serverPort = SERVERPORT_SRVLOC_DB2
      break
    case '13':
      serverPort = SERVERPORT_SRVLOC_DB3
      break
    case '14':
      serverPort = SERVERPORT_SRVLOC_DB4
      break
    case '16':
      serverPort = SERVERPORT_SRVLOC_DB6
      break
    case '17':
      serverPort = SERVERPORT_SRVLOC_DB7
      break
    default:
  }
}
//.............................................................................
//.  Log the Body to the console
//.............................................................................
function logRawTables(req, fetchAction, fetchRoute, handler) {
  //
  //  Destructure Parameters
  //
  const { sqlClient, sqlAction, sqlString, sqlTable, sqlWhere, sqlOrderByRaw, sqlRow, sqlKeyName } =
    req.body
  //
  //  Timestamp and Counter
  //
  const TimeStamp = format(new Date(), 'HHmmss')
  logCounter++
  //
  //  Format Message & Log
  //
  let logMessage = `Server.. ${logCounter} Time:${TimeStamp} Module(${moduleName})`
  if (sqlTable) logMessage = logMessage + ` Table(${sqlTable})`
  logMessage =
    logMessage +
    ` Handler(${handler}) Client(${sqlClient}) Action(${fetchAction}) Route(${fetchRoute}) Sql(${sqlAction})`

  if (sqlString) logMessage = logMessage + ` String(${sqlString})`
  if (sqlWhere) logMessage = logMessage + ` Where(${sqlWhere})`
  if (sqlOrderByRaw) logMessage = logMessage + ` OrderByRaw(${sqlOrderByRaw})`
  if (sqlRow) logMessage = logMessage + ` Row(Data)`
  if (sqlKeyName) logMessage = logMessage + ` KeyName(${sqlKeyName})`

  console.log(logMessage)
}
//.............................................................................
//.  Log the Body to the console
//.............................................................................
function logRawSignIn(req, fetchAction) {
  //
  //  Destructure Parameters
  //
  const { user, name, sqlClient } = req.body
  const { id } = req.params
  //
  //  Counter
  //
  const TimeStamp = format(new Date(), 'HHmmss')
  logCounter = logCounter + 2
  //
  // Format message & Log
  //
  let logMessage = `Server.. ${logCounter} Time:${TimeStamp} Module(${moduleName}) sqlClient(${sqlClient}) fetchAction(${fetchAction}) User(${user})`
  if (name) logMessage.concat(` Name(${name})`)
  if (id) logMessage.concat(` ID(${id})`)
  console.log(logMessage)
}
//.............................................................................
//.  Log the Body to the console
//.............................................................................
function logHello(req) {
  //
  //  Destructure Parameters
  //
  const { sqlClient, helloType } = req.body
  //
  //  Counter
  //
  const TimeStamp = format(new Date(), 'HHmmss')
  logCounter++
  //
  // Format message & Log
  //
  let logMessage = `Server.. ${logCounter} Time:${TimeStamp} Module(${moduleName}) sqlClient(${sqlClient}) HelloType(${helloType})`
  console.log(logMessage)
}
