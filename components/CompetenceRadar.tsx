"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts";

interface Props {
  structure: number;
  cohesion: number;
  grammar: number;
  vocabulary: number;
  expression: number;
  lengthScore: number;
}

export default function CompetenceRadar({
  structure,
  cohesion,
  grammar,
  vocabulary,
  expression,
  lengthScore
}: Props) {
  const data = [
    { subject: "Struktur", value: structure },
    { subject: "Kohäsion", value: cohesion },
    { subject: "Grammatik", value: grammar },
    { subject: "Wortschatz", value: vocabulary },
    { subject: "Ausdruck", value: expression },
    { subject: "Umfang", value: lengthScore }
  ];

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis domain={[0, 20]} />
          <Radar
            name="Kompetenz"
            dataKey="value"
            stroke="#000"
            fill="#000"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}