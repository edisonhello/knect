import { ServerEvents } from 'knect-common/src/SocketEvents.js';
import PlayerStatusType from './constant/PlayerStatusType.js';
import ServerSocketWrapper from './ServerSocketWrapper.js';
import getUniqueName from './util/generateName.js';

/** @typedef {import('socket.io').Socket} Socket */
/** @typedef {import('./index.js').GameCenter} GameCenter */

export default class Player {
  /**
   * @param {GameCenter} gc
   * @param {Socket} _socket
   */
  constructor(gc, _socket) {
    this.gc = gc;
    this.id = _socket.id;
    this.name = getUniqueName();
    this.roomId = null;
    this.socket = new ServerSocketWrapper(gc, this, _socket);
    this.socket.emit(ServerEvents.SetPlayerName, this.name);

    this.status = PlayerStatusType.Lobby;
    gc.lobby.join(this.id);
  }

  get id() {
    return this.socket.id;
  }

  sendChat({ playerId, msg, time }) {
    const { name } = this.gc.allPlayers.getById(playerId);
    if (PlayerStatusType.is.Lobby(this.status)) {
      this.gc.lobby.emitAll(ServerEvents.SendChat, { name, msg, time });
    }
    else if (PlayerStatusType.is.Room(this.status)) {
      const room = this.gc.rooms.getById(this.roomId);
      room.emitAll(ServerEvents.SendChat, { name, msg, time });
    }
    else {
      throw new Error(`Player '${name}' trying to send chat is neither in lobby nor any room`);
    }
  }
}
