import React, { useState } from "react";
import "./App.css";

type letter = "x" | "y" | "z";
type equationValKeys = letter | "sum";

function InputBox(args: { update(val: number): void }) {
  return (
    <input
      className="number-input"
      type="text"
      onChange={(ev) => {
        const val = parseInt(ev.target.value);
        args.update(val);
      }}
    />
  );
}

type equationVals = {
  x: number;
  y: number;
  z: number;
  sum: number;
};

function Equation(args: { updater(arg0: equationVals): void }) {
  const state = {
    x: useState<number>(0),
    y: useState<number>(0),
    z: useState<number>(0),
    sum: useState<number>(0),
  };

  function update(stateVar: equationValKeys) {
    return (val: number) => {
      state[stateVar][1](val);

      const newEq: equationVals = {
        x: state.x[0],
        y: state.y[0],
        z: state.z[0],
        sum: state.sum[0],
      };

      newEq[stateVar] = val;

      args.updater(newEq);
    };
  }

  return (
    <div className="equation">
      <InputBox update={update("x")} />
      <p>x</p>
      <InputBox update={update("y")} />
      <p>y</p>
      <InputBox update={update("z")} />
      <p>z=</p>
      <InputBox update={update("sum")} />
    </div>
  );
}

function App() {
  const [eqs, updateEqs] = useState<equationVals[]>([]);

  function updateEq(index: number) {
    return (newEquation: equationVals) => {
      const newEqs = [...eqs];
      newEqs[index] = newEquation;
      updateEqs(newEqs);
    };
  }

  return (
    <>
      <div className="App">
        <header className="App-header">3 variable system solver</header>
        {[0, 1, 2].map((i) => (
          <Equation updater={updateEq(i)} key={i} />
        ))}
        {/* @ts-ignore */}
        {eqs.filter((a) => !!a).length === 3 ? solveSystem(eqs) : 0}
      </div>
    </>
  );
}

function eliminateVar(
  eqs: [equationVals, equationVals],
  varLetter: letter
): equationVals {
  eqs = JSON.parse(JSON.stringify(eqs));
  const mults = eqs.map((eq) => eq[varLetter]).reverse();

  let key: equationValKeys;
  for (const i in eqs) {
    for (key in eqs[i]) {
      eqs[i][key] *= mults[i];
    }
  }

  const outEq: any = {};
  for (key in eqs[0]) {
    outEq[key] = eqs[0][key] - eqs[1][key];
  }

  return outEq;
}

function getVar(eq: equationVals, letter: letter): number {
  return eq.sum / eq[letter];
}

function removeVal(
  eq: equationVals,
  letter: letter,
  value: number
): equationVals {
  eq = { ...eq };

  eq.sum -= eq[letter] * value;

  eq[letter] = 0;
  return eq;
}

function solveSystem(eqs: [equationVals, equationVals, equationVals]): string {
  const twoVarSys: [equationVals, equationVals] = [
    eliminateVar([eqs[0], eqs[1]], "x"),
    eliminateVar([eqs[0], eqs[2]], "x"),
  ];

  const z = getVar(eliminateVar(twoVarSys, "y"), "z");
  const y = getVar(removeVal(twoVarSys[0], "z", z), "y");
  const x = getVar(removeVal(removeVal(eqs[0], "z", z), "y", y), "x");

  return `x=${x},y=${y},z=${z},`;
}

export default App;
