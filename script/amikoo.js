const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://10.215.56.158')

var command = ''
//Actual Code//

const exec = require('child_process').exec;

function puts(error, stdout, stderr) { sys.puts(stdout) }

function espeak(phrase) {
  var sleep = require('sleep')
  exec("echo " + phrase + " | espeak -ves -w audio.wav", puts);
  sleep.msleep(500);
  exec("aplay audio.wav", puts);  
}

function talk(phrase,languaje){
  if(languaje==1){
    exec("echo " + phrase + " | espeak -ves -w audio.wav", puts);}
  else{
    exec("echo " + phrase + " | espeak -ven -w audio.wav", puts);}
  exec("aplay audio.wav", puts);  
}

var state = 'closed'

client.on('connect', () => {

	client.subscribe('lupe/leftup')
	client.subscribe('lupe/leftdown')
	client.subscribe('lupe/leftfold')
	client.subscribe('lupe/leftunfold')
	client.subscribe('lupe/moveleft')
	client.subscribe('lupe/headleft')
	client.subscribe('lupe/headright')
	client.subscribe('lupe/moveforward')
	client.subscribe('lupe/movestop')
	client.subscribe('lupe/movebackward')
	client.subscribe('lupe/rightup')
	client.subscribe('lupe/rightdown')
	client.subscribe('lupe/rightfold')
	client.subscribe('lupe/rightunfold')
	client.subscribe('lupe/moveright')
	client.subscribe('lupe/resetall')
	client.subscribe('lupe/bienvenida')
	client.subscribe('lupe/agradece')
	client.subscribe('lupe/dance')
	client.subscribe('lupe/creador')
	client.subscribe('lupe/norte')

	//Comandos de voz
	client.subscribe('lupe/inicial')
	client.subscribe('lupe/emocion')
	client.subscribe('lupe/porsupuesto')
	client.subscribe('lupe/cerebro')
	client.subscribe('lupe/inteledison')

	//Saber si lupe esta conectada
	client.publish('lupe/connected', '1')

})

client.on('message', (topic,message) => {
	console.log('receive message %s %s', topic, message)

	switch(topic){
	       case 'lupe/open':
      			return handleRequestOpen(message)
    	       case 'lupe/close':
		      return handleRequestClose(message)
   	       case 'lupe/say':
     		       return handleRequestSay(message,0)
               case 'lupe/decir':
                       return handleRequestSay(message,1)
		case 'lupe/leftup':
			command = '00'
			break;
		case 'lupe/inicial':
			command = '40'
			break;
		case 'lupe/emocion':
			command = '41'
			break;
		case 'lupe/porsupuesto':
			command = '42'
			break;
		case 'lupe/cerebro':
			command = '43'
			break;
		case 'lupe/inteledison':
			command = '44'
			break;
		case 'lupe/leftdown':
			command = '20'
			break;			
		case 'lupe/leftfold':
			command = '01'
			break;
		case 'lupe/leftunfold':
			command = '21'
			break;
		case 'lupe/moveleft':
			command = '02'
			break;
		case 'lupe/headleft':	
			command = '04'
			break;
		case 'lupe/headright':	
			command = '24'
			break;
		case 'lupe/moveforward':
			command = '05'
			break;
		case 'lupe/movestop':	
			command = '06'
			break;
		case 'lupe/movebackward':
			command = '07'
			break;
		case 'lupe/rightup'	:
			command = '08'
			break;
		case 'lupe/rightdown':
			command = '28'
			break;
		case 'lupe/rightfold':
			command = '09'
			break;
		case 'lupe/rightunfold':
			command = '29'
			break;
		case 'lupe/moveright':	
			command = '10'
			break;
		case 'lupe/resetall':
			command = '11'
			break;
		case 'lupe/bienvenida':	
			command = '80'
			break;
		case 'lupe/agradece':
			command = '81'
			break;
		case 'lupe/dance':	
			command = '82'
			break;
		case 'lupe/creador':
			command = '83'
			break;
		case 'lupe/norte':	
			command = '84'
			break;
	}

	accionLupe(command);

})


function sendStateUpdate () {  
  console.log('Sending state %s', state)
  client.publish('lupe/state', state)
}

function handleRequestOpen (message) {  
  if (state !== 'open' && state !== 'opening') {
    console.log('Opening Lupe')
    state = 'opening'
    espeak('Opening')
    sendStateUpdate()

    setTimeout(function (){
      state = 'open'
      sendStateUpdate()
    }, 5000)
  }
}

function handleRequestClose (message) {  
  if (state !== 'closed' && state !== 'closing') {
    state = 'closing'

    espeak('Closing')
    sendStateUpdate()

    setTimeout(function () {
      state = 'closed'
      sendStateUpdate()
    }, 5000)
  }
}

function handleRequestSay (message,languaje) {
    talk(message,languaje)
}

function handleLupe (message) {
  console.log('Action %s', message)
}

function handleSpeakLupe (message) {
  espeak(message)
}

function handleAppExit (options, err) {
  if (err) {
    console.log(err.stack)
  }

  if (options.cleanup) {
    client.publish('lupe/connected', 'false')
  }

  if (options.exit) {
    process.exit()
  }
}


function accionLupe(number){
	exec('/home/root/HochobAction ' + number, (e, stdout, stderr) =>{
		if(e instanceof Error){
			console.error(e);
			throw e;
		}
		console.log('stdout ', stdout);
		console.log('stderr ', stderr);
	});
}

//      Handler for exits      //
function handleAppExit(options, err){
	if(err){
		console.log(err.stack)
	}

	if(options.cleanup){
		client.publish('lupe/connected', '0')
	}

	if(options.exit){
		process.exit()
	}
}

// HANDLERS the differents ways an application can shutdown

process.on('exit', handleAppExit.bind(null,{
	cleanup: true
}))

process.on('SIGINT', handleAppExit.bind(null,{
	exit: true
}))

process.on('uncaughtException', handleAppExit.bind(null,{
	exit: true
}))
