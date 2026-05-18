import { getLeaderboard } from "@/lib/redis";
import { jsonOk } from "@/lib/server/api";

export async function GET() {
  const leaderboard = await getLeaderboard(20);
  return jsonOk({
    leaderboard: leaderboard.map((row, index) => ({
      rank: index + 1,
      participant: row.key,
      points: row.score,
    })),
  });
}

