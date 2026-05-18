"use client";

import { useState, useEffect } from "react";
import { Network, Loader2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { GraphData, GraphNode } from "@/types";

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/graph`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load graph");
      }

      setGraphData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load graph data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Graph visualization area */}
      <div className="flex-1 relative">
        {graphData && graphData.nodes.length > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Graph visualization will be rendered here with react-force-graph */}
            <div className="text-center">
              <Network className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                Knowledge Graph
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {graphData.nodes.length} concepts, {graphData.edges.length} relationships
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4">
                Interactive graph visualization coming soon.
                <br />
                Install react-force-graph for full visualization.
              </p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Network className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">
                No concepts yet. Upload a document to build the knowledge graph.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar — concept details */}
      <div className="w-80 border-l border-zinc-200 bg-white p-4 overflow-y-auto dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Concepts
        </h2>

        {graphData && graphData.nodes.length > 0 ? (
          <div className="space-y-2">
            {graphData.nodes
              .filter((n) => n.type === "concept")
              .map((node) => (
                <Card
                  key={node.id}
                  className={`cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                    selectedNode?.id === node.id ? "ring-2 ring-zinc-900 dark:ring-zinc-50" : ""
                  }`}
                  onClick={() => setSelectedNode(node)}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">{node.label}</CardTitle>
                    {node.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {node.description}
                      </p>
                    )}
                  </CardHeader>
                </Card>
              ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No concepts extracted yet.
          </p>
        )}
      </div>
    </div>
  );
}
