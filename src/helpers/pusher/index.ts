import Pusher from "pusher";

var pusher = new Pusher({
    appId: '1090420',
    key: 'ca00d13b73656cd49464',
    secret: 'd25c558b181525a1a916',
    cluster: 'mt1',
    useTLS: true
});

export default pusher;