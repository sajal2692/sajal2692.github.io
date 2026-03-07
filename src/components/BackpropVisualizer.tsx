import { useState } from "react";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  value?: number;
  gradient?: number;
  type: "input" | "operation" | "output";
}

interface Edge {
  from: string;
  to: string;
  label?: string;
  localGrad?: number;
}

const BackpropVisualizer = () => {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"forward" | "backward">("forward");

  // Define the computational graph nodes
  const nodes: Node[] = [
    {
      id: "a",
      label: "a = 2",
      x: 50,
      y: 100,
      value: 2,
      gradient: 15,
      type: "input",
    },
    {
      id: "b",
      label: "b = 3",
      x: 50,
      y: 200,
      value: 3,
      gradient: 10,
      type: "input",
    },
    {
      id: "c",
      label: "c = -10",
      x: 250,
      y: 250,
      value: -10,
      gradient: 5,
      type: "input",
    },
    {
      id: "f",
      label: "f = 5",
      x: 500,
      y: 250,
      value: 5,
      gradient: -4,
      type: "input",
    },
    {
      id: "e",
      label: "e = a×b",
      x: 200,
      y: 150,
      value: 6,
      gradient: 5,
      type: "operation",
    },
    {
      id: "d",
      label: "d = e+c",
      x: 350,
      y: 200,
      value: -4,
      gradient: 5,
      type: "operation",
    },
    {
      id: "L",
      label: "L = d×f",
      x: 550,
      y: 200,
      value: -20,
      gradient: 1,
      type: "output",
    },
  ];

  // Define edges with local gradients
  const edges: Edge[] = [
    { from: "a", to: "e", label: "×b", localGrad: 3 },
    { from: "b", to: "e", label: "×a", localGrad: 2 },
    { from: "e", to: "d", label: "+1", localGrad: 1 },
    { from: "c", to: "d", label: "+1", localGrad: 1 },
    { from: "d", to: "L", label: "×f", localGrad: 5 },
    { from: "f", to: "L", label: "×d", localGrad: -4 },
  ];

  // Forward pass steps
  const forwardSteps = [
    {
      stepNum: 0,
      description: "Initial values: a=2, b=3, c=-10, f=5",
      highlight: ["a", "b", "c", "f"],
    },
    {
      stepNum: 1,
      description: "Compute e = a × b = 2 × 3 = 6",
      highlight: ["e"],
    },
    {
      stepNum: 2,
      description: "Compute d = e + c = 6 + (-10) = -4",
      highlight: ["d"],
    },
    {
      stepNum: 3,
      description: "Compute L = d × f = (-4) × 5 = -20",
      highlight: ["L"],
    },
  ];

  // Backward pass steps
  const backwardSteps = [
    {
      stepNum: 0,
      description: "Initialize: ∂L/∂L = 1 (output gradient)",
      highlight: ["L"],
    },
    {
      stepNum: 1,
      description: "∂L/∂d = ∂L/∂L × ∂L/∂d = 1 × f = 1 × 5 = 5",
      highlight: ["d", "L"],
    },
    {
      stepNum: 2,
      description: "∂L/∂e = ∂L/∂d × ∂d/∂e = 5 × 1 = 5",
      highlight: ["e", "d"],
    },
    {
      stepNum: 3,
      description: "∂L/∂a = ∂L/∂e × ∂e/∂a = 5 × b = 5 × 3 = 15",
      highlight: ["a", "e"],
    },
    {
      stepNum: 4,
      description: "∂L/∂b = ∂L/∂e × ∂e/∂b = 5 × a = 5 × 2 = 10",
      highlight: ["b", "e"],
    },
    {
      stepNum: 5,
      description: "∂L/∂c = ∂L/∂d × ∂d/∂c = 5 × 1 = 5",
      highlight: ["c", "d"],
    },
    {
      stepNum: 6,
      description: "∂L/∂f = ∂L/∂L × ∂L/∂f = 1 × d = 1 × (-4) = -4",
      highlight: ["f", "L"],
    },
  ];

  const currentSteps = mode === "forward" ? forwardSteps : backwardSteps;
  const maxSteps = currentSteps.length - 1;
  const currentStep = currentSteps[step];

  const isHighlighted = (nodeId: string) => {
    return currentStep.highlight.includes(nodeId);
  };

  const nextStep = () => {
    if (step < maxSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const toggleMode = () => {
    setMode(mode === "forward" ? "backward" : "forward");
    setStep(0);
  };

  const reset = () => {
    setStep(0);
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4">
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={toggleMode}
            className="rounded bg-skin-accent px-4 py-2 text-skin-inverted transition-opacity hover:opacity-80"
          >
            {mode === "forward"
              ? "Switch to Backward Pass"
              : "Switch to Forward Pass"}
          </button>
          <button
            onClick={reset}
            className="hover:bg-skin-accent-2 rounded border border-skin-line px-4 py-2 transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="hover:bg-skin-accent-2 rounded border border-skin-line px-4 py-2 transition-colors disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 font-mono text-skin-base">
            Step {step + 1} / {maxSteps + 1}
          </span>
          <button
            onClick={nextStep}
            disabled={step === maxSteps}
            className="hover:bg-skin-accent-2 rounded border border-skin-line px-4 py-2 transition-colors disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6 rounded border border-skin-line bg-skin-card p-4">
        <p className="text-center font-medium text-skin-base">
          <span className="text-skin-accent">
            {mode === "forward" ? "Forward Pass" : "Backward Pass"}:
          </span>{" "}
          {currentStep.description}
        </p>
      </div>

      {/* Graph Visualization */}
      <div className="mb-6 rounded-lg border border-skin-line bg-skin-fill p-4">
        <svg viewBox="0 0 650 350" className="h-auto w-full">
          {/* Draw edges */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const isEdgeHighlighted =
              isHighlighted(edge.from) && isHighlighted(edge.to);

            return (
              <g key={idx}>
                <line
                  x1={fromNode.x + 40}
                  y1={fromNode.y + 20}
                  x2={toNode.x}
                  y2={toNode.y + 20}
                  stroke="currentColor"
                  strokeWidth={isEdgeHighlighted ? "3" : "2"}
                  className={
                    isEdgeHighlighted ? "text-skin-accent" : "text-skin-line"
                  }
                  markerEnd="url(#arrowhead)"
                />
                {mode === "backward" && edge.localGrad !== undefined && (
                  <text
                    x={(fromNode.x + toNode.x + 40) / 2}
                    y={(fromNode.y + toNode.y + 20) / 2 - 8}
                    className="fill-skin-accent font-mono text-xs"
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Define arrowhead marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" className="fill-skin-line" />
            </marker>
          </defs>

          {/* Draw nodes */}
          {nodes.map(node => {
            const highlighted = isHighlighted(node.id);
            const showValue =
              mode === "forward" &&
              step >=
                forwardSteps.findIndex(s => s.highlight.includes(node.id));
            const showGradient = mode === "backward" && step > 0;

            return (
              <g key={node.id}>
                <rect
                  x={node.x}
                  y={node.y}
                  width="80"
                  height="40"
                  rx="8"
                  className={`${
                    highlighted
                      ? "stroke-skin-accent fill-skin-accent"
                      : node.type === "output"
                        ? "fill-skin-card stroke-skin-accent"
                        : "fill-skin-card stroke-skin-line"
                  } transition-all`}
                  strokeWidth={highlighted ? "3" : "2"}
                />
                <text
                  x={node.x + 40}
                  y={node.y + 18}
                  textAnchor="middle"
                  className={`text-sm font-bold ${
                    highlighted ? "fill-skin-inverted" : "fill-skin-base"
                  }`}
                >
                  {node.label.split("=")[0].trim()}
                </text>
                {showValue && (
                  <text
                    x={node.x + 40}
                    y={node.y + 32}
                    textAnchor="middle"
                    className={`font-mono text-xs ${
                      highlighted ? "fill-skin-inverted" : "fill-skin-accent"
                    }`}
                  >
                    {node.value}
                  </text>
                )}
                {showGradient && node.gradient !== undefined && (
                  <text
                    x={node.x + 40}
                    y={node.y + 58}
                    textAnchor="middle"
                    className="fill-skin-accent font-mono text-xs"
                  >
                    ∂L/∂{node.id}: {node.gradient}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div className="rounded border border-skin-line p-3">
          <h3 className="mb-2 font-bold text-skin-accent">Forward Pass</h3>
          <p className="text-skin-base">
            Computes values from inputs to output. Each node calculates its
            value based on its inputs.
          </p>
        </div>
        <div className="rounded border border-skin-line p-3">
          <h3 className="mb-2 font-bold text-skin-accent">Backward Pass</h3>
          <p className="text-skin-base">
            Computes gradients from output to inputs using the chain rule. Shows
            how much each input affects the output.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackpropVisualizer;
