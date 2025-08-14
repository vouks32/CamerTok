//const ipadress = '16.170.236.54'
//const baseUrl = 'http://16.170.236.54'

// Local Test
const ipadress = '192.168.1.189'
const baseUrl = 'http://192.168.1.189'

const PlayerApiURL = baseUrl + '/api/players';
const ActionsApiURL = baseUrl + '/api/actions';
const RoleApiURL = baseUrl + '/api/playerroles';
const FileApiURL = baseUrl + '/api/file';
const MessagesApiURL = baseUrl + '/api/messages';
const NewMessagesApiURL = baseUrl + '/api/newmessages';

async function fetchBlob(url) {
    const response = await fetch(url);

    // Here is the significant part 
    // reading the stream as a blob instead of json
    return response.blob();
}

export { PlayerApiURL, RoleApiURL, FileApiURL, MessagesApiURL, NewMessagesApiURL, ActionsApiURL, ipadress, fetchBlob }