"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { proxy } from "valtio";
import { bind } from "valtio-yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import YPartyKitProvider from "y-partykit/provider";
import * as Y from "yjs";

export interface Room {
  count: number;
}

interface Props {
  room: string;
  fallback: React.ReactNode;
  children: React.ReactNode;
}

const RoomContext = createContext<Room | null>(null);

export function RoomProvider({ room, fallback, children }: Props) {
  const [state, setState] = useState<Room>();

  useEffect(() => {
    const doc = new Y.Doc();
    const yMap = doc.getMap("valtio");
    const provider = new YPartyKitProvider("localhost:1999", room, doc);
    const persistence = new IndexeddbPersistence(room, doc);
    const prox = proxy<Room>({ count: 0 });
    const unbind = bind(prox as any, yMap);

    persistence.on("synced", () => setState(prox));

    return () => {
      setState(undefined);
      unbind();
      persistence.destroy();
      provider.destroy();
    };
  }, [room]);

  if (!state) {
    return fallback;
  }

  return <RoomContext.Provider value={state}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const room = useContext(RoomContext);
  if (!room) {
    throw new Error("useRoom used outside a RoomProvider");
  }
  return room;
}
