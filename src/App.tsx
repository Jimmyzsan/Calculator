import React from "react";
import { ShippingCalculator } from "./components/calculator";
import "./App.css"
const App: React.FC = () => {
  return (
    <div className="App">
      <ShippingCalculator />
    </div>
  );
};

export default App;
