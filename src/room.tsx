import React, { use, useContext, useEffect, useMemo, useState } from "react";
import { proxy } from "valtio";
import { bind } from "valtio-yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import YPartyKitProvider from "y-partykit/provider";
import useYProvider from "y-partykit/react";
import * as Y from "yjs";

const RoomContext = React.createContext<{ room: string; proxy: object } | null>(
  null
);

interface RoomConnection {
  provider: YPartyKitProvider;
  listeners: number;
  persister: IndexeddbPersistence;
}

const rooms = new Map<string, RoomConnection>();

export function useRoomDoc(room: string) {
  const [doc, setDoc] = useState<Y.Doc | undefined>(
    rooms.get(room)?.provider.doc
  );
  useEffect(() => {
    const roomConn = rooms.get(room);
    if (roomConn) {
      setDoc(roomConn.provider.doc);
    }

    // Set up doc + provider + persistense
    const doc = new Y.Doc();
    const provider = new YPartyKitProvider("localhost:1999", room, doc);
    const persister = new IndexeddbPersistence(room, doc);
    // Doc is only ready once it's been loaded from storage
    persister.on("synced", () => setDoc(doc));
    rooms.set(room, { provider, persister, listeners: 1 });

    return () => {
      // If there's an error here, it's possible the room connection was already deleted.
      // This would be an error in our connection management
      const roomConn = rooms.get(room)!;
      roomConn.listeners -= 1;
      if (roomConn.listeners == 0) {
        roomConn.persister.destroy();
        roomConn.provider.destroy();
        rooms.delete(room);
      }
    };
  }, [room]);

  return doc;
}

export async function useRoomState<T extends Record<string, unknown> = never>(
  room: string
) {
  const doc = useRoomDoc(room);
  const [prox, setProx] = useState<T>();
  useEffect(() => {
    if (doc) {
      const y = doc.getMap("valtio");
      const p = proxy<T>();
      setProx(p);
      return bind(p, y);
    }
  }, [doc]);

  return prox
}

export async function createRoomState<T extends object = never>(
  host: string,
  room: string
) {
  const RoomStateProvider = ({
    fallback,
    children,
  }: {
    fallback: React.ReactNode;
    children: React.ReactNode;
  }) => {
    const [ready, setReady] = React.useState(false);

    const yProvider = useYProvider({
      host,
      room,
      options: {},
    });

    const yMap = yProvider.doc.getMap("valtio");

    React.useEffect(() => {
      const persister = new IndexeddbPersistence(room, yProvider.doc);
      persister.on("synced", () => setReady(true));

      return () => {
        persister.destroy();
        setReady(false);
      };
    }, [room, yProvider.doc]);

    const state = React.useMemo(() => proxy({ count: 0 }), []);
    React.useEffect(() => bind(state, yMap), [state, yMap]);

    if (!ready) {
      return { fallback };
    }

    // Avoid context rerenders
    const context = useMemo(() => ({ room, proxy: state }), [room, state]);

    return (
      <RoomContext.Provider value={context}>{children}</RoomContext.Provider>
    );
  };

  const useState = () => {
    const state = useContext(RoomContext);
    if (!state) {
      throw new Error("");
    }
  };

  return { Provider: RoomStateProvider };
  // return { proxy, snapshot };
}
