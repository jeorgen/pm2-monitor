var client = require('riemann').createClient({
    host: 'localhost',
    port: 5555
})
var hostname = require('os').hostname()
var ipm2 = require('pm2-interface')()
var JOT = require('javascript-object-templates')

var memoryTemplate = {
    host: hostname,
    service: '',
    metric_f: 0.0,
    time: 0.0
}

var stateTemplate = {
    host: hostname,
    state: '',
    service: '',
    time: 0.0
}

client.on('connect', function() {
    console.log("Connected to Riemann")
})


function sendEvent(event) {
    client.send(client.Event(event), client.tcp)

}

function riemannState(status) {
    if (status === 'online') {
        return 'ok'
    }
    return 'error'
}

function getMonitorData() {
    var time = new Date() / 1000
    ipm2.rpc.getMonitorData({}, function(err, dt) {
        for (server of dt) {
            console.log(dt)
            var status = new JOT(stateTemplate)
            status.merge({
                service: 'pm2.' + server.name + '.status',
                state: riemannState(server.pm2_env.status),
                description: server.pm2_env.status,
                time: time
            })
            sendEvent(status.getObject())

            var memory = new JOT(memoryTemplate)
            memory.merge({
                service: 'pm2.' + server.name + '.memory',
                metric_f: server.monit.memory,
                time: time
            })
            sendEvent(memory.getObject())
        }

    })
    setTimeout(getMonitorData, 10000)
}

ipm2.on('ready', function() {
    console.log('Connected to pm2');
    getMonitorData()

});