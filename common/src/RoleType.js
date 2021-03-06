import Enum from './Enum.js';
import PieceType from './games/PieceType.js';

// eslint-disable-next-line import/no-mutable-exports
let RoleType = {
  PlayerA: 1,
  PlayerB: 2,
  None: 3
};

RoleType = new Enum(RoleType);

export default RoleType;

export function getPieceType(turns) {
  return PieceType[RoleType.nameFrom(turns)];
}
