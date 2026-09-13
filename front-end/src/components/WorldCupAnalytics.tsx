"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type DataRecord = Record<string, any>;

type ChartCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function ChartCard({
  title,
  description,
  children,
}: ChartCardProps) {
  return (
    <section className="rounded-2xl border border-[#12577A] bg-[#0F1A23] p-5 shadow-lg">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          {description}
        </p>
      </div>

      <div className="h-[350px] w-full">
        {children}
      </div>
    </section>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-[#08AAA5]">
        {title}
      </h1>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
        {description}
      </p>
    </div>
  );
}

function EmptyChartMessage({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#12577A] p-6 text-center text-sm leading-6 text-slate-300">
      {message}
    </div>
  );
}

function normalizeArray(value: any): DataRecord[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const possibleKeys = [
    "data",
    "results",
    "records",
    "items",
    "values",
    "rows",
    "predictions",
    "teams",
    "players",
  ];

  for (const key of possibleKeys) {
    if (Array.isArray(value[key])) {
      return value[key];
    }
  }

  return [];
}

function getText(
  item: DataRecord,
  keys: string[],
  fallback = "Unknown",
): string {
  for (const key of keys) {
    if (
      item[key] !== undefined &&
      item[key] !== null &&
      String(item[key]).trim() !== ""
    ) {
      return String(item[key]);
    }
  }

  return fallback;
}

function getNumber(
  item: DataRecord,
  keys: string[],
): number | null {
  for (const key of keys) {
    if (
      item[key] !== undefined &&
      item[key] !== null &&
      item[key] !== ""
    ) {
      const value = Number(item[key]);

      if (Number.isFinite(value)) {
        return value;
      }
    }
  }

  return null;
}

function getFirstArrayValue(
  item: DataRecord,
  keys: string[],
): any[] {
  for (const key of keys) {
    if (Array.isArray(item[key])) {
      return item[key];
    }
  }

  return [];
}

export default function WorldCupAnalytics() {
  const [globalData, setGlobalData] = useState<
    Record<string, DataRecord[]>
  >({});

  const [predictionData, setPredictionData] = useState<
    Record<string, DataRecord[]>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const files = {
          attendees: "/data/worldcup/global/attendees.json",
          clubCounts: "/data/worldcup/global/club_counts.json",
          clubDiversity:
            "/data/worldcup/global/club_diversity.json",
          refereeCards:
            "/data/worldcup/global/referee_cards.json",
          topMinutes:
            "/data/worldcup/global/top_minutes.json",
          topScorer:
            "/data/worldcup/global/top_scorer.json",
          topScoringTeams:
            "/data/worldcup/global/top_scoring_teams.json",

          accuracyByStage:
            "/data/worldcup/prediction/accuracy_by_stage.json",
          actualHeatmap:
            "/data/worldcup/prediction/actual_heatmap.json",
          predictionHeatmap:
            "/data/worldcup/prediction/prediction_heatmap.json",
          confidenceVsAccuracy:
            "/data/worldcup/prediction/confidence_vs_accuracy.json",
          tournamentWinnerPredictions:
            "/data/worldcup/prediction/tournament_winner_predictions.json",
        };

        const loadedEntries = await Promise.all(
          Object.entries(files).map(async ([key, path]) => {
            const response = await fetch(path);

            if (!response.ok) {
              throw new Error(
                `Could not load ${path}. HTTP status: ${response.status}`,
              );
            }

            const json = await response.json();

            return [key, normalizeArray(json)] as const;
          }),
        );

        const loaded = Object.fromEntries(loadedEntries);

        setGlobalData({
          attendees: loaded.attendees,
          clubCounts: loaded.clubCounts,
          clubDiversity: loaded.clubDiversity,
          refereeCards: loaded.refereeCards,
          topMinutes: loaded.topMinutes,
          topScorer: loaded.topScorer,
          topScoringTeams: loaded.topScoringTeams,
        });

        setPredictionData({
          accuracyByStage: loaded.accuracyByStage,
          actualHeatmap: loaded.actualHeatmap,
          predictionHeatmap: loaded.predictionHeatmap,
          confidenceVsAccuracy: loaded.confidenceVsAccuracy,
          tournamentWinnerPredictions:
            loaded.tournamentWinnerPredictions,
        });
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load World Cup analytics data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#12577A] bg-[#0F1A23] p-6 text-slate-300">
        Loading World Cup analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-6 text-red-200">
        {error}
      </div>
    );
  }

  /*
   * GLOBAL DATA
   */

  const attendeesData = (globalData.attendees || [])
    .map((item) => ({
      name: getText(item, [
        "venue",
        "venue_name",
        "stadium",
        "name",
      ]),
      attendance: getNumber(item, [
        "attendance",
        "attendees",
        "total_attendance",
        "total",
      ]),
    }))
    .filter(
      (item) =>
        item.name !== "Unknown" &&
        item.attendance !== null &&
        item.attendance > 0,
    )
    .sort(
      (a, b) =>
        (b.attendance ?? 0) - (a.attendance ?? 0),
    )
    .slice(0, 10);

  const clubCountsData = (globalData.clubCounts || [])
    .map((item) => ({
      name: getText(item, [
        "club",
        "club_name",
        "team",
        "name",
      ]),
      count: getNumber(item, [
        "count",
        "players",
        "player_count",
        "total",
      ]),
    }))
    .filter(
      (item) =>
        item.name !== "Unknown" &&
        item.count !== null &&
        item.count > 0,
    )
    .sort(
      (a, b) => (b.count ?? 0) - (a.count ?? 0),
    )
    .slice(0, 10);

  /*
   * FIXED CLUB DIVERSITY STRUCTURE

   {
     "team": "Switzerland",
     "unique_clubs_represented": 22
   }
   */

  const clubDiversityData = (globalData.clubDiversity || [])
    .map((item) => ({
      name: getText(item, [
        "team",
        "team_name",
        "national_team",
        "name",
      ]),
      diversity: getNumber(item, [
        "unique_clubs_represented",
        "unique_clubs",
        "club_diversity",
        "diversity",
        "count",
      ]),
    }))
    .filter(
      (item) =>
        item.name !== "Unknown" &&
        item.diversity !== null &&
        item.diversity > 0,
    )
    .sort(
      (a, b) =>
        (b.diversity ?? 0) - (a.diversity ?? 0),
    )
    .slice(0, 15);

  /*
   * REFEREE CARD DATA

   Supports common possible structures such as:

   {
     "referee": "Name",
     "yellow_cards": 20,
     "red_cards": 2
   }

   or:

   {
     "referee": "Name",
     "yellow": 20,
     "red": 2
   }
   */

  const refereeCardsData = (globalData.refereeCards || [])
    .map((item) => {
      const yellow =
        getNumber(item, [
          "yellow_cards",
          "yellow_card",
          "yellow",
          "total_yellow_cards",
        ]) ?? 0;

      const red =
        getNumber(item, [
          "red_cards",
          "red_card",
          "red",
          "total_red_cards",
        ]) ?? 0;

      return {
        name: getText(item, [
          "referee",
          "referee_name",
          "official",
          "name",
        ]),
        yellow,
        red,
        total: yellow + red,
      };
    })
    .filter(
      (item) =>
        item.name !== "Unknown" &&
        item.total > 0,
    )
    .sort((a, b) => b.total - a.total)
    .slice(0, 15);

  const topMinutesData = (globalData.topMinutes || [])
    .map((item) => ({
      name: getText(item, [
        "player",
        "player_name",
        "name",
      ]),
      minutes: getNumber(item, [
        "minutes",
        "total_minutes",
        "playing_time",
      ]),
    }))
    .filter(
      (item) =>
        item.name !== "Unknown" &&
        item.minutes !== null &&
        item.minutes > 0,
    )
    .sort(
      (a, b) =>
        (b.minutes ?? 0) - (a.minutes ?? 0),
    )
    .slice(0, 10);

  const topScorerData = (globalData.topScorer || [])
    .map((item) => ({
      name: getText(item, [
        "player",
        "player_name",
        "name",
      ]),
      goals: getNumber(item, [
        "goals",
        "total_goals",
        "goal_count",
      ]),
    }))
    .filter(
      (item) =>
        item.name !== "Unknown" &&
        item.goals !== null &&
        item.goals > 0,
    )
    .sort(
      (a, b) => (b.goals ?? 0) - (a.goals ?? 0),
    )
    .slice(0, 10);

  const topScoringTeamsData = (globalData.topScoringTeams || [])
    .map((item) => ({
      name: getText(item, [
        "team",
        "team_name",
        "name",
      ]),
      goals: getNumber(item, [
        "goals",
        "total_goals",
        "team_goals",
      ]),
      goalsPer90: getNumber(item, [
        "goals_per_90",
        "goalsPer90",
        "goals90",
        "goals_per90",
      ]),
    }))
    .filter(
      (item) =>
        item.name !== "Unknown" &&
        (item.goals !== null || item.goalsPer90 !== null),
    );

  /*
   * PREDICTION DATA
   */

  const accuracyByStageData = (predictionData.accuracyByStage || [])
    .map((item) => ({
      stage: `Type ${getText(item, [
        "match_type",
        "stage",
        "type",
      ])}`,
      accuracy: getNumber(item, [
        "accuracy",
        "accuracy_percentage",
        "percentage",
      ]),
    }))
    .filter(
      (item) =>
        item.accuracy !== null &&
        item.accuracy >= 0,
    );

  /*
   * ACTUAL SCORELINE DATA

   {
     "score": "2-1",
     "timesOccurred": 9
   }
   */

  const actualHeatmapData = (predictionData.actualHeatmap || [])
    .map((item) => ({
      score: getText(item, [
        "score",
        "scoreline",
        "result",
      ]),
      occurrences: getNumber(item, [
        "timesOccurred",
        "times_occurred",
        "occurrences",
        "count",
      ]),
    }))
    .filter(
      (item) =>
        item.score !== "Unknown" &&
        item.occurrences !== null &&
        item.occurrences > 0,
    )
    .sort(
      (a, b) =>
        (b.occurrences ?? 0) - (a.occurrences ?? 0),
    )
    .slice(0, 20);

  /*
   * PREDICTED SCORELINE DATA

   {
     "score": "2-1",
     "timesPredicted": 403,
     "timesOccurred": 9
   }
   */

  const predictionHeatmapData = (
    predictionData.predictionHeatmap || []
  )
    .map((item) => ({
      score: getText(item, [
        "score",
        "scoreline",
        "result",
      ]),
      predictions: getNumber(item, [
        "timesPredicted",
        "times_predicted",
        "predictions",
        "count",
      ]),
    }))
    .filter(
      (item) =>
        item.score !== "Unknown" &&
        item.predictions !== null &&
        item.predictions > 0,
    )
    .sort(
      (a, b) =>
        (b.predictions ?? 0) - (a.predictions ?? 0),
    )
    .slice(0, 20);

  const confidenceData = (
    predictionData.confidenceVsAccuracy || []
  )
    .map((item) => ({
      confidence: getNumber(item, [
        "consensus",
        "confidence",
        "consensus_percentage",
      ]),
      accuracy: getNumber(item, [
        "accuracy",
        "accuracy_percentage",
      ]),
    }))
    .filter(
      (item) =>
        item.confidence !== null &&
        item.accuracy !== null,
    );

  const winnerData = (
    predictionData.tournamentWinnerPredictions || []
  )
    .map((item) => ({
      name: getText(item, [
        "team",
        "team_name",
        "winner",
        "name",
      ]),
      predictions: getNumber(item, [
        "picks",
        "predictions",
        "count",
        "timesPredicted",
      ]),
    }))
    .filter(
      (item) =>
        item.name !== "Unknown" &&
        item.predictions !== null &&
        item.predictions > 0,
    )
    .sort(
      (a, b) =>
        (b.predictions ?? 0) - (a.predictions ?? 0),
    );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white">
          World Cup Analytics
        </h1>

        <p className="mt-3 max-w-3xl text-slate-300">
          An analytical overview of World Cup performance,
          player statistics, stadium attendance, and prediction
          behaviour.
        </p>
      </div>

      <section className="mb-16">
        <SectionHeading
          title="Global World Cup Analytics"
          description="Statistical patterns from teams, players, stadiums, referees, and match performance."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard
            title="1. Stadium Attendance"
            description="The ten stadiums with the highest recorded attendance."
          >
            {attendeesData.length === 0 ? (
              <EmptyChartMessage message="No valid stadium attendance data was found." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={attendeesData}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 30,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#12577A"
                  />

                  <XAxis type="number" stroke="#CBD5E1" />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    stroke="#CBD5E1"
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="attendance"
                    fill="#08AAA5"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="2. Players by Club"
            description="The clubs with the highest number of represented players."
          >
            {clubCountsData.length === 0 ? (
              <EmptyChartMessage message="No valid club-count data was found." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clubCountsData}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 30,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#12577A"
                  />

                  <XAxis type="number" stroke="#CBD5E1" />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    stroke="#CBD5E1"
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    fill="#1479A8"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="3. Club Diversity by National Team"
            description="National teams ranked by the number of unique clubs represented in their squads."
          >
            {clubDiversityData.length === 0 ? (
              <EmptyChartMessage message="No valid club-diversity data was found. Check that the file uses team and unique_clubs_represented." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clubDiversityData}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 30,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#12577A"
                  />

                  <XAxis
                    type="number"
                    stroke="#CBD5E1"
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    stroke="#CBD5E1"
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="diversity"
                    fill="#12577A"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="4. Referee Cards"
            description="Yellow and red cards recorded for referees."
          >
            {refereeCardsData.length === 0 ? (
              <EmptyChartMessage message="No valid referee card data was found. The exact referee_cards.json structure is needed to map its fields correctly." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={refereeCardsData}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 30,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#12577A"
                  />

                  <XAxis
                    type="number"
                    stroke="#CBD5E1"
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    stroke="#CBD5E1"
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="yellow"
                    stackId="cards"
                    fill="#08AAA5"
                    name="Yellow cards"
                  />

                  <Bar
                    dataKey="red"
                    stackId="cards"
                    fill="#DC2626"
                    name="Red cards"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="5. Player Playing Time"
            description="Players with the highest recorded playing time."
          >
            {topMinutesData.length === 0 ? (
              <EmptyChartMessage message="No valid playing-time data was found." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topMinutesData}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 30,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#12577A"
                  />

                  <XAxis type="number" stroke="#CBD5E1" />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    stroke="#CBD5E1"
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="minutes"
                    fill="#1479A8"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="6. Top Goal Scorers"
            description="The leading goal scorers according to their recorded goal totals."
          >
            {topScorerData.length === 0 ? (
              <EmptyChartMessage message="No valid goal-scoring data was found." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topScorerData}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 30,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#12577A"
                  />

                  <XAxis type="number" stroke="#CBD5E1" />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    stroke="#CBD5E1"
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="goals"
                    fill="#08AAA5"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="7. Team Goals vs Goals per 90 Minutes"
            description="The relationship between total team goals and goals scored per 90 minutes."
          >
            {topScoringTeamsData.length === 0 ? (
              <EmptyChartMessage message="No valid team-scoring data was found." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#12577A"
                  />

                  <XAxis
                    type="number"
                    dataKey="goalsPer90"
                    name="Goals per 90"
                    stroke="#CBD5E1"
                  />

                  <YAxis
                    type="number"
                    dataKey="goals"
                    name="Total goals"
                    stroke="#CBD5E1"
                  />

                  <Tooltip />

                  <Scatter
                    data={topScoringTeamsData}
                    fill="#08AAA5"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </section>

      <section>
        <SectionHeading
          title="Prediction Analytics"
          description="Prediction accuracy, scoreline expectations, confidence levels, and tournament winner preferences."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard
            title="1. Prediction Accuracy by Match Type"
            description="Prediction accuracy across the different match types."
          >
            {accuracyByStageData.length === 0 ? (
              <EmptyChartMessage message="No valid accuracy data was found." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyByStageData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#12577A"
                  />

                  <XAxis
                    dataKey="stage"
                    stroke="#CBD5E1"
                  />

                  <YAxis stroke="#CBD5E1" />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#08AAA5"
                    strokeWidth={3}
                    name="Accuracy"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="2. Actual Scoreline Distribution"
            description="The frequency of actual scorelines recorded in the matches."
          >
            {actualHeatmapData.length === 0 ? (
              <EmptyChartMessage message="No valid actual scoreline data was found. Expected score and timesOccurred fields." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={actualHeatmapData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 70,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#12577A"
                  />

                  <XAxis
                    dataKey="score"
                    stroke="#CBD5E1"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />

                  <YAxis stroke="#CBD5E1" />

                  <Tooltip />

                  <Bar
                    dataKey="occurrences"
                    fill="#08AAA5"
                    name="Actual occurrences"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="3. Predicted Scoreline Distribution"
            description="The frequency of scorelines predicted by users."
          >
            {predictionHeatmapData.length === 0 ? (
              <EmptyChartMessage message="No valid predicted scoreline data was found. Expected score and timesPredicted fields." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={predictionHeatmapData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 70,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#12577A"
                  />

                  <XAxis
                    dataKey="score"
                    stroke="#CBD5E1"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />

                  <YAxis stroke="#CBD5E1" />

                  <Tooltip />

                  <Bar
                    dataKey="predictions"
                    fill="#1479A8"
                    name="Predictions"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="4. Confidence vs Accuracy"
            description="Each point represents a match, comparing prediction confidence with actual accuracy."
          >
            {confidenceData.length === 0 ? (
              <EmptyChartMessage message="No valid confidence-versus-accuracy data was found." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#12577A"
                  />

                  <XAxis
                    type="number"
                    dataKey="confidence"
                    name="Confidence"
                    stroke="#CBD5E1"
                  />

                  <YAxis
                    type="number"
                    dataKey="accuracy"
                    name="Accuracy"
                    stroke="#CBD5E1"
                  />

                  <Tooltip />

                  <Scatter
                    data={confidenceData}
                    fill="#08AAA5"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="5. Predicted Goals vs Actual Goals"
            description="A comparison of predicted and actual team goals."
          >
            <EmptyChartMessage
              message="This graph cannot be plotted from the currently selected files because a matching predicted-goals and actual-goals value for each team is required."
            />
          </ChartCard>

          <ChartCard
            title="6. Tournament Winner Predictions"
            description="Teams selected most frequently as predicted tournament winners."
          >
            {winnerData.length === 0 ? (
              <EmptyChartMessage message="No valid tournament-winner prediction data was found." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={winnerData}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 30,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#12577A"
                  />

                  <XAxis
                    type="number"
                    stroke="#CBD5E1"
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    stroke="#CBD5E1"
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="predictions"
                    fill="#08AAA5"
                    name="Predictions"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="7. Predicted Scorelines vs Actual Occurrences"
            description="A comparison between predicted scoreline frequency and actual scoreline frequency."
          >
            <EmptyChartMessage
              message="This graph requires matching predicted and actual scoreline records. The current files should be combined by score before plotting."
            />
          </ChartCard>
        </div>
      </section>
    </main>
  );
}