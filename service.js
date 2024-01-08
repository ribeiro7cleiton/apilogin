var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'SOPASTA_LOGIN',
  description: 'Api para logins em apps da Sopasta',
  script: 'C:\\Apis\\login\\dist\\server.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.logOnAs.domain = 'DOMAIN';
svc.logOnAs.account = 'USUARIO';
svc.logOnAs.password = 'SENHA';
svc.install();