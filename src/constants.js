//------------------------------------------------------------------------
//  Database (Remote 1)
//------------------------------------------------------------------------
exports.KNEX_CLIENT1 = 'pg'
exports.KNEX_PORT1 = 5432
exports.KNEX_HOST1 = 'rosie.db.elephantsql.com'
exports.KNEX_USER1 = 'wdscnzxj'
exports.KNEX_PWD1 = 'O-7H6IKT6Hhi_xGU7J_rHSBjvbNO218s'
exports.KNEX_DATABASE1 = 'wdscnzxj'
//------------------------------------------------------------------------
//  Database (Remote 2)
//------------------------------------------------------------------------
exports.KNEX_CLIENT2 = 'pg'
exports.KNEX_PORT2 = 5975
exports.KNEX_HOST2 = 'containers-us-west-176.railway.app'
exports.KNEX_USER2 = 'postgres'
exports.KNEX_PWD2 = 'MpshoqIm2WsiSFOTH2j8'
exports.KNEX_DATABASE2 = 'railway'
//------------------------------------------------------------------------
//  Database (Remote 3)
//------------------------------------------------------------------------
exports.KNEX_CLIENT3 = 'pg'
exports.KNEX_PORT3 = 5432
exports.KNEX_HOST3 = 'rosie.db.elephantsql.com'
exports.KNEX_USER3 = 'wdscnzxj'
exports.KNEX_PWD3 = 'O-7H6IKT6Hhi_xGU7J_rHSBjvbNO218s'
exports.KNEX_DATABASE3 = 'wdscnzxj'
//------------------------------------------------------------------------
//  Database (Remote 4)
//------------------------------------------------------------------------
exports.KNEX_CLIENT4 = 'pg'
exports.KNEX_PORT4 = 5975
exports.KNEX_HOST4 = 'containers-us-west-176.railway.app'
exports.KNEX_USER4 = 'postgres'
exports.KNEX_PWD4 = 'MpshoqIm2WsiSFOTH2j8'
exports.KNEX_DATABASE4 = 'railway'
//------------------------------------------------------------------------
//  Database (Local 6)
//------------------------------------------------------------------------
exports.KNEX_CLIENT6 = 'pg'
exports.KNEX_HOST6 = '127.0.0.1'
exports.KNEX_USER6 = 'richa'
exports.KNEX_PWD6 = 'london'
exports.KNEX_DATABASE6 = 'bridge6'
//------------------------------------------------------------------------
//  Database (Local 7)
//------------------------------------------------------------------------
exports.KNEX_CLIENT7 = 'pg'
exports.KNEX_HOST7 = '127.0.0.1'
exports.KNEX_USER7 = 'richa'
exports.KNEX_PWD7 = 'london'
exports.KNEX_DATABASE7 = 'bridge7'
//------------------------------------------------------------------------
//  PORTS
//------------------------------------------------------------------------
exports.SERVERPORT_SRVREM_DB1 = 3901
exports.SERVERPORT_SRVREM_DB2 = 3902
exports.SERVERPORT_SRVREM_DB3 = 3903
exports.SERVERPORT_SRVREM_DB4 = 3904
exports.SERVERPORT_SRVLOC_DB1 = 3911
exports.SERVERPORT_SRVLOC_DB2 = 3912
exports.SERVERPORT_SRVLOC_DB3 = 3913
exports.SERVERPORT_SRVLOC_DB4 = 3914
exports.SERVERPORT_SRVLOC_DB6 = 3916
exports.SERVERPORT_SRVLOC_DB7 = 3917
//---------------------------------------------------------------------
//  corsWhitelist
//---------------------------------------------------------------------
exports.CORS_WHITELIST_SRVREM_DB1 = [
  'https://bridgeclient01.onrender.com',
  'https://bridgedataentry01.onrender.com',
  'http://localhost:3801',
  'http://localhost:3701'
]
exports.CORS_WHITELIST_SRVREM_DB2 = [
  'https://bridgeclient02.onrender.com',
  'https://bridgedataentry02.onrender.com',
  'http://localhost:3802',
  'http://localhost:3702'
]
exports.CORS_WHITELIST_SRVREM_DB3 = [
  'https://bridgeclient03.onrender.com',
  'https://bridgedataentry03.onrender.com',
  'http://localhost:3803',
  'http://localhost:3703'
]
exports.CORS_WHITELIST_SRVREM_DB4 = [
  'https://bridgeclient04.onrender.com',
  'https://bridgedataentry04.onrender.com',
  'http://localhost:3804',
  'http://localhost:3704'
]
exports.CORS_WHITELIST_SRVLOC_DB1 = ['http://localhost:3811', 'http://localhost:3711']
exports.CORS_WHITELIST_SRVLOC_DB2 = ['http://localhost:3812', 'http://localhost:3712']
exports.CORS_WHITELIST_SRVLOC_DB3 = ['http://localhost:3813', 'http://localhost:3713']
exports.CORS_WHITELIST_SRVLOC_DB4 = ['http://localhost:3814', 'http://localhost:3714']
exports.CORS_WHITELIST_SRVLOC_DB6 = ['http://localhost:3816', 'http://localhost:3716']
exports.CORS_WHITELIST_SRVLOC_DB7 = ['http://localhost:3817', 'http://localhost:3717']
//------------------------------------------------------------------------
//  URL
//------------------------------------------------------------------------
exports.URL_HELLO = '/QuizHello'
exports.URL_TABLES = '/QuizTables'
exports.URL_REGISTER = '/QuizRegister'
exports.URL_SIGNIN = '/QuizSignin'
//------------------------------------------------------------------------
//  Other
//------------------------------------------------------------------------
exports.KEEP_ALIVE_TIMEOUT = 300000
exports.HEADERS_TIMEOUT = 310000
