"use client";

import { useSnapshot } from "valtio";
import { useRoom } from "./RoomProvider";


export function RoomCounter() {
  const state = useRoom();
  const snapshot = useSnapshot(state);

  return (
    <div>
      <div>Count: {snapshot.count}</div>
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        onClick={() => state.count++}
      >
        Increment count
      </button>
    </div>
  );
}
