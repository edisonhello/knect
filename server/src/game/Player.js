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
    this.name = getUniqueName();
    this.roomId = null;
    this.socket = new ServerSocketWrapper(gc, this, _socket);
    this.socket.emit(ServerEvents.SetPlayerName, this.name);

    this.status = PlayerStatusType.Lobby;
  }

  init() {
    this.gc.lobby.join(this.id);
  }

  get id() {
    return this.socket.id;
  }

  sendChat(msg) {
    const { name } = this;
    const time = Date.now();
    if (PlayerStatusType.is.Lobby(this.status)) {
      this.gc.lobby.emitAll(ServerEvents.NotifyChat, { name, msg, time });
    }
    else if (PlayerStatusType.is.Room(this.status)) {
      const room = this.gc.rooms.getById(this.roomId);
      room.emitAll(ServerEvents.NotifyChat, { name, msg, time });
    }
    else {
      throw new Error(`Player '${name}' trying to send chat is neither in lobby nor any room`);
    }
  }

  joinRoom(roomId) {
    this.gc.getRoomById(roomId, { throwOnError: true });
    this.roomId = roomId;
  }

  /**
   * Return whether a player is in a room
   * @param {{ throwOnFalse: bool }} config // <- how
   * @return {bool} whether the player is in any room
   */
  isInRoom({ throwOnFalse = false }) {
    if (!this.roomId && throwOnFalse) {
      throw new Error('Player is not in any room');
    }
    return !!this.roomId;
  }

  receiveInvitation(playerId, roomId) {
    this.socket.emit(ServerEvents.NotifyInvitation, { playerId, roomId });
  }
}
