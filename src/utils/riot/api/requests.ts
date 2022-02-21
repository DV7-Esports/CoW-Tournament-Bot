const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const requestsPerSecond: number = 20;
const requestsPer2Mins: number = 100;
let requestForTheLastSecond: number = 0;
let requestForTheLast2Minutes: number = 0;

async function request(): Promise<void> {
    requestForTheLast2Minutes += 1;
    requestForTheLastSecond += 1;
    setTimeout(() => {
        requestForTheLastSecond -= 1;
    }, 1 * 1000);
    setTimeout(() => {
        requestForTheLast2Minutes -= 1;
    }, (2 * 60 - 1) * 1000);
}

function getData(url: string, method: string = "GET", body: any = undefined, server: string = "europe"): string {
    if (requestForTheLastSecond === requestsPerSecond) {
        setTimeout(()=>{}, 1*1000);
    }
    if (requestForTheLast2Minutes === requestsPer2Mins) {
        setTimeout(()=>{}, 2*60*1000);
    }
    var xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open(method, 'https://' + server + '.api.riotgames.com' + url, false);

    xhr.setRequestHeader("X-Riot-Token", process.env.RIOT_API_KEY as string);

    if (body) {
        request();
        xhr.send(body);
    } else {
        request();
        xhr.send();
    }

    if (xhr.status !== 200) {
        throw `${xhr.status}: ${xhr.responseText}`;
    }

    return xhr.responseText;
}

export default getData;