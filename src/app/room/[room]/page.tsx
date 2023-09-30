import { RoomCounter } from "@/components/RoomCounter";
import { RoomProvider } from "@/components/RoomProvider";

interface Params {
  room: string;
}

export default async function Page({ params }: { params: Params }) {
  return (
    <>
      <h1 className="text-lg font-semibold py-3">Room: {params.room}</h1>
      <RoomProvider fallback={<div>Loading...</div>} room={params.room}>
        <RoomCounter />
      </RoomProvider>
    </>
  );
}
