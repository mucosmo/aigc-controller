
import { Provide, Inject, App } from '@midwayjs/decorator';


import { Context, Application } from '@/interface';


const dhPeersRedisKey = 'dhPeers';

const OneYearSeconds = 60 * 60 * 24 * 365;

const MEDIASOUP_SERVER_HOST = process.env.MEDIASOUP_SERVER_HOST;

@Provide()
export class RoomService {
    @Inject()
    ctx: Context;

    @App()
    private _app!: Application;


    /**get room info*/
    async getRoomStats() {
        const url = `${MEDIASOUP_SERVER_HOST}/rooms/stats`;
        const result = await this._app.curl(url, {
            method: 'POST',
            data: {},
            dataType: 'json',
            headers: {
                'content-type': 'application/json',
            },
        });
        const peers = result.data;
        // let dhPeers = JSON.parse(await this._app.redis.get(dhPeersRedisKey));
        // dhPeers = dhPeers ?? [];
        // dhPeers.map(dhPeer => {
        //     const peer = peers.find(peer => peer.room === dhPeer.room);
        //     if (peer) {
        //         peer.members.push(...dhPeer.members)
        //         peer.members = [...new Set(peer.members)];
        //     } else {
        //         peers.push(dhPeer)
        //     }
        //     return dhPeer;
        // })
        return peers;
    }

    /**reset room*/
    async resetRoom(roomId: string) {
        const url = `${MEDIASOUP_SERVER_HOST}/rtc/room/reset`;
        const result = await this._app.curl(url, {
            method: 'POST',
            data: { roomId },
            dataType: 'json',
            headers: {
                'content-type': 'application/json',
            },
        });
        return result.data;
    }


    /**create new room from node*/
    async nodeCreateRoom(data) {
        const url = `${MEDIASOUP_SERVER_HOST}/rooms/node/create`;
        const result = await this._app.curl(url, {
            method: 'POST',
            data,
            dataType: 'json',
            headers: {
                'content-type': 'application/json',
            },
        });
        return result.data;
    }



    /**new dh peer start by ffmpeg get in*/
    async newDhPeer(roomId: string, peerId: string) {
        let dhPeers = JSON.parse(await this._app.redis.get(dhPeersRedisKey));
        dhPeers = dhPeers ?? [];
        const room = dhPeers.find(r => r.room === roomId);
        if (!room) {
            dhPeers.push({
                room: roomId,
                members: [peerId]
            })
        } else {
            room.members.push(peerId);
            room.members = [...new Set(room.members)];
        }
        await this._app.redis.set(dhPeersRedisKey, JSON.stringify(dhPeers), 'EX', OneYearSeconds);
        return dhPeers;
    }

    /**new dh peer start by ffmpeg get in*/
    async deleteDhPeer(roomId: string, peerId: string) {
        let dhPeers = JSON.parse(await this._app.redis.get(dhPeersRedisKey));
        dhPeers = dhPeers ?? [];
        const room = dhPeers.find(r => r.room === roomId);
        if (room) {
            const members = room.members;
            const indexToRemove = members.indexOf(peerId);
            if (indexToRemove > -1) {
                members.splice(indexToRemove, 1);
            }
        }
        dhPeers = dhPeers.filter(dhPeer => dhPeer.members.length > 0);
        await this._app.redis.set(dhPeersRedisKey, JSON.stringify(dhPeers), 'EX', OneYearSeconds);
        return dhPeers;
    }


}