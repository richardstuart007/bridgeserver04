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
const RegisterPwd = require('../controllers/RegisterPwd')
const Signin = require('../controllers/Signin')
//
//  Debug Settings
//
const debugSettings = require('../debug/debugSettings')
const debugLog = debugSettings.debugSettings()
//.............................................................................
//.  Initialisation
//.............................................................................
//
//  Environment variables package
//
require('dotenv').config()
//
//  Arguments
//
const node_module = process.argv[0]
const script_path = process.argv[1]
let server_database = process.argv[2]
const env_database = process.env.DATABASE
if (debugLog) console.log('node_module ', node_module)
if (debugLog) console.log('script_path ', script_path)
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
const URL_HELLO = process.env.URL_HELLO
const URL_SIGNIN = process.env.URL_SIGNIN
const URL_TABLES = process.env.URL_TABLES
const URL_REGISTER = process.env.URL_REGISTER
const URL_REGISTERPWD = process.env.URL_REGISTERPWD
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
// --------------------
//.  Routes - RegisterPwd
// --------------------
myRouter.post(URL_REGISTERPWD, (req, res) => {
  logRawSignIn(req, 'POST RegisterPwd')
  RegisterPwd.RegisterPwd(req, res, db, logCounter)
})
//.............................................................................
//.  Start Server
//.............................................................................
let serverPort
getServerPort()
const TimeStamp = format(new Date(), 'HHmmss')
let logMessage = `Server.. ${logCounter} Time:${TimeStamp} Module(${moduleName}) running on PORT(${serverPort})`
const server = app.listen(serverPort, () => console.log(logMessage))
const KEEP_ALIVE_TIMEOUT = process.env.KEEP_ALIVE_TIMEOUT | 120000
const HEADERS_TIMEOUT = process.env.HEADERS_TIMEOUT | 120000
if (debugLog) console.log('KEEP_ALIVE_TIMEOUT ', KEEP_ALIVE_TIMEOUT)
server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT
server.headersTimeout = HEADERS_TIMEOUT
//.............................................................................
//.  get the WhiteList
//.............................................................................
function getWhiteList() {
  const CORS_WHITELIST_SRVREM_DB1 = process.env.CORS_WHITELIST_SRVREM_DB1
  const CORS_WHITELIST_SRVREM_DB2 = process.env.CORS_WHITELIST_SRVREM_DB2
  const CORS_WHITELIST_SRVREM_DB3 = process.env.CORS_WHITELIST_SRVREM_DB3
  const CORS_WHITELIST_SRVREM_DB4 = process.env.CORS_WHITELIST_SRVREM_DB4
  const CORS_WHITELIST_SRVLOC_DB1 = process.env.CORS_WHITELIST_SRVLOC_DB1
  const CORS_WHITELIST_SRVLOC_DB2 = process.env.CORS_WHITELIST_SRVLOC_DB2
  const CORS_WHITELIST_SRVLOC_DB3 = process.env.CORS_WHITELIST_SRVLOC_DB3
  const CORS_WHITELIST_SRVLOC_DB4 = process.env.CORS_WHITELIST_SRVLOC_DB4
  const CORS_WHITELIST_SRVLOC_DB6 = process.env.CORS_WHITELIST_SRVLOC_DB6
  const CORS_WHITELIST_SRVLOC_DB7 = process.env.CORS_WHITELIST_SRVLOC_DB7
  //
  //  Determimne the correct whitelist
  //
  let cors_Whitelist_string
  switch (server_database) {
    case '01':
      cors_Whitelist_string = CORS_WHITELIST_SRVREM_DB1
      break
    case '02':
      cors_Whitelist_string = CORS_WHITELIST_SRVREM_DB2
      break
    case '03':
      cors_Whitelist_string = CORS_WHITELIST_SRVREM_DB3
      break
    case '04':
      cors_Whitelist_string = CORS_WHITELIST_SRVREM_DB4
      break
    case '11':
      cors_Whitelist_string = CORS_WHITELIST_SRVLOC_DB1
      break
    case '12':
      cors_Whitelist_string = CORS_WHITELIST_SRVLOC_DB2
      break
    case '13':
      cors_Whitelist_string = CORS_WHITELIST_SRVLOC_DB3
      break
    case '14':
      cors_Whitelist_string = CORS_WHITELIST_SRVLOC_DB4
      break
    case '16':
      cors_Whitelist_string = CORS_WHITELIST_SRVLOC_DB6
      break
    case '17':
      cors_Whitelist_string = CORS_WHITELIST_SRVLOC_DB7
      break
    default:
  }
  if (debugLog) console.log('cors_Whitelist_string ', cors_Whitelist_string)
  cors_Whitelist = cors_Whitelist_string.split(', ')
  if (debugLog) console.log('cors_Whitelist ', cors_Whitelist)
}
//.............................................................................
//.  get the KNEX parameters
//.............................................................................
function getknexparams() {
  //
  // Database 1
  //
  const KNEX_PORT1 = process.env.KNEX_PORT1
  const KNEX_CLIENT1 = process.env.KNEX_CLIENT1
  const KNEX_HOST1 = process.env.KNEX_HOST1
  const KNEX_USER1 = process.env.KNEX_USER1
  const KNEX_PWD1 = process.env.KNEX_PWD1
  const KNEX_DATABASE1 = process.env.KNEX_DATABASE1
  //
  // Database 2
  //
  const KNEX_PORT2 = process.env.KNEX_PORT2
  const KNEX_CLIENT2 = process.env.KNEX_CLIENT2
  const KNEX_HOST2 = process.env.KNEX_HOST2
  const KNEX_USER2 = process.env.KNEX_USER2
  const KNEX_PWD2 = process.env.KNEX_PWD2
  const KNEX_DATABASE2 = process.env.KNEX_DATABASE2
  //
  // Database 3
  //
  const KNEX_PORT3 = process.env.KNEX_PORT3
  const KNEX_CLIENT3 = process.env.KNEX_CLIENT3
  const KNEX_HOST3 = process.env.KNEX_HOST3
  const KNEX_USER3 = process.env.KNEX_USER3
  const KNEX_PWD3 = process.env.KNEX_PWD3
  const KNEX_DATABASE3 = process.env.KNEX_DATABASE3
  //
  // Database 4
  //
  const KNEX_PORT4 = process.env.KNEX_PORT4
  const KNEX_CLIENT4 = process.env.KNEX_CLIENT4
  const KNEX_HOST4 = process.env.KNEX_HOST4
  const KNEX_USER4 = process.env.KNEX_USER4
  const KNEX_PWD4 = process.env.KNEX_PWD4
  const KNEX_DATABASE4 = process.env.KNEX_DATABASE4
  //
  // Database 6
  //
  const KNEX_PORT6 = process.env.KNEX_PORT6
  const KNEX_CLIENT6 = process.env.KNEX_CLIENT6
  const KNEX_HOST6 = process.env.KNEX_HOST6
  const KNEX_USER6 = process.env.KNEX_USER6
  const KNEX_PWD6 = process.env.KNEX_PWD6
  const KNEX_DATABASE6 = process.env.KNEX_DATABASE6
  //
  // Database 7
  //
  const KNEX_PORT7 = process.env.KNEX_PORT7
  const KNEX_CLIENT7 = process.env.KNEX_CLIENT7
  const KNEX_HOST7 = process.env.KNEX_HOST7
  const KNEX_USER7 = process.env.KNEX_USER7
  const KNEX_PWD7 = process.env.KNEX_PWD7
  const KNEX_DATABASE7 = process.env.KNEX_DATABASE7
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
  const SERVERPORT_SRVREM_DB1 = process.env.SERVERPORT_SRVREM_DB1
  const SERVERPORT_SRVLOC_DB1 = process.env.SERVERPORT_SRVLOC_DB1
  const SERVERPORT_SRVREM_DB2 = process.env.SERVERPORT_SRVREM_DB2
  const SERVERPORT_SRVLOC_DB2 = process.env.SERVERPORT_SRVLOC_DB2
  const SERVERPORT_SRVREM_DB3 = process.env.SERVERPORT_SRVREM_DB3
  const SERVERPORT_SRVLOC_DB3 = process.env.SERVERPORT_SRVLOC_DB3
  const SERVERPORT_SRVREM_DB4 = process.env.SERVERPORT_SRVREM_DB4
  const SERVERPORT_SRVLOC_DB4 = process.env.SERVERPORT_SRVLOC_DB4
  const SERVERPORT_SRVLOC_DB6 = process.env.SERVERPORT_SRVLOC_DB6
  const SERVERPORT_SRVLOC_DB7 = process.env.SERVERPORT_SRVLOC_DB7
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
function logRawTables(req) {
  //
  //  Destructure Parameters
  //
  const { AxClient, AxAction, AxTable, AxSess, AxId, AxTry } = req.body
  //
  //  Timestamp and Counter
  //
  const TimeStamp = format(new Date(), 'HHmmss')
  logCounter++
  //
  //  Format Message & Log
  //
  let logMessage = `Server.. ${logCounter} Time:${TimeStamp} AxSess(${AxSess}) AxId(${AxId}) AxTry(${AxTry}) Module(${moduleName}) AxClient(${AxClient}) `
  if (AxTable) logMessage = logMessage + ` Table(${AxTable}) Sql(${AxAction})`
  console.log(logMessage)
}
//.............................................................................
//.  Log the Body to the console
//.............................................................................
function logRawSignIn(req, fetchAction) {
  //
  //  Destructure Parameters
  //
  const { user, name, AxClient, AxSess, AxId, AxTry } = req.body
  const { id } = req.params
  //
  //  Counter
  //
  const TimeStamp = format(new Date(), 'HHmmss')
  logCounter++
  //
  // Format message & Log
  //
  let logMessage = `Server.. ${logCounter} Time:${TimeStamp} AxSess(${AxSess}) AxId(${AxId}) AxTry(${AxTry}) Module(${moduleName}) AxClient(${AxClient}) fetchAction(${fetchAction}) User(${user})`
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
  const { AxClient, AxSess, AxId, AxTry } = req.body
  //
  //  Counter
  //
  const TimeStamp = format(new Date(), 'HHmmss')
  logCounter++
  //
  // Format message & Log
  //
  let logMessage = `Server.. ${logCounter} Time:${TimeStamp} AxSess(${AxSess}) AxId(${AxId}) AxTry(${AxTry}) Module(${moduleName}) AxClient(${AxClient}) Hello`
  console.log(logMessage)
}
