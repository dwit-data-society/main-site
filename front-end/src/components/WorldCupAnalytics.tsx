"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
} from "recharts";

export default function WorldCupAnalytics() {
  const [data, setData] = useState<Record<string, any[]>>({
    attendees: [],
    clubCounts: [],
    clubDiversity: [],
    refereeCards: [],
    topMinutes: [],
    topScorers: [],
    topScoringTeams: [],
    accuracyByStage: [],
    actualHeatmap: [],
    predictionHeatmap: [],
    biasedFan: [],
    biggestSurprises: [],
    confidenceVsAccuracy: [],
    luckiestPredictors: [],
    mostMisjudgedTeams: [],
    mostTrustedTeams: [],
    scorePsychology: [],
    tournamentWinners: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllData() {
      try {
        const fetchJSON = async (url: string) => {
          const res = await fetch(url);
          if (!res.ok) return [];
          const text = await res.text();
          if (!text || text.trim().startsWith("<")) return [];
          try {
            const json = JSON.parse(text);
            return Array.isArray(json) ? json.filter((i: any) => !i.title) : [];
          } catch {
            return [];
          }
        };

        const [
          attendees,
          clubCounts,
          clubDiversity,
          refereeCards,
          topMinutes,
          topScorers,
          topScoringTeams,
          accuracyByStage,
          actualHeatmap,
          predictionHeatmap,
          biasedFan,
          biggestSurprises,
          confidenceVsAccuracy,
          luckiestPredictors,
          mostMisjudgedTeams,
          mostTrustedTeams,
          scorePsychology,
          tournamentWinners,
        ] = await Promise.all([
          fetchJSON("/data/worldcup/global/attendees.json"),
          fetchJSON("/data/worldcup/global/club_counts.json"),
          fetchJSON("/data/worldcup/global/club_diversity.json"),
          fetchJSON("/data/worldcup/global/referee_cards.json"),
          fetchJSON("/data/worldcup/global/top_minutes.json"),
          fetchJSON("/data/worldcup/global/top_scorer.json"),
          fetchJSON("/data/worldcup/global/top_scoring_teams.json"),
          fetchJSON("/data/worldcup/prediction/accuracy_by_stage.json"),
          fetchJSON("/data/worldcup/prediction/actual_heatmap.json"),
          fetchJSON("/data/worldcup/prediction/prediction_heatmap.json"),
          fetchJSON("/data/worldcup/prediction/biased_fan.json"),
          fetchJSON("/data/worldcup/prediction/biggest_surprises.json"),
          fetchJSON("/data/worldcup/prediction/confidence_vs_accuracy.json"),
          fetchJSON("/data/worldcup/prediction/luckiest_predictors.json"),
          fetchJSON("/data/worldcup/prediction/most_misjudged_teams.json"),
          fetchJSON("/data/worldcup/prediction/most_trusted_teams.json"),
          fetchJSON("/data/worldcup/prediction/score_psychology.json"),
          fetchJSON("/data/worldcup/prediction/tournament_winner_predictions.json"),
        ]);

        setData({
          attendees,
          clubCounts,
          clubDiversity,
          refereeCards,
          topMinutes,
          topScorers,
          topScoringTeams,
          accuracyByStage,
          actualHeatmap,
          predictionHeatmap,
          biasedFan,
          biggestSurprises,
          confidenceVsAccuracy,
          luckiestPredictors,
          mostMisjudgedTeams,
          mostTrustedTeams,
          scorePsychology,
          tournamentWinners,
        });
      } catch (err) {
        console.error("Error loading JSON datasets", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono">
        Loading analytics structure...
      </div>
    );
  }

  // Formatters for Global Metrics
  const formattedAttendees = data.attendees.slice(0, 8).map((item: any) => ({
    venue: item.venue ? item.venue.split(",")[0] : "Unknown",
    attendance: item.attendance,
  }));

  const formattedTopScoringTeams = data.topScoringTeams.slice(0, 10).map((item: any) => ({
    team: item.team ?? item.name,
    goals: item.goals ?? item.total_goals ?? 0,
  }));

  const formattedTopScorers = data.topScorers.slice(0, 8).map((item: any) => ({
    player: item.player,
    goals: item.goals,
  }));

  const formattedReferees = data.refereeCards.slice(0, 8).map((item: any) => ({
    referee: item.referee,
    yellow: item.total_yellow,
    red: item.total_red,
  }));

  const formattedClubCounts = data.clubCounts.slice(0, 8).map((item: any) => ({
    club: item.club,
    player_count: item.player_count,
  }));

  const formattedClubDiversity = data.clubDiversity.slice(0, 8).map((item: any) => ({
    team: item.team,
    unique_clubs_represented: item.unique_clubs_represented,
  }));

  const formattedTopMinutes = data.topMinutes.slice(0, 8).map((item: any) => ({
    player: item.player,
    minutes: item.minutes,
  }));

  // Formatters for Prediction Metrics
  const formattedAccuracy = data.accuracyByStage.map((item: any) => ({
    stage: item.match_type ?? item.stage ?? "Stage",
    accuracy: item.accuracy,
  }));

  // Heatmap Matrices for P2 and P3
  const maxGoal1Actual = Math.max(0, ...data.actualHeatmap.map((d: any) => d.goal1 ?? 0), 5);
  const maxGoal2Actual = Math.max(0, ...data.actualHeatmap.map((d: any) => d.goal2 ?? 0), 5);
  const actualGrid = Array.from({ length: maxGoal1Actual + 1 }, () => Array(maxGoal2Actual + 1).fill(0));
  data.actualHeatmap.forEach((d: any) => {
    if (d.goal1 <= maxGoal1Actual && d.goal2 <= maxGoal2Actual) {
      actualGrid[d.goal1][d.goal2] = d.count;
    }
  });

  const maxGoal1Pred = Math.max(0, ...data.predictionHeatmap.map((d: any) => d.goal1 ?? 0), 5);
  const maxGoal2Pred = Math.max(0, ...data.predictionHeatmap.map((d: any) => d.goal2 ?? 0), 5);
  const predGrid = Array.from({ length: maxGoal1Pred + 1 }, () => Array(maxGoal2Pred + 1).fill(0));
  data.predictionHeatmap.forEach((d: any) => {
    if (d.goal1 <= maxGoal1Pred && d.goal2 <= maxGoal2Pred) {
      predGrid[d.goal1][d.goal2] = d.count;
    }
  });

  const formattedScorePsych = data.scorePsychology.map((item: any) => ({
    score: item.score,
    timesPredicted: item.timesPredicted,
    timesOccurred: item.timesOccurred,
  }));

  const formattedWinners = data.tournamentWinners.map((item: any) => ({
    name: item.name,
    pickPercent: item.pickPercent,
  }));

  const formattedMisjudged = data.mostMisjudgedTeams.slice(0, 8).map((item: any) => ({
    team: item.team ?? item.name,
    predicted: item.predicted ?? item.errorRate ?? 15,
    actual: item.actual ?? item.error_rate ?? 10,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 space-y-16 font-sans">
      
      {/* Title Header */}
      <div className="max-w-6xl mx-auto border-b border-slate-800 pb-6 space-y-2">
        <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest">Analytics Taxonomy Hierarchy</span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">World Cup 2026 Comprehensive Dashboard</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Exact structural layout mapping Global Analytics and Prediction Analytics following your hierarchical tree.
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-20">

        {/* ======================================================== */}
        {/* WORLD CUP 2026 — GLOBAL ANALYTICS                        */}
        {/* ======================================================== */}
        <section className="space-y-10">
          <div className="border-l-4 border-emerald-500 pl-4">
            <h2 className="text-2xl font-bold tracking-tight text-emerald-400 font-mono">WORLD CUP 2026 — GLOBAL ANALYTICS</h2>
            <p className="text-slate-400 text-sm">Stadium metrics, squads, player performance workloads, and official records.</p>
          </div>

          {/* ├── Stadium & Competition */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-300 font-mono border-b border-slate-800 pb-2">├── Stadium & Competition</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-6">
              
              {/* 1. attendees */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-emerald-400">Top Venues by Attendance</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Horizontal bar</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedAttendees} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" fontSize={10} />
                      <YAxis dataKey="venue" type="category" stroke="#64748b" fontSize={10} width={90} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "12px", color: "#f8fafc" }} />
                      <Bar dataKey="attendance" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 6. club_diversity */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-emerald-400">Teams with Greatest Club Diversity</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Ranked cards/bar</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedClubDiversity} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="team" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "12px", color: "#f8fafc" }} />
                      <Bar dataKey="unique_clubs_represented" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* ├── Player & Team Performance */}
          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-semibold text-slate-300 font-mono border-b border-slate-800 pb-2">├── Player & Team Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-6">
              
              {/* 5. club_counts */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-emerald-400">Top Clubs Represented</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Horizontal bar</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedClubCounts} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="club" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "12px", color: "#f8fafc" }} />
                      <Bar dataKey="player_count" fill="#34d399" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 7. top_minutes */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-emerald-400">Most Minutes Played</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Player leaderboard/bar</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedTopMinutes} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" fontSize={10} />
                      <YAxis dataKey="player" type="category" stroke="#64748b" fontSize={10} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "12px", color: "#f8fafc" }} />
                      <Bar dataKey="minutes" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3. top_scorer */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-emerald-400">Top Scorers</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Player leaderboard</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedTopScorers} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" fontSize={10} />
                      <YAxis dataKey="player" type="category" stroke="#64748b" fontSize={10} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "12px", color: "#f8fafc" }} />
                      <Bar dataKey="goals" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. top_scoring_teams */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-emerald-400">Top 10 Teams</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Horizontal bar</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedTopScoringTeams} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" fontSize={10} />
                      <YAxis dataKey="team" type="category" stroke="#64748b" fontSize={10} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "12px", color: "#f8fafc" }} />
                      <Bar dataKey="goals" fill="#059669" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* ├── Match Officials */}
          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-semibold text-slate-300 font-mono border-b border-slate-800 pb-2">├── Match Officials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-6">
              
              {/* 4. referee_cards */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg md:col-span-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-emerald-400">Cards by Referee</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Bar / stacked bar</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedReferees} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="referee" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "12px", color: "#f8fafc" }} />
                      <Bar dataKey="yellow" stackId="a" fill="#facc15" name="Yellow Cards" />
                      <Bar dataKey="red" stackId="a" fill="#f87171" name="Red Cards" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

        </section>


        {/* ======================================================== */}
        {/* WORLD CUP 2026 — PREDICTION ANALYTICS                    */}
        {/* ======================================================== */}
        <section className="space-y-10 pt-10 border-t border-slate-800">
          <div className="border-l-4 border-purple-500 pl-4">
            <h2 className="text-2xl font-bold tracking-tight text-purple-400 font-mono">WORLD CUP 2026 — PREDICTION ANALYTICS</h2>
            <p className="text-slate-400 text-sm">Predictive accuracy, scoreline heatmap distributions, psychology gaps, and tournament expectations.</p>
          </div>

          {/* ├── Prediction Performance */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-300 font-mono border-b border-slate-800 pb-2">├── Prediction Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-6">
              
              {/* Prediction Accuracy by Match Type */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-purple-400">Prediction Accuracy by Match Type</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Bar Chart</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedAccuracy} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="stage" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "12px", color: "#f8fafc" }} />
                      <Bar dataKey="accuracy" fill="#c084fc" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Confidence vs Accuracy */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-purple-400">Confidence vs Accuracy</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Scatter Plot</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" dataKey="consensus" name="Consensus" stroke="#64748b" fontSize={10} unit="%" />
                      <YAxis type="number" dataKey="confidenceGap" name="Gap" stroke="#64748b" fontSize={10} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "12px", color: "#f8fafc" }} />
                      <Scatter data={data.confidenceVsAccuracy} fill="#c084fc" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* ├── Prediction vs Reality */}
          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-semibold text-slate-300 font-mono border-b border-slate-800 pb-2">├── Prediction vs Reality</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-2 md:pl-6">
              
              {/* Actual Scoreline Heatmap */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-purple-400 text-sm">Actual Scoreline Heatmap</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Matrix</span>
                </div>
                <div className="overflow-x-auto max-h-60 flex justify-center">
                  <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${maxGoal2Actual + 1}, minmax(0, 1fr))` }}>
                    {actualGrid.map((row, rIdx) =>
                      row.map((val, cIdx) => {
                        const intensity = val > 0 ? Math.min(val / 10, 1) : 0;
                        return (
                          <div
                            key={`actual-${rIdx}-${cIdx}`}
                            title={`Goals 1-2: ${rIdx}-${cIdx}, Count: ${val}`}
                            className="w-7 h-7 flex items-center justify-center text-[9px] font-mono rounded"
                            style={{
                              backgroundColor: val > 0 ? `rgba(168, 85, 247, ${Math.max(intensity, 0.2)})` : "#1e293b",
                              color: val > 0 ? "#ffffff" : "#64748b"
                            }}
                          >
                            {val}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 text-center">Row: Team 1 Goals | Col: Team 2 Goals</p>
              </div>

              {/* Predicted Scoreline Heatmap */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-purple-400 text-sm">Predicted Scoreline Heatmap</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Matrix</span>
                </div>
                <div className="overflow-x-auto max-h-60 flex justify-center">
                  <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${maxGoal2Pred + 1}, minmax(0, 1fr))` }}>
                    {predGrid.map((row, rIdx) =>
                      row.map((val, cIdx) => {
                        const intensity = val > 0 ? Math.min(val / 100, 1) : 0;
                        return (
                          <div
                            key={`pred-${rIdx}-${cIdx}`}
                            title={`Goals 1-2: ${rIdx}-${cIdx}, Count: ${val}`}
                            className="w-7 h-7 flex items-center justify-center text-[9px] font-mono rounded"
                            style={{
                              backgroundColor: val > 0 ? `rgba(216, 180, 254, ${Math.max(intensity, 0.2)})` : "#1e293b",
                              color: val > 0 ? "#020617" : "#64748b"
                            }}
                          >
                            {val}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 text-center">Row: Team 1 Goals | Col: Team 2 Goals</p>
              </div>

              {/* Predicted Scorelines vs Actual Occurrences */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-purple-400 text-sm">Scorelines vs Actuals</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Grouped Bar</span>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedScorePsych} margin={{ top: 5, right: 10, bottom: 25, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="score" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "12px", color: "#f8fafc" }} />
                      <Bar dataKey="timesPredicted" fill="#c084fc" name="Predicted" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="timesOccurred" fill="#34d399" name="Actual" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* ├── Tournament Expectations */}
          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-semibold text-slate-300 font-mono border-b border-slate-800 pb-2">├── Tournament Expectations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-6">
              
              {/* Tournament Winner Predictions */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-purple-400">Tournament Winner Predictions</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Bar Chart</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedWinners} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" fontSize={10} unit="%" />
                      <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={70} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "12px", color: "#f8fafc" }} />
                      <Bar dataKey="pickPercent" fill="#e879f9" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Predicted vs Actual Goals by Team */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-purple-400">Predicted vs Actual Goals by Team</h4>
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">Grouped Bar</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedMisjudged} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" fontSize={10} />
                      <YAxis dataKey="team" type="category" stroke="#64748b" fontSize={10} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "12px", color: "#f8fafc" }} />
                      <Bar dataKey="predicted" fill="#9333ea" name="Predicted Goals" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="actual" fill="#c084fc" name="Actual Goals" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

        </section>

      </div>
    </div>
  );
}