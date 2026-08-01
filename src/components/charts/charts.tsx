"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COULEURS = [
  "#059669", "#0284c7", "#f59e0b", "#7c3aed", "#dc2626",
  "#0d9488", "#db2777", "#65a30d",
];

const axeStyle = { fontSize: 12, fill: "#64748b" };

export function BarChartSimple({
  data,
  couleur = "#059669",
  hauteur = 260,
}: {
  data: Array<{ label: string; valeur: number }>;
  couleur?: string;
  hauteur?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={hauteur}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={axeStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axeStyle} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey="valeur" name="Nombre" fill={couleur} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FrequentationChart({
  data,
  hauteur = 280,
}: {
  data: Array<{ label: string; etudiants: number; visiteurs: number }>;
  hauteur?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={hauteur}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={axeStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axeStyle} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip cursor={{ fill: "#f1f5f9" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="etudiants" name="Étudiants" stackId="a" fill="#059669" />
        <Bar
          dataKey="visiteurs"
          name="Visiteurs"
          stackId="a"
          fill="#0284c7"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineChartSimple({
  data,
  hauteur = 260,
}: {
  data: Array<{ label: string; valeur: number }>;
  hauteur?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={hauteur}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={axeStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axeStyle} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="valeur"
          name="Interventions"
          stroke="#7c3aed"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PieChartSimple({
  data,
  hauteur = 280,
}: {
  data: Array<{ label: string; valeur: number }>;
  hauteur?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={hauteur}>
      <PieChart>
        <Pie
          data={data}
          dataKey="valeur"
          nameKey="label"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={COULEURS[index % COULEURS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
